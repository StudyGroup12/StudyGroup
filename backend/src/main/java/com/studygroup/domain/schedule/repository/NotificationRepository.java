package com.studygroup.domain.schedule.repository;

import com.studygroup.domain.schedule.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadAtIsNull(Long recipientId);

    void deleteByScheduleId(Long scheduleId);

    @Modifying
    @Query("UPDATE Notification n SET n.readAt = :readAt WHERE n.recipientId = :recipientId AND n.readAt IS NULL")
    int markAllRead(@Param("recipientId") Long recipientId, @Param("readAt") LocalDateTime readAt);
}
