package com.studygroup.domain.membership.entity;

import com.studygroup.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "memberships")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Membership extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false)
    private Long groupId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipRole role;

    @Builder
    public Membership(Long memberId, Long groupId, MembershipStatus status, MembershipRole role) {
        this.memberId = memberId;
        this.groupId = groupId;
        this.status = status;
        this.role = role;
    }

    public void accept() {
        this.status = MembershipStatus.ACCEPTED;
    }

    public void reject() {
        this.status = MembershipStatus.REJECTED;
    }

    public void updateRole(MembershipRole role) {
        this.role = role;
    }
}
