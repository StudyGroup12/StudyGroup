package com.studygroup.domain.schedule.controller;

import com.studygroup.domain.schedule.dto.AttendanceEntryResponse;
import com.studygroup.domain.schedule.dto.AttendanceResponse;
import com.studygroup.domain.schedule.dto.CheckAttendanceRequest;
import com.studygroup.domain.schedule.service.AttendanceService;
import com.studygroup.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/schedules/{scheduleId}/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceEntryResponse>>> getAttendances(
            @PathVariable Long groupId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getAttendances(groupId, scheduleId, memberId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkMyAttendance(
            @PathVariable Long groupId,
            @PathVariable Long scheduleId,
            @RequestBody @Valid CheckAttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.checkMyAttendance(groupId, scheduleId, request, memberId)));
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> updateAttendance(
            @PathVariable Long groupId,
            @PathVariable Long scheduleId,
            @PathVariable("memberId") Long targetMemberId,
            @RequestBody @Valid CheckAttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long requesterId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.updateAttendance(groupId, scheduleId, targetMemberId, request, requesterId)));
    }

    private Long getMemberId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
