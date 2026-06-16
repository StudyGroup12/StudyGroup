package com.studygroup.domain.schedule.repository;

import com.studygroup.domain.schedule.entity.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    Page<Schedule> findByGroupIdOrderByStartAtDesc(Long groupId, Pageable pageable);

    List<Schedule> findByGroupIdAndStartAtBetweenOrderByStartAtAsc(Long groupId, LocalDateTime from, LocalDateTime to);

    /** 통계용: 이미 시작된(지난) 일정 — 출석률 분모로 사용 */
    List<Schedule> findByGroupIdAndStartAtBefore(Long groupId, LocalDateTime time);

    /** 시작 30분 후 ± 1분 윈도우에 들어오면서 아직 리마인더 미발송인 일정. */
    List<Schedule> findByReminderSentAtIsNullAndStartAtBetween(LocalDateTime from, LocalDateTime to);
}
