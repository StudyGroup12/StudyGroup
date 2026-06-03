package com.studygroup.domain.board.controller;

import com.studygroup.domain.board.dto.BoardDetailResponse;
import com.studygroup.domain.board.dto.BoardSummaryResponse;
import com.studygroup.domain.board.dto.CreateBoardRequest;
import com.studygroup.domain.board.dto.LikeResponse;
import com.studygroup.domain.board.dto.UpdateBoardRequest;
import com.studygroup.domain.board.service.BoardService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/boards")
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BoardSummaryResponse>>> getBoards(
            @PathVariable Long groupId,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(boardService.getBoards(groupId, memberId, pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BoardDetailResponse>> createBoard(
            @PathVariable Long groupId,
            @RequestBody @Valid CreateBoardRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(boardService.createBoard(groupId, request, memberId)));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<ApiResponse<BoardDetailResponse>> getBoard(
            @PathVariable Long groupId,
            @PathVariable Long boardId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(boardService.getBoard(groupId, boardId, memberId)));
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<ApiResponse<BoardDetailResponse>> updateBoard(
            @PathVariable Long groupId,
            @PathVariable Long boardId,
            @RequestBody @Valid UpdateBoardRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(boardService.updateBoard(groupId, boardId, request, memberId)));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(
            @PathVariable Long groupId,
            @PathVariable Long boardId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        boardService.deleteBoard(groupId, boardId, memberId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/{boardId}/like")
    public ResponseEntity<ApiResponse<LikeResponse>> toggleLike(
            @PathVariable Long groupId,
            @PathVariable Long boardId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = getMemberId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(boardService.toggleLike(groupId, boardId, memberId)));
    }

    private Long getMemberId(UserDetails userDetails) {
        return Long.parseLong(userDetails.getUsername());
    }
}
