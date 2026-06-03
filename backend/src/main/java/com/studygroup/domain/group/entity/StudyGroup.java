package com.studygroup.domain.group.entity;

import com.studygroup.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "study_groups")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false)
    private Integer maxMemberCount;

    @Column(nullable = false)
    private Integer currentMemberCount;

    @Column(nullable = false)
    private Long ownerId;

    @Builder
    public StudyGroup(
            String name,
            String description,
            String category,
            Integer maxMemberCount,
            Long ownerId
    ) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.maxMemberCount = maxMemberCount;
        this.currentMemberCount = 1;
        this.ownerId = ownerId;
    }

    public void update(String name, String description, String category, Integer maxMemberCount) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.maxMemberCount = maxMemberCount;
    }

    public boolean isOwnedBy(Long memberId) {
        return this.ownerId.equals(memberId);
    }

    public void increaseMemberCount() {
        if (this.currentMemberCount >= this.maxMemberCount) {
            throw new IllegalStateException("그룹 정원이 가득 찼습니다.");
        }
        this.currentMemberCount++;
    }

    public void decreaseMemberCount() {
        if (this.currentMemberCount <= 1) {
            throw new IllegalStateException("멤버 수는 1명 미만일 수 없습니다.");
        }
        this.currentMemberCount--;
    }

    public void updateOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
