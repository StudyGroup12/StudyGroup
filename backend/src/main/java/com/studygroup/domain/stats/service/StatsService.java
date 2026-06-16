package com.studygroup.domain.stats.service;

import com.studygroup.domain.auth.entity.Member;
import com.studygroup.domain.auth.repository.MemberRepository;
import com.studygroup.domain.goal.repository.StudyGoalRepository;
import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.domain.schedule.entity.Attendance;
import com.studygroup.domain.schedule.entity.AttendanceStatus;
import com.studygroup.domain.schedule.entity.Schedule;
import com.studygroup.domain.schedule.repository.AttendanceRepository;
import com.studygroup.domain.schedule.repository.ScheduleRepository;
import com.studygroup.domain.stats.dto.GroupStatsResponse;
import com.studygroup.domain.stats.dto.GroupStatsResponse.AttendanceRankEntry;
import com.studygroup.domain.stats.dto.GroupStatsResponse.GoalStat;
import com.studygroup.domain.stats.dto.GroupStatsResponse.StudyTimeRankEntry;
import com.studygroup.domain.stats.dto.GroupStatsResponse.TodoStat;
import com.studygroup.domain.studytime.entity.StudySession;
import com.studygroup.domain.studytime.repository.StudySessionRepository;
import com.studygroup.domain.todo.repository.TodoRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {

    private final MembershipRepository membershipRepository;
    private final MemberRepository memberRepository;
    private final ScheduleRepository scheduleRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudySessionRepository studySessionRepository;
    private final TodoRepository todoRepository;
    private final StudyGoalRepository studyGoalRepository;

    public GroupStatsResponse getGroupStats(Long groupId, Long memberId) {
        validateMember(groupId, memberId);

        List<Membership> acceptedMemberships = membershipRepository
                .findByGroupIdAndStatus(groupId, MembershipStatus.ACCEPTED);
        List<Long> memberIds = acceptedMemberships.stream().map(Membership::getMemberId).toList();
        Map<Long, String> nicknames = memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getId, Member::getNickname, (a, b) -> a));

        List<AttendanceRankEntry> attendanceRanking =
                buildAttendanceRanking(groupId, memberIds, nicknames);
        int totalSchedules = scheduleRepository
                .findByGroupIdAndStartAtBefore(groupId, LocalDateTime.now()).size();

        List<StudyTimeRankEntry> studyTimeRanking =
                buildStudyTimeRanking(groupId, memberIds, nicknames);

        TodoStat todoStat = buildTodoStat(groupId);
        GoalStat goalStat = new GoalStat(
                studyGoalRepository.countByGroupId(groupId),
                studyGoalRepository.countByGroupIdAndCompleted(groupId, true)
        );

        return new GroupStatsResponse(totalSchedules, attendanceRanking, studyTimeRanking, todoStat, goalStat);
    }

    private List<AttendanceRankEntry> buildAttendanceRanking(
            Long groupId, List<Long> memberIds, Map<Long, String> nicknames) {

        List<Schedule> pastSchedules = scheduleRepository
                .findByGroupIdAndStartAtBefore(groupId, LocalDateTime.now());
        int totalSchedules = pastSchedules.size();
        List<Long> scheduleIds = pastSchedules.stream().map(Schedule::getId).toList();

        Map<Long, List<Attendance>> byMember = scheduleIds.isEmpty()
                ? Map.of()
                : attendanceRepository.findByScheduleIdIn(scheduleIds).stream()
                        .collect(Collectors.groupingBy(Attendance::getMemberId));

        return memberIds.stream()
                .map(id -> {
                    List<Attendance> records = byMember.getOrDefault(id, List.of());
                    long present = countStatus(records, AttendanceStatus.PRESENT);
                    long late = countStatus(records, AttendanceStatus.LATE);
                    long absent = countStatus(records, AttendanceStatus.ABSENT);
                    int rate = totalSchedules == 0
                            ? 0
                            : (int) Math.round(((present + late) * 100.0) / totalSchedules);
                    return new AttendanceRankEntry(
                            id, nicknames.getOrDefault(id, "알 수 없음"),
                            present, late, absent, rate);
                })
                .sorted(Comparator
                        .comparingInt(AttendanceRankEntry::attendanceRate).reversed()
                        .thenComparing(Comparator.comparingLong(AttendanceRankEntry::presentCount).reversed()))
                .toList();
    }

    private List<StudyTimeRankEntry> buildStudyTimeRanking(
            Long groupId, List<Long> memberIds, Map<Long, String> nicknames) {

        LocalDateTime startOfWeek = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();

        Map<Long, List<StudySession>> byMember = studySessionRepository.findByGroupId(groupId).stream()
                .filter(s -> !s.isRunning())
                .collect(Collectors.groupingBy(StudySession::getMemberId));

        return memberIds.stream()
                .map(id -> {
                    List<StudySession> sessions = byMember.getOrDefault(id, List.of());
                    long total = sessions.stream().mapToLong(StudySession::getDurationMinutes).sum();
                    long week = sessions.stream()
                            .filter(s -> !s.getStartedAt().isBefore(startOfWeek))
                            .mapToLong(StudySession::getDurationMinutes).sum();
                    return new StudyTimeRankEntry(
                            id, nicknames.getOrDefault(id, "알 수 없음"), week, total);
                })
                .sorted(Comparator.comparingLong(StudyTimeRankEntry::totalMinutes).reversed())
                .toList();
    }

    private TodoStat buildTodoStat(Long groupId) {
        long total = todoRepository.countByGroupId(groupId);
        long completed = todoRepository.countByGroupIdAndCompleted(groupId, true);
        int rate = total == 0 ? 0 : (int) Math.round((completed * 100.0) / total);
        return new TodoStat(total, completed, rate);
    }

    private long countStatus(List<Attendance> records, AttendanceStatus status) {
        return records.stream().filter(a -> a.getStatus() == status).count();
    }

    private void validateMember(Long groupId, Long memberId) {
        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));
        if (membership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.NOT_MEMBER);
        }
    }
}
