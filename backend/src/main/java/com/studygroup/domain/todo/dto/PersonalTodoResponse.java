package com.studygroup.domain.todo.dto;

import com.studygroup.domain.todo.entity.PersonalTodo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PersonalTodoResponse(
        Long id,
        Long memberId,
        String title,
        String description,
        LocalDate dueDate,
        boolean completed,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PersonalTodoResponse from(PersonalTodo todo) {
        return new PersonalTodoResponse(
                todo.getId(),
                todo.getMemberId(),
                todo.getTitle(),
                todo.getDescription(),
                todo.getDueDate(),
                todo.isCompleted(),
                todo.getCompletedAt(),
                todo.getCreatedAt(),
                todo.getUpdatedAt()
        );
    }
}
