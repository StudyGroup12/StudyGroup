package com.studygroup.domain.stats.controller;

import com.studygroup.domain.stats.dto.GroupStatsResponse;
import com.studygroup.domain.stats.service.StatsService;
import com.studygroup.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/stats")
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    public ResponseEntity<ApiResponse<GroupStatsResponse>> getGroupStats(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(statsService.getGroupStats(groupId, memberId)));
    }
}
