package com.studygroup.domain.board.dto;

public record LikeResponse(
        boolean likedByMe,
        long likeCount
) {
}
