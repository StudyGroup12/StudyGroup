package com.studygroup.domain.schedule.dto;

import com.studygroup.domain.schedule.entity.Notification;
import com.studygroup.domain.schedule.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long groupId,
        String groupName,
        Long scheduleId,
        NotificationType type,
        String message,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse of(Notification n, String groupName) {
        return new NotificationResponse(
                n.getId(),
                n.getGroupId(),
                groupName,
                n.getScheduleId(),
                n.getType(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
