package com.studygroup.domain.board.repository;

/**
 * 게시글 ID별 집계(좋아요 수, 댓글 수)를 한 번의 쿼리로 가져오기 위한 프로젝션.
 */
public interface BoardCountProjection {
    Long getBoardId();
    Long getCount();
}
