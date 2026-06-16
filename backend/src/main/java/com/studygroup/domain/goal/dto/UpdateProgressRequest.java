package com.studygroup.domain.goal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateProgressRequest {

    @NotNull(message = "진도 값을 입력해주세요.")
    @Min(value = 0, message = "진도 값은 0 이상이어야 합니다.")
    private Integer currentValue;
}
