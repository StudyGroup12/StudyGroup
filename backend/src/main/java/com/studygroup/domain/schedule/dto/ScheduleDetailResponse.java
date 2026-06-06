package com.studygroup.domain.schedule.dto;

import com.studygroup.domain.schedule.entity.Schedule;

import java.time.LocalDateTime;

public record ScheduleDetailResponse(
        Long id,
        Long groupId,
        String title,
        String description,
        String location,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Long creatorId,
        String creatorNickname,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        AttendanceSummaryResponse attendance
) {
    public static ScheduleDetailResponse of(
            Schedule schedule,
            String creatorNickname,
            AttendanceSummaryResponse attendance
    ) {
        return new ScheduleDetailResponse(
                schedule.getId(),
                schedule.getGroupId(),
                schedule.getTitle(),
                schedule.getDescription(),
                schedule.getLocation(),
                schedule.getStartAt(),
                schedule.getEndAt(),
                schedule.getCreatorId(),
                creatorNickname,
                schedule.getCreatedAt(),
                schedule.getUpdatedAt(),
                attendance
        );
    }
}
