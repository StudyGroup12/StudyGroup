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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "attendances",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_attendances_schedule_member", columnNames = {"scheduleId", "memberId"})
        },
        indexes = {
                @Index(name = "idx_attendances_schedule", columnList = "scheduleId")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attendance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long scheduleId;

    @Column(nullable = false)
    private Long memberId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Column(nullable = false)
    private LocalDateTime checkedAt;

    @Builder
    public Attendance(Long scheduleId, Long memberId, AttendanceStatus status, LocalDateTime checkedAt) {
        this.scheduleId = scheduleId;
        this.memberId = memberId;
        this.status = status;
        this.checkedAt = checkedAt;
    }

    public void updateStatus(AttendanceStatus status, LocalDateTime checkedAt) {
        this.status = status;
        this.checkedAt = checkedAt;
    }
}
