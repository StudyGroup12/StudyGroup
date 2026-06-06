package com.studygroup.domain.schedule.dto;

import com.studygroup.domain.schedule.entity.AttendanceStatus;

import java.time.LocalDateTime;

/**
 * 일정 출석 명단의 한 행. 미체크 멤버는 status/checkedAt이 null.
 */
public record AttendanceEntryResponse(
        Long memberId,
        String nickname,
        AttendanceStatus status,
        LocalDateTime checkedAt
) {
}
