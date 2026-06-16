package com.studygroup.domain.goal.service;

import com.studygroup.domain.goal.dto.CreateGoalRequest;
import com.studygroup.domain.goal.dto.GoalResponse;
import com.studygroup.domain.goal.dto.UpdateGoalRequest;
import com.studygroup.domain.goal.dto.UpdateProgressRequest;
import com.studygroup.domain.goal.entity.StudyGoal;
import com.studygroup.domain.goal.repository.StudyGoalRepository;
import com.studygroup.domain.group.entity.StudyGroup;
import com.studygroup.domain.group.repository.StudyGroupRepository;
import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyGoalService {

    private final StudyGoalRepository studyGoalRepository;
    private final MembershipRepository membershipRepository;
    private final StudyGroupRepository studyGroupRepository;

    @Transactional
    public GoalResponse createGoal(Long groupId, CreateGoalRequest request, Long memberId) {
        validateMember(groupId, memberId);

        StudyGoal goal = StudyGoal.builder()
                .groupId(groupId)
                .creatorId(memberId)
                .title(request.getTitle())
                .description(request.getDescription())
                .unit(request.getUnit())
                .targetValue(request.getTargetValue())
                .dueDate(request.getDueDate())
                .build();

        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    public Page<GoalResponse> getGoals(Long groupId, Long memberId, Pageable pageable) {
        validateMember(groupId, memberId);
        return studyGoalRepository
                .findByGroupIdOrderByCompletedAscCreatedAtDesc(groupId, pageable)
                .map(GoalResponse::from);
    }

    public GoalResponse getGoal(Long groupId, Long goalId, Long memberId) {
        validateMember(groupId, memberId);
        return GoalResponse.from(getGoalInGroup(groupId, goalId));
    }

    @Transactional
    public GoalResponse updateGoal(Long groupId, Long goalId, UpdateGoalRequest request, Long memberId) {
        validateMember(groupId, memberId);
        StudyGoal goal = getGoalInGroup(groupId, goalId);
        ensureOwnerOrGroupOwner(goal, groupId, memberId);

        goal.update(
                request.getTitle(),
                request.getDescription(),
                request.getUnit(),
                request.getTargetValue(),
                request.getDueDate()
        );

        return GoalResponse.from(goal);
    }

    /** 진도 갱신은 그룹 멤버 누구나 가능 (협업) */
    @Transactional
    public GoalResponse updateProgress(Long groupId, Long goalId, UpdateProgressRequest request, Long memberId) {
        validateMember(groupId, memberId);
        StudyGoal goal = getGoalInGroup(groupId, goalId);

        goal.updateProgress(request.getCurrentValue());

        return GoalResponse.from(goal);
    }

    @Transactional
    public void deleteGoal(Long groupId, Long goalId, Long memberId) {
        validateMember(groupId, memberId);
        StudyGoal goal = getGoalInGroup(groupId, goalId);
        ensureOwnerOrGroupOwner(goal, groupId, memberId);

        studyGoalRepository.delete(goal);
    }

    private StudyGoal getGoalInGroup(Long groupId, Long goalId) {
        StudyGoal goal = studyGoalRepository.findById(goalId)
                .orElseThrow(() -> new CustomException(ErrorCode.GOAL_NOT_FOUND));
        if (!goal.getGroupId().equals(groupId)) {
            throw new CustomException(ErrorCode.GOAL_NOT_FOUND);
        }
        return goal;
    }

    private void ensureOwnerOrGroupOwner(StudyGoal goal, Long groupId, Long memberId) {
        if (goal.isOwnedBy(memberId)) {
            return;
        }
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));
        if (!group.isOwnedBy(memberId)) {
            throw new CustomException(ErrorCode.NOT_GOAL_OWNER);
        }
    }

    private void validateMember(Long groupId, Long memberId) {
        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));
        if (membership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.NOT_MEMBER);
        }
    }
}
