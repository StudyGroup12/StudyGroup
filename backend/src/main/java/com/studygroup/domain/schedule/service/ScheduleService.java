package com.studygroup.domain.schedule.service;

import com.studygroup.domain.auth.entity.Member;
import com.studygroup.domain.auth.repository.MemberRepository;
import com.studygroup.domain.group.entity.StudyGroup;
import com.studygroup.domain.group.repository.StudyGroupRepository;
import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.domain.schedule.dto.AttendanceSummaryResponse;
import com.studygroup.domain.schedule.dto.CreateScheduleRequest;
import com.studygroup.domain.schedule.dto.ScheduleDetailResponse;
import com.studygroup.domain.schedule.dto.ScheduleSummaryResponse;
import com.studygroup.domain.schedule.dto.UpdateScheduleRequest;
import com.studygroup.domain.schedule.entity.Attendance;
import com.studygroup.domain.schedule.entity.AttendanceStatus;
import com.studygroup.domain.schedule.entity.NotificationType;
import com.studygroup.domain.schedule.entity.Schedule;
import com.studygroup.domain.schedule.repository.AttendanceRepository;
import com.studygroup.domain.schedule.repository.ScheduleRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private static final int MAX_CALENDAR_RANGE_DAYS = 62;

    private final ScheduleRepository scheduleRepository;
    private final AttendanceRepository attendanceRepository;
    private final MembershipRepository membershipRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    @Transactional
    public ScheduleDetailResponse createSchedule(Long groupId, CreateScheduleRequest request, Long memberId) {
        validateMember(groupId, memberId);
        validateTimeRange(request.getStartAt(), request.getEndAt());

        Schedule schedule = Schedule.builder()
                .groupId(groupId)
                .creatorId(memberId)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .build();
        Schedule saved = scheduleRepository.save(schedule);

        notificationService.notifyGroupMembers(
                saved,
                NotificationType.SCHEDULE_CREATED,
                memberId,
                "일정이 등록되었습니다."
        );

        return toDetailResponse(saved, memberId);
    }

    public Page<ScheduleSummaryResponse> getSchedules(Long groupId, Long memberId, Pageable pageable) {
        validateMember(groupId, memberId);

        Page<Schedule> page = scheduleRepository.findByGroupIdOrderByStartAtDesc(groupId, pageable);
        Map<Long, String> nicknames = getNicknames(
                page.getContent().stream().map(Schedule::getCreatorId).distinct().toList()
        );
        return page.map(s -> ScheduleSummaryResponse.of(s, nicknames.getOrDefault(s.getCreatorId(), "알 수 없음")));
    }

    public List<ScheduleSummaryResponse> getCalendar(Long groupId, Long memberId, LocalDateTime from, LocalDateTime to) {
        validateMember(groupId, memberId);
        validateCalendarRange(from, to);

        List<Schedule> list = scheduleRepository
                .findByGroupIdAndStartAtBetweenOrderByStartAtAsc(groupId, from, to);
        Map<Long, String> nicknames = getNicknames(
                list.stream().map(Schedule::getCreatorId).distinct().toList()
        );
        return list.stream()
                .map(s -> ScheduleSummaryResponse.of(s, nicknames.getOrDefault(s.getCreatorId(), "알 수 없음")))
                .toList();
    }

    public ScheduleDetailResponse getSchedule(Long groupId, Long scheduleId, Long memberId) {
        validateMember(groupId, memberId);
        Schedule schedule = getSchedule(scheduleId, groupId);
        return toDetailResponse(schedule, memberId);
    }

    @Transactional
    public ScheduleDetailResponse updateSchedule(Long groupId, Long scheduleId, UpdateScheduleRequest request, Long memberId) {
        validateMember(groupId, memberId);
        validateTimeRange(request.getStartAt(), request.getEndAt());
        Schedule schedule = getSchedule(scheduleId, groupId);
        ensureAuthorOrOwner(schedule, groupId, memberId);

        schedule.update(
                request.getTitle(),
                request.getDescription(),
                request.getLocation(),
                request.getStartAt(),
                request.getEndAt()
        );

        notificationService.notifyGroupMembers(
                schedule,
                NotificationType.SCHEDULE_UPDATED,
                memberId,
                "일정이 변경되었습니다."
        );

        return toDetailResponse(schedule, memberId);
    }

    @Transactional
    public void deleteSchedule(Long groupId, Long scheduleId, Long memberId) {
        validateMember(groupId, memberId);
        Schedule schedule = getSchedule(scheduleId, groupId);
        ensureAuthorOrOwner(schedule, groupId, memberId);

        // 알림은 삭제 전에 발송 (제목을 메시지에 남겨서 수신자가 어떤 일정이었는지 식별 가능)
        notificationService.notifyGroupMembers(
                schedule,
                NotificationType.SCHEDULE_DELETED,
                memberId,
                "일정이 삭제되었습니다: " + schedule.getTitle()
        );

        attendanceRepository.deleteByScheduleId(scheduleId);
        notificationService.deleteByScheduleId(scheduleId);
        scheduleRepository.delete(schedule);
    }

    // --- 내부 헬퍼 ---

    private Schedule getSchedule(Long scheduleId, Long groupId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));
        // 다른 그룹 일정을 URL 조작으로 접근하는 것을 차단
        if (!schedule.getGroupId().equals(groupId)) {
            throw new CustomException(ErrorCode.SCHEDULE_NOT_FOUND);
        }
        return schedule;
    }

    private void ensureAuthorOrOwner(Schedule schedule, Long groupId, Long memberId) {
        if (schedule.isCreator(memberId)) {
            return;
        }
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));
        if (!group.isOwnedBy(memberId)) {
            throw new CustomException(ErrorCode.NOT_SCHEDULE_AUTHOR);
        }
    }

    private void validateMember(Long groupId, Long memberId) {
        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));
        if (membership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.NOT_MEMBER);
        }
    }

    private void validateTimeRange(LocalDateTime startAt, LocalDateTime endAt) {
        if (!startAt.isBefore(endAt)) {
            throw new CustomException(ErrorCode.INVALID_SCHEDULE_TIME);
        }
    }

    private void validateCalendarRange(LocalDateTime from, LocalDateTime to) {
        if (from == null || to == null || !from.isBefore(to)) {
            throw new CustomException(ErrorCode.INVALID_SCHEDULE_RANGE);
        }
        if (Duration.between(from, to).toDays() > MAX_CALENDAR_RANGE_DAYS) {
            throw new CustomException(ErrorCode.INVALID_SCHEDULE_RANGE);
        }
    }

    private ScheduleDetailResponse toDetailResponse(Schedule schedule, Long viewerId) {
        String nickname = memberRepository.findById(schedule.getCreatorId())
                .map(Member::getNickname)
                .orElse("알 수 없음");

        long present = attendanceRepository.countByScheduleIdAndStatus(schedule.getId(), AttendanceStatus.PRESENT);
        long late = attendanceRepository.countByScheduleIdAndStatus(schedule.getId(), AttendanceStatus.LATE);
        long absent = attendanceRepository.countByScheduleIdAndStatus(schedule.getId(), AttendanceStatus.ABSENT);

        // 미응답 = ACCEPTED 멤버 수 - (체크한 멤버 수)
        long acceptedMemberCount = membershipRepository
                .findByGroupIdAndStatus(schedule.getGroupId(), MembershipStatus.ACCEPTED).size();
        long checked = present + late + absent;
        long pending = Math.max(0, acceptedMemberCount - checked);

        AttendanceStatus myStatus = attendanceRepository
                .findByScheduleIdAndMemberId(schedule.getId(), viewerId)
                .map(Attendance::getStatus)
                .orElse(null);

        AttendanceSummaryResponse summary = new AttendanceSummaryResponse(present, late, absent, pending, myStatus);
        return ScheduleDetailResponse.of(schedule, nickname, summary);
    }

    private Map<Long, String> getNicknames(List<Long> memberIds) {
        if (memberIds.isEmpty()) {
            return Map.of();
        }
        return memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getId, Member::getNickname, (a, b) -> a));
    }
}
