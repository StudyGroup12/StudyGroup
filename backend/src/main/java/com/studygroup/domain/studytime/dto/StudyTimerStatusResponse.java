package com.studygroup.domain.studytime.dto;

import com.studygroup.domain.studytime.entity.StudySession;

import java.time.LocalDateTime;

/**
 * 그룹 내 본인의 학습 타이머 현황.
 * running=true면 startedAt이 현재 진행 중인 세션의 시작 시각.
 */
public record StudyTimerStatusResponse(
        boolean running,
        LocalDateTime startedAt,
        long todayMinutes,
        long weekMinutes,
        long totalMinutes
) {
    public static StudyTimerStatusResponse of(
            StudySession running, long todayMinutes, long weekMinutes, long totalMinutes) {
        return new StudyTimerStatusResponse(
                running != null,
                running != null ? running.getStartedAt() : null,
                todayMinutes,
                weekMinutes,
                totalMinutes
        );
    }
}
