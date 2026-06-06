package com.studygroup.domain.schedule.dto;

import com.studygroup.domain.schedule.entity.AttendanceStatus;

public record AttendanceSummaryResponse(
        long present,
        long late,
        long absent,
        long pending,
        AttendanceStatus myStatus
) {
}
