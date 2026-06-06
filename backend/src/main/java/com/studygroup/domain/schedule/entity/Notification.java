package com.studygroup.domain.schedule.entity;

import com.studygroup.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notifications_recipient", columnList = "recipientId,readAt"),
                @Index(name = "idx_notifications_schedule", columnList = "scheduleId")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recipientId;

    @Column(nullable = false)
    private Long groupId;

    /** 알림 종류에 따라 nullable (예: SCHEDULE_DELETED 후 scheduleId는 더 이상 유효 X 일 수 있지만 참조용으로 보관). */
    @Column(nullable = false)
    private Long scheduleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 300)
    private String message;

    /** null이면 안 읽음. */
    private LocalDateTime readAt;

    @Builder
    public Notification(Long recipientId, Long groupId, Long scheduleId, NotificationType type, String message) {
        this.recipientId = recipientId;
        this.groupId = groupId;
        this.scheduleId = scheduleId;
        this.type = type;
        this.message = message;
    }

    public boolean isRead() {
        return this.readAt != null;
    }

    public boolean isRecipient(Long memberId) {
        return this.recipientId.equals(memberId);
    }

    public void markRead(LocalDateTime readAt) {
        if (this.readAt == null) {
            this.readAt = readAt;
        }
    }
}
