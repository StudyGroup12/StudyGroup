package com.studygroup.domain.goal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class CreateGoalRequest {

    @NotBlank(message = "목표 제목을 입력해주세요.")
    @Size(max = 200, message = "목표 제목은 200자 이하로 입력해주세요.")
    private String title;

    @Size(max = 1000, message = "목표 설명은 1000자 이하로 입력해주세요.")
    private String description;

    @NotBlank(message = "단위를 입력해주세요. (예: 장, 페이지, 회)")
    @Size(max = 20, message = "단위는 20자 이하로 입력해주세요.")
    private String unit;

    @NotNull(message = "목표치를 입력해주세요.")
    @Min(value = 1, message = "목표치는 1 이상이어야 합니다.")
    @Max(value = 100000, message = "목표치가 너무 큽니다.")
    private Integer targetValue;

    private LocalDate dueDate;
}
