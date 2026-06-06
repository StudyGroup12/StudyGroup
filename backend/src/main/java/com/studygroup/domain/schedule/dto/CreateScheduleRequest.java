package com.studygroup.domain.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class CreateScheduleRequest {

    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String title;

    @Size(max = 2000, message = "설명은 2000자 이하로 입력해주세요.")
    private String description;

    @Size(max = 200, message = "장소는 200자 이하로 입력해주세요.")
    private String location;

    @NotNull(message = "시작 시각을 입력해주세요.")
    private LocalDateTime startAt;

    @NotNull(message = "종료 시각을 입력해주세요.")
    private LocalDateTime endAt;
}
