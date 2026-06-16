package com.studygroup.domain.goal.dto;

import com.studygroup.domain.goal.entity.StudyGoal;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record GoalResponse(
        Long id,
        Long groupId,
        Long creatorId,
        String title,
        String description,
        String unit,
        int targetValue,
        int currentValue,
        int progressRate,
        boolean completed,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static GoalResponse from(StudyGoal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getGroupId(),
                goal.getCreatorId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getUnit(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                goal.progressRate(),
                goal.isCompleted(),
                goal.getDueDate(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
