package com.studygroup.domain.board.dto;

import com.studygroup.domain.board.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long boardId,
        Long authorId,
        String authorNickname,
        String content,
        LocalDateTime createdAt
) {

    public static CommentResponse of(Comment comment, String authorNickname) {
        return new CommentResponse(
                comment.getId(),
                comment.getBoardId(),
                comment.getAuthorId(),
                authorNickname,
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
