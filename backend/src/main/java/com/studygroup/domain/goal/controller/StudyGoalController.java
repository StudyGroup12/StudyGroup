package com.studygroup.domain.goal.controller;

import com.studygroup.domain.goal.dto.CreateGoalRequest;
import com.studygroup.domain.goal.dto.GoalResponse;
import com.studygroup.domain.goal.dto.UpdateGoalRequest;
import com.studygroup.domain.goal.dto.UpdateProgressRequest;
import com.studygroup.domain.goal.service.StudyGoalService;
import com.studygroup.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/goals")
public class StudyGoalController {

    private final StudyGoalService studyGoalService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GoalResponse>>> getGoals(
            @PathVariable Long groupId,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(studyGoalService.getGoals(groupId, memberId, pageable)));
    }

    @GetMapping("/{goalId}")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoal(
            @PathVariable Long groupId,
            @PathVariable Long goalId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(studyGoalService.getGoal(groupId, goalId, memberId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @PathVariable Long groupId,
            @RequestBody @Valid CreateGoalRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(studyGoalService.createGoal(groupId, request, memberId)));
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @PathVariable Long groupId,
            @PathVariable Long goalId,
            @RequestBody @Valid UpdateGoalRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(studyGoalService.updateGoal(groupId, goalId, request, memberId)));
    }

    @PatchMapping("/{goalId}/progress")
    public ResponseEntity<ApiResponse<GoalResponse>> updateProgress(
            @PathVariable Long groupId,
            @PathVariable Long goalId,
            @RequestBody @Valid UpdateProgressRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(studyGoalService.updateProgress(groupId, goalId, request, memberId)));
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @PathVariable Long groupId,
            @PathVariable Long goalId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        studyGoalService.deleteGoal(groupId, goalId, memberId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private Long getMemberId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
