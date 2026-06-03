package com.studygroup.domain.board.repository;

import com.studygroup.domain.board.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByBoardIdOrderByCreatedAtAsc(Long boardId);

    void deleteByBoardId(Long boardId);

    // 게시글 목록의 댓글 수를 한 번의 쿼리로 집계 (N+1 회피)
    @Query("SELECT c.boardId AS boardId, COUNT(c) AS count " +
            "FROM Comment c WHERE c.boardId IN :boardIds GROUP BY c.boardId")
    List<BoardCountProjection> countByBoardIdIn(@Param("boardIds") List<Long> boardIds);
}
