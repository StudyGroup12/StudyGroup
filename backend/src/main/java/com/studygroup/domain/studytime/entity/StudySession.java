package com.studygroup.domain.studytime.entity;

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

import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "study_sessions",
        indexes = {
                @Index(name = "idx_study_sessions_group", columnList = "groupId"),
                @Index(name = "idx_study_sessions_group_member", columnList = "groupId,memberId")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudySession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long groupId;

    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    // 진행 중인 세션은 endedAt = null
    private LocalDateTime endedAt;

    @Column(nullable = false)
    private int durationMinutes;

    @Builder
    public StudySession(Long groupId, Long memberId, LocalDateTime startedAt) {
        this.groupId = groupId;
        this.memberId = memberId;
        this.startedAt = startedAt;
        this.durationMinutes = 0;
    }

    public void stop(LocalDateTime endedAt) {
        this.endedAt = endedAt;
        long minutes = Duration.between(startedAt, endedAt).toMinutes();
        this.durationMinutes = (int) Math.max(0, minutes);
    }

    public boolean isRunning() {
        return endedAt == null;
    }
}
