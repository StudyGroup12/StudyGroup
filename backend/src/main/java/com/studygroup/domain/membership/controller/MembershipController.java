package com.studygroup.domain.membership.controller;

import com.studygroup.domain.membership.dto.MemberSummaryResponse;
import com.studygroup.domain.membership.dto.MembershipResponse;
import com.studygroup.domain.membership.service.MembershipService;
import com.studygroup.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/membership")
public class MembershipController {

    private final MembershipService membershipService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<MembershipResponse>> apply(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(membershipService.apply(groupId, memberId)));
    }

    @PostMapping("/approve/{targetMemberId}")
    public ResponseEntity<ApiResponse<Void>> approve(
            @PathVariable Long groupId,
            @PathVariable Long targetMemberId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long requesterId = getMemberId(userDetails);
        membershipService.approve(groupId, targetMemberId, requesterId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/reject/{targetMemberId}")
    public ResponseEntity<ApiResponse<Void>> reject(
            @PathVariable Long groupId,
            @PathVariable Long targetMemberId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long requesterId = getMemberId(userDetails);
        membershipService.reject(groupId, targetMemberId, requesterId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<MemberSummaryResponse>>> getMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.getMembers(groupId)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MembershipResponse>> getMyMembership(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(membershipService.getMyMembership(groupId, memberId)));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<MemberSummaryResponse>>> getPendingMembers(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long requesterId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(membershipService.getPendingMembers(groupId, requesterId)));
    }

    @DeleteMapping("/kick/{targetMemberId}")
    public ResponseEntity<ApiResponse<Void>> kick(
            @PathVariable Long groupId,
            @PathVariable Long targetMemberId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long requesterId = getMemberId(userDetails);
        membershipService.kick(groupId, targetMemberId, requesterId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PatchMapping("/delegate/{targetMemberId}")
    public ResponseEntity<ApiResponse<Void>> delegate(
            @PathVariable Long groupId,
            @PathVariable Long targetMemberId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long requesterId = getMemberId(userDetails);
        membershipService.delegate(groupId, targetMemberId, requesterId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/leave")
    public ResponseEntity<ApiResponse<Void>> leave(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        membershipService.leave(groupId, memberId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private Long getMemberId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
