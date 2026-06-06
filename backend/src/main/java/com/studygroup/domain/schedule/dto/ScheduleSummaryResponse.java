package com.studygroup.domain.schedule.dto;

import com.studygroup.domain.schedule.entity.Schedule;

import java.time.LocalDateTime;

public record ScheduleSummaryResponse(
        Long id,
        Long groupId,
        String title,
        String location,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Long creatorId,
        String creatorNickname,
        LocalDateTime createdAt
) {
    public static ScheduleSummaryResponse of(Schedule schedule, String creatorNickname) {
        return new ScheduleSummaryResponse(
                schedule.getId(),
                schedule.getGroupId(),
                schedule.getTitle(),
                schedule.getLocation(),
                schedule.getStartAt(),
                schedule.getEndAt(),
                schedule.getCreatorId(),
                creatorNickname,
                schedule.getCreatedAt()
        );
    }
}
