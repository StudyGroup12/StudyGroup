package com.studygroup.domain.goal.repository;

import com.studygroup.domain.goal.entity.StudyGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyGoalRepository extends JpaRepository<StudyGoal, Long> {

    Page<StudyGoal> findByGroupIdOrderByCompletedAscCreatedAtDesc(Long groupId, Pageable pageable);

    long countByGroupId(Long groupId);

    long countByGroupIdAndCompleted(Long groupId, boolean completed);
}
