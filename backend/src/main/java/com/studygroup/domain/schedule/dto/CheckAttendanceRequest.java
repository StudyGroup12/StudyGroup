package com.studygroup.domain.schedule.dto;

import com.studygroup.domain.schedule.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CheckAttendanceRequest {

    @NotNull(message = "출석 상태를 입력해주세요.")
    private AttendanceStatus status;
}
