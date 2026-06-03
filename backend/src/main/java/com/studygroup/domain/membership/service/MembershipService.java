package com.studygroup.domain.membership.service;

import com.studygroup.domain.auth.entity.Member;
import com.studygroup.domain.auth.repository.MemberRepository;
import com.studygroup.domain.group.entity.StudyGroup;
import com.studygroup.domain.group.repository.StudyGroupRepository;
import com.studygroup.domain.membership.dto.MemberSummaryResponse;
import com.studygroup.domain.membership.dto.MembershipResponse;
import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipRole;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public MembershipResponse apply(Long groupId, Long memberId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        if (membershipRepository.existsByGroupIdAndMemberId(groupId, memberId)) {
            throw new CustomException(ErrorCode.ALREADY_MEMBER);
        }

        if (group.getCurrentMemberCount() >= group.getMaxMemberCount()) {
            throw new CustomException(ErrorCode.GROUP_FULL);
        }

        Membership membership = Membership.builder()
                .groupId(groupId)
                .memberId(memberId)
                .status(MembershipStatus.PENDING)
                .role(MembershipRole.MEMBER)
                .build();

        return new MembershipResponse(membershipRepository.save(membership));
    }

    @Transactional
    public void approve(Long groupId, Long targetMemberId, Long requesterId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getOwnerId().equals(requesterId)) {
            throw new CustomException(ErrorCode.NOT_GROUP_OWNER);
        }

        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, targetMemberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBERSHIP_NOT_FOUND));

        if (membership.getStatus() != MembershipStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        if (group.getCurrentMemberCount() >= group.getMaxMemberCount()) {
            throw new CustomException(ErrorCode.GROUP_FULL);
        }

        membership.accept();
        group.increaseMemberCount();
    }

    @Transactional
    public void reject(Long groupId, Long targetMemberId, Long requesterId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getOwnerId().equals(requesterId)) {
            throw new CustomException(ErrorCode.NOT_GROUP_OWNER);
        }

        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, targetMemberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBERSHIP_NOT_FOUND));

        membership.reject();
    }

    public List<MemberSummaryResponse> getMembers(Long groupId) {
        return getMembersByStatus(groupId, MembershipStatus.ACCEPTED);
    }

    public MembershipResponse getMyMembership(Long groupId, Long memberId) {
        return membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .map(MembershipResponse::new)
                .orElse(null);
    }

    public List<MemberSummaryResponse> getPendingMembers(Long groupId, Long requesterId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getOwnerId().equals(requesterId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        return getMembersByStatus(groupId, MembershipStatus.PENDING);
    }

    private List<MemberSummaryResponse> getMembersByStatus(Long groupId, MembershipStatus status) {
        List<Membership> memberships = membershipRepository.findByGroupIdAndStatus(groupId, status);
        
        return memberships.stream()
                .map(membership -> {
                    Member member = memberRepository.findById(membership.getMemberId())
                            .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
                    return new MemberSummaryResponse(member, membership);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void leave(Long groupId, Long memberId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));

        if (membership.getRole() == MembershipRole.OWNER) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        membershipRepository.delete(membership);
        group.decreaseMemberCount();
    }

    @Transactional
    public void kick(Long groupId, Long targetMemberId, Long requesterId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getOwnerId().equals(requesterId)) {
            throw new CustomException(ErrorCode.NOT_GROUP_OWNER);
        }

        if (targetMemberId.equals(requesterId)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, targetMemberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBERSHIP_NOT_FOUND));

        membershipRepository.delete(membership);
        group.decreaseMemberCount();
    }

    @Transactional
    public void delegate(Long groupId, Long targetMemberId, Long requesterId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getOwnerId().equals(requesterId)) {
            throw new CustomException(ErrorCode.NOT_GROUP_OWNER);
        }

        if (targetMemberId.equals(requesterId)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        Membership currentOwnerMembership = membershipRepository.findByGroupIdAndMemberId(groupId, requesterId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBERSHIP_NOT_FOUND));

        Membership newOwnerMembership = membershipRepository.findByGroupIdAndMemberId(groupId, targetMemberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBERSHIP_NOT_FOUND));

        if (newOwnerMembership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        currentOwnerMembership.updateRole(MembershipRole.MEMBER);
        newOwnerMembership.updateRole(MembershipRole.OWNER);
        group.updateOwnerId(targetMemberId);
    }
}
