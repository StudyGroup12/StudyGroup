package com.studygroup.domain.goal.entity;

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

import java.time.LocalDate;

@Getter
@Entity
@Table(
        name = "study_goals",
        indexes = {
                @Index(name = "idx_study_goals_group", columnList = "groupId"),
                @Index(name = "idx_study_goals_group_completed", columnList = "groupId,completed")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyGoal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long groupId;

    @Column(nullable = false)
    private Long creatorId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    // 단위 (예: "장", "페이지", "회") — 진도 표현용
    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false)
    private int targetValue;

    @Column(nullable = false)
    private int currentValue;

    @Column(nullable = false)
    private boolean completed;

    private LocalDate dueDate;

    @Builder
    public StudyGoal(Long groupId, Long creatorId, String title, String description,
                     String unit, int targetValue, LocalDate dueDate) {
        this.groupId = groupId;
        this.creatorId = creatorId;
        this.title = title;
        this.description = description;
        this.unit = unit;
        this.targetValue = targetValue;
        this.currentValue = 0;
        this.completed = false;
        this.dueDate = dueDate;
    }

    public void update(String title, String description, String unit, int targetValue, LocalDate dueDate) {
        this.title = title;
        this.description = description;
        this.unit = unit;
        this.targetValue = targetValue;
        this.dueDate = dueDate;
        // 목표치가 줄어 현재치가 이를 넘으면 보정
        if (this.currentValue > targetValue) {
            this.currentValue = targetValue;
        }
        this.completed = this.currentValue >= this.targetValue;
    }

    public void updateProgress(int currentValue) {
        this.currentValue = Math.max(0, Math.min(currentValue, this.targetValue));
        this.completed = this.currentValue >= this.targetValue;
    }

    public boolean isOwnedBy(Long memberId) {
        return this.creatorId.equals(memberId);
    }

    public int progressRate() {
        return targetValue == 0 ? 0 : (int) Math.round((currentValue * 100.0) / targetValue);
    }
}
