package com.studygroup.domain.board.repository;

import com.studygroup.domain.board.entity.BoardLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardLikeRepository extends JpaRepository<BoardLike, Long> {

    Optional<BoardLike> findByBoardIdAndMemberId(Long boardId, Long memberId);

    boolean existsByBoardIdAndMemberId(Long boardId, Long memberId);

    long countByBoardId(Long boardId);

    void deleteByBoardId(Long boardId);

    // 게시글 목록의 좋아요 수를 한 번의 쿼리로 집계 (N+1 회피)
    @Query("SELECT bl.boardId AS boardId, COUNT(bl) AS count " +
            "FROM BoardLike bl WHERE bl.boardId IN :boardIds GROUP BY bl.boardId")
    List<BoardCountProjection> countByBoardIdIn(@Param("boardIds") List<Long> boardIds);
}
