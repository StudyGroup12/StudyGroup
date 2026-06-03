package com.studygroup.domain.board.dto;

import com.studygroup.domain.board.entity.Board;

import java.time.LocalDateTime;

public record BoardSummaryResponse(
        Long id,
        String title,
        Long authorId,
        String authorNickname,
        long likeCount,
        long commentCount,
        LocalDateTime createdAt
) {

    public static BoardSummaryResponse of(Board board, String authorNickname, long likeCount, long commentCount) {
        return new BoardSummaryResponse(
                board.getId(),
                board.getTitle(),
                board.getAuthorId(),
                authorNickname,
                likeCount,
                commentCount,
                board.getCreatedAt()
        );
    }
}
