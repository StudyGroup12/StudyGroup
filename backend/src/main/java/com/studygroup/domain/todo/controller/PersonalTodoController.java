package com.studygroup.domain.todo.controller;

import com.studygroup.domain.todo.dto.CompleteTodoRequest;
import com.studygroup.domain.todo.dto.CreateTodoRequest;
import com.studygroup.domain.todo.dto.PersonalTodoResponse;
import com.studygroup.domain.todo.dto.TodoProgressResponse;
import com.studygroup.domain.todo.dto.UpdateTodoRequest;
import com.studygroup.domain.todo.service.PersonalTodoService;
import com.studygroup.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/todos")
public class PersonalTodoController {

    private final PersonalTodoService personalTodoService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PersonalTodoResponse>>> getTodos(
            @RequestParam(required = false) Boolean completed,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(personalTodoService.getTodos(memberId, completed, pageable)));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<TodoProgressResponse>> getProgress(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(personalTodoService.getProgress(memberId)));
    }

    @GetMapping("/{todoId}")
    public ResponseEntity<ApiResponse<PersonalTodoResponse>> getTodo(
            @PathVariable Long todoId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(personalTodoService.getTodo(todoId, memberId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PersonalTodoResponse>> createTodo(
            @RequestBody @Valid CreateTodoRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(personalTodoService.createTodo(request, memberId)));
    }

    @PutMapping("/{todoId}")
    public ResponseEntity<ApiResponse<PersonalTodoResponse>> updateTodo(
            @PathVariable Long todoId,
            @RequestBody @Valid UpdateTodoRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(personalTodoService.updateTodo(todoId, request, memberId)));
    }

    @PatchMapping("/{todoId}/complete")
    public ResponseEntity<ApiResponse<PersonalTodoResponse>> updateComplete(
            @PathVariable Long todoId,
            @RequestBody @Valid CompleteTodoRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(personalTodoService.updateComplete(todoId, request, memberId)));
    }

    @DeleteMapping("/{todoId}")
    public ResponseEntity<ApiResponse<Void>> deleteTodo(
            @PathVariable Long todoId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        personalTodoService.deleteTodo(todoId, memberId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private Long getMemberId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
