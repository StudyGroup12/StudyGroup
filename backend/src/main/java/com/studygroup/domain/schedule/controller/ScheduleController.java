package com.studygroup.domain.schedule.controller;

import com.studygroup.domain.schedule.dto.CreateScheduleRequest;
import com.studygroup.domain.schedule.dto.ScheduleDetailResponse;
import com.studygroup.domain.schedule.dto.ScheduleSummaryResponse;
import com.studygroup.domain.schedule.dto.UpdateScheduleRequest;
import com.studygroup.domain.schedule.service.ScheduleService;
import com.studygroup.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleDetailResponse>> createSchedule(
            @PathVariable Long groupId,
            @RequestBody @Valid CreateScheduleRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.createSchedule(groupId, request, memberId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ScheduleSummaryResponse>>> getSchedules(
            @PathVariable Long groupId,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedules(groupId, memberId, pageable)));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<ScheduleSummaryResponse>>> getCalendar(
            @PathVariable Long groupId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getCalendar(groupId, memberId, from, to)));
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleDetailResponse>> getSchedule(
            @PathVariable Long groupId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedule(groupId, scheduleId, memberId)));
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleDetailResponse>> updateSchedule(
            @PathVariable Long groupId,
            @PathVariable Long scheduleId,
            @RequestBody @Valid UpdateScheduleRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(
                ApiResponse.success(scheduleService.updateSchedule(groupId, scheduleId, request, memberId)));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @PathVariable Long groupId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        scheduleService.deleteSchedule(groupId, scheduleId, memberId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private Long getMemberId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
