package com.studygroup.domain.schedule.repository;

import com.studygroup.domain.schedule.entity.Attendance;
import com.studygroup.domain.schedule.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByScheduleId(Long scheduleId);

    List<Attendance> findByScheduleIdIn(List<Long> scheduleIds);

    Optional<Attendance> findByScheduleIdAndMemberId(Long scheduleId, Long memberId);

    long countByScheduleIdAndStatus(Long scheduleId, AttendanceStatus status);

    void deleteByScheduleId(Long scheduleId);
}
