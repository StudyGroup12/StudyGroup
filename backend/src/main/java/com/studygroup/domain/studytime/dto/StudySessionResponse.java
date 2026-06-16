package com.studygroup.domain.studytime.dto;

import com.studygroup.domain.studytime.entity.StudySession;

import java.time.LocalDateTime;

public record StudySessionResponse(
        Long id,
        Long groupId,
        Long memberId,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        int durationMinutes,
        boolean running
) {
    public static StudySessionResponse from(StudySession session) {
        return new StudySessionResponse(
                session.getId(),
                session.getGroupId(),
                session.getMemberId(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getDurationMinutes(),
                session.isRunning()
        );
    }
}
