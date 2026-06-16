package com.studygroup.domain.studytime.controller;

import com.studygroup.domain.studytime.dto.StudySessionResponse;
import com.studygroup.domain.studytime.dto.StudyTimerStatusResponse;
import com.studygroup.domain.studytime.service.StudySessionService;
import com.studygroup.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/study-sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudyTimerStatusResponse>> getStatus(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(studySessionService.getStatus(groupId, memberId)));
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<StudySessionResponse>> start(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(studySessionService.start(groupId, memberId)));
    }

    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<StudySessionResponse>> stop(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(studySessionService.stop(groupId, memberId)));
    }

    private Long getMemberId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
