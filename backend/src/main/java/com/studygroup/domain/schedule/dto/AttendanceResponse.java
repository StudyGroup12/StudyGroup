package com.studygroup.domain.schedule.dto;

import com.studygroup.domain.schedule.entity.AttendanceStatus;

import java.time.LocalDateTime;

public record AttendanceResponse(
        Long scheduleId,
        Long memberId,
        String nickname,
        AttendanceStatus status,
        LocalDateTime checkedAt,
        boolean autoAdjustedToLate
) {
}
