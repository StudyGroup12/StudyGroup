package com.studygroup.domain.stats.dto;

import java.util.List;

/**
 * 그룹 학습 통계 대시보드 응답.
 * - 출석 랭킹: 멤버별 출석률 (지난 일정 기준)
 * - 학습시간 랭킹: 멤버별 누적 학습시간
 * - 할일/목표 요약
 */
public record GroupStatsResponse(
        int totalSchedules,
        List<AttendanceRankEntry> attendanceRanking,
        List<StudyTimeRankEntry> studyTimeRanking,
        TodoStat todoStat,
        GoalStat goalStat
) {
    public record AttendanceRankEntry(
            Long memberId,
            String nickname,
            long presentCount,
            long lateCount,
            long absentCount,
            int attendanceRate
    ) {}

    public record StudyTimeRankEntry(
            Long memberId,
            String nickname,
            long weekMinutes,
            long totalMinutes
    ) {}

    public record TodoStat(
            long totalCount,
            long completedCount,
            int progressRate
    ) {}

    public record GoalStat(
            long totalCount,
            long completedCount
    ) {}
}
