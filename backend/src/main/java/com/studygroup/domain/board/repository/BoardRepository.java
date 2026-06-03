package com.studygroup.domain.board.repository;

import com.studygroup.domain.board.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {
    Page<Board> findByGroupId(Long groupId, Pageable pageable);
}
