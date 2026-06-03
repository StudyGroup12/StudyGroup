package com.studygroup.domain.board.dto;

import com.studygroup.domain.board.entity.Board;

import java.time.LocalDateTime;

public record BoardDetailResponse(
        Long id,
        Long groupId,
        String title,
        String content,
        Long authorId,
        String authorNickname,
        long likeCount,
        long commentCount,
        boolean likedByMe,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static BoardDetailResponse of(
            Board board,
            String authorNickname,
            long likeCount,
            long commentCount,
            boolean likedByMe
    ) {
        return new BoardDetailResponse(
                board.getId(),
                board.getGroupId(),
                board.getTitle(),
                board.getContent(),
                board.getAuthorId(),
                authorNickname,
                likeCount,
                commentCount,
                likedByMe,
                board.getCreatedAt(),
                board.getUpdatedAt()
        );
    }
}
