package com.studygroup.domain.studytime.repository;

import com.studygroup.domain.studytime.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    // 진행 중(종료되지 않은) 세션은 멤버당 최대 1개
    Optional<StudySession> findByGroupIdAndMemberIdAndEndedAtIsNull(Long groupId, Long memberId);

    List<StudySession> findByGroupIdAndMemberId(Long groupId, Long memberId);

    List<StudySession> findByGroupId(Long groupId);

    // 통계용: 종료된 세션이 특정 기간 안에 시작된 것
    List<StudySession> findByGroupIdAndEndedAtIsNotNullAndStartedAtGreaterThanEqual(
            Long groupId, LocalDateTime startedAt);
}
