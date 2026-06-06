package com.studygroup.domain.schedule.entity;

import com.studygroup.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
        name = "schedules",
        indexes = {
                @Index(name = "idx_schedules_group_start", columnList = "groupId,startAt"),
                @Index(name = "idx_schedules_reminder", columnList = "reminderSentAt,startAt")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Schedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long groupId;

    @Column(nullable = false)
    private Long creatorId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    /** 시작 30분 전 리마인더 발송 시각. null이면 아직 발송 안 됨. */
    private LocalDateTime reminderSentAt;

    @Builder
    public Schedule(
            Long groupId,
            Long creatorId,
            String title,
            String description,
            String location,
            LocalDateTime startAt,
            LocalDateTime endAt
    ) {
        this.groupId = groupId;
        this.creatorId = creatorId;
        this.title = title;
        this.description = description;
        this.location = location;
        this.startAt = startAt;
        this.endAt = endAt;
    }

    public void update(String title, String description, String location, LocalDateTime startAt, LocalDateTime endAt) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.startAt = startAt;
        this.endAt = endAt;
        // 시간이 변경되면 리마인더 재발송 가능하도록 플래그 초기화
        this.reminderSentAt = null;
    }

    public void markReminderSent(LocalDateTime sentAt) {
        this.reminderSentAt = sentAt;
    }

    public boolean isCreator(Long memberId) {
        return this.creatorId.equals(memberId);
    }
}
