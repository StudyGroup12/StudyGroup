package com.studygroup.domain.schedule.service;

import com.studygroup.domain.auth.entity.Member;
import com.studygroup.domain.auth.repository.MemberRepository;
import com.studygroup.domain.group.entity.StudyGroup;
import com.studygroup.domain.group.repository.StudyGroupRepository;
import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.domain.schedule.dto.AttendanceEntryResponse;
import com.studygroup.domain.schedule.dto.AttendanceResponse;
import com.studygroup.domain.schedule.dto.CheckAttendanceRequest;
import com.studygroup.domain.schedule.entity.Attendance;
import com.studygroup.domain.schedule.entity.AttendanceStatus;
import com.studygroup.domain.schedule.entity.Schedule;
import com.studygroup.domain.schedule.repository.AttendanceRepository;
import com.studygroup.domain.schedule.repository.ScheduleRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private static final int CHECK_WINDOW_BEFORE_MIN = 30;
    private static final int CHECK_WINDOW_AFTER_MIN = 30;
    private static final int LATE_THRESHOLD_MIN = 10;

    private final ScheduleRepository scheduleRepository;
    private final AttendanceRepository attendanceRepository;
    private final MembershipRepository membershipRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final MemberRepository memberRepository;

    public List<AttendanceEntryResponse> getAttendances(Long groupId, Long scheduleId, Long memberId) {
        validateMember(groupId, memberId);
        Schedule schedule = getScheduleInGroup(scheduleId, groupId);

        // 그룹의 ACCEPTED 멤버 전원 기준으로 명단 구성, 출석 레코드 없으면 null status
        List<Membership> memberships = membershipRepository
                .findByGroupIdAndStatus(schedule.getGroupId(), MembershipStatus.ACCEPTED);
        List<Long> memberIds = memberships.stream().map(Membership::getMemberId).toList();
        Map<Long, String> nicknames = memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getId, Member::getNickname, (a, b) -> a));

        Map<Long, Attendance> attendanceByMember = new HashMap<>();
        for (Attendance a : attendanceRepository.findByScheduleId(scheduleId)) {
            attendanceByMember.put(a.getMemberId(), a);
        }

        return memberIds.stream()
                .map(id -> {
                    Attendance a = attendanceByMember.get(id);
                    return new AttendanceEntryResponse(
                            id,
                            nicknames.getOrDefault(id, "알 수 없음"),
                            a != null ? a.getStatus() : null,
                            a != null ? a.getCheckedAt() : null
                    );
                })
                .toList();
    }

    @Transactional
    public AttendanceResponse checkMyAttendance(Long groupId, Long scheduleId, CheckAttendanceRequest request, Long memberId) {
        validateMember(groupId, memberId);
        Schedule schedule = getScheduleInGroup(scheduleId, groupId);

        LocalDateTime now = LocalDateTime.now();
        if (!isWithinCheckWindow(schedule, now)) {
            throw new CustomException(ErrorCode.ATTENDANCE_NOT_AVAILABLE);
        }

        AttendanceStatus requested = request.getStatus();
        AttendanceStatus finalStatus = requested;
        boolean autoAdjusted = false;
        if (requested == AttendanceStatus.PRESENT
                && now.isAfter(schedule.getStartAt().plusMinutes(LATE_THRESHOLD_MIN))) {
            finalStatus = AttendanceStatus.LATE;
            autoAdjusted = true;
        }

        Attendance saved = upsert(scheduleId, memberId, finalStatus, now);
        String nickname = memberRepository.findById(memberId)
                .map(Member::getNickname).orElse("알 수 없음");

        return new AttendanceResponse(
                saved.getScheduleId(),
                saved.getMemberId(),
                nickname,
                saved.getStatus(),
                saved.getCheckedAt(),
                autoAdjusted
        );
    }

    /**
     * 방장이 다른 멤버(또는 본인)의 출석을 수정.
     * 방장은 시점 제한 없음. 일반 멤버가 다른 사람 출석을 수정 시 403.
     */
    @Transactional
    public AttendanceResponse updateAttendance(
            Long groupId, Long scheduleId, Long targetMemberId,
            CheckAttendanceRequest request, Long requesterId
    ) {
        validateMember(groupId, requesterId);
        Schedule schedule = getScheduleInGroup(scheduleId, groupId);

        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));
        boolean isOwner = group.isOwnedBy(requesterId);
        boolean isSelf = requesterId.equals(targetMemberId);

        if (!isOwner && !isSelf) {
            throw new CustomException(ErrorCode.ATTENDANCE_FORBIDDEN);
        }

        // 본인이 본인 수정인 경우엔 체크 시점 제한 적용
        LocalDateTime now = LocalDateTime.now();
        if (isSelf && !isOwner) {
            if (!isWithinCheckWindow(schedule, now)) {
                throw new CustomException(ErrorCode.ATTENDANCE_NOT_AVAILABLE);
            }
        }

        // 대상 멤버가 그룹에 ACCEPTED 상태인지 확인
        Membership targetMembership = membershipRepository.findByGroupIdAndMemberId(groupId, targetMemberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));
        if (targetMembership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.NOT_MEMBER);
        }

        Attendance saved = upsert(scheduleId, targetMemberId, request.getStatus(), now);
        String nickname = memberRepository.findById(targetMemberId)
                .map(Member::getNickname).orElse("알 수 없음");

        return new AttendanceResponse(
                saved.getScheduleId(),
                saved.getMemberId(),
                nickname,
                saved.getStatus(),
                saved.getCheckedAt(),
                false
        );
    }

    // --- 내부 헬퍼 ---

    private Attendance upsert(Long scheduleId, Long memberId, AttendanceStatus status, LocalDateTime now) {
        return attendanceRepository.findByScheduleIdAndMemberId(scheduleId, memberId)
                .map(existing -> {
                    existing.updateStatus(status, now);
                    return existing;
                })
                .orElseGet(() -> attendanceRepository.save(Attendance.builder()
                        .scheduleId(scheduleId)
                        .memberId(memberId)
                        .status(status)
                        .checkedAt(now)
                        .build()));
    }

    private boolean isWithinCheckWindow(Schedule schedule, LocalDateTime now) {
        LocalDateTime windowStart = schedule.getStartAt().minusMinutes(CHECK_WINDOW_BEFORE_MIN);
        LocalDateTime windowEnd = schedule.getEndAt().plusMinutes(CHECK_WINDOW_AFTER_MIN);
        return !now.isBefore(windowStart) && !now.isAfter(windowEnd);
    }

    private Schedule getScheduleInGroup(Long scheduleId, Long groupId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));
        if (!schedule.getGroupId().equals(groupId)) {
            throw new CustomException(ErrorCode.SCHEDULE_NOT_FOUND);
        }
        return schedule;
    }

    private void validateMember(Long groupId, Long memberId) {
        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));
        if (membership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.NOT_MEMBER);
        }
    }
}
