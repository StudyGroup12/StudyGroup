package com.studygroup.domain.schedule.service;

import com.studygroup.domain.group.entity.StudyGroup;
import com.studygroup.domain.group.repository.StudyGroupRepository;
import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.domain.schedule.dto.NotificationResponse;
import com.studygroup.domain.schedule.dto.UnreadCountResponse;
import com.studygroup.domain.schedule.entity.Notification;
import com.studygroup.domain.schedule.entity.NotificationType;
import com.studygroup.domain.schedule.entity.Schedule;
import com.studygroup.domain.schedule.repository.NotificationRepository;
import com.studygroup.domain.schedule.repository.ScheduleRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MembershipRepository membershipRepository;
    private final ScheduleRepository scheduleRepository;
    private final StudyGroupRepository studyGroupRepository;

    /**
     * 일정 변경 시 그룹의 ACCEPTED 멤버 전원에게 알림 발송 (작성자 제외).
     * actorId가 null이면 시스템 발송(리마인더 등)으로 간주, 제외 없이 전원 발송.
     */
    @Transactional
    public void notifyGroupMembers(Schedule schedule, NotificationType type, Long actorId, String message) {
        List<Membership> accepted = membershipRepository
                .findByGroupIdAndStatus(schedule.getGroupId(), MembershipStatus.ACCEPTED);

        List<Notification> toCreate = new ArrayList<>();
        for (Membership m : accepted) {
            if (actorId != null && m.getMemberId().equals(actorId)) {
                continue;
            }
            toCreate.add(Notification.builder()
                    .recipientId(m.getMemberId())
                    .groupId(schedule.getGroupId())
                    .scheduleId(schedule.getId())
                    .type(type)
                    .message(message)
                    .build());
        }
        if (!toCreate.isEmpty()) {
            notificationRepository.saveAll(toCreate);
        }
    }

    /**
     * 스케줄러용: 시작 30분 전 ± 1분 사이에 들어온 일정에 대해 리마인더 발송.
     * Schedule.reminderSentAt이 null인 것만 대상.
     */
    @Transactional
    public void sendDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.plusMinutes(29);
        LocalDateTime windowEnd = now.plusMinutes(31);

        List<Schedule> due = scheduleRepository.findByReminderSentAtIsNullAndStartAtBetween(windowStart, windowEnd);
        for (Schedule s : due) {
            notifyGroupMembers(s, NotificationType.SCHEDULE_REMINDER, null, "곧 시작될 일정이 있습니다.");
            s.markReminderSent(now);
        }
    }

    public Page<NotificationResponse> getMyNotifications(Long memberId, Pageable pageable) {
        Page<Notification> page = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(memberId, pageable);
        Map<Long, String> groupNames = loadGroupNames(
                page.getContent().stream().map(Notification::getGroupId).distinct().toList()
        );
        return page.map(n -> NotificationResponse.of(
                n, groupNames.getOrDefault(n.getGroupId(), "(삭제된 그룹)")
        ));
    }

    public UnreadCountResponse getUnreadCount(Long memberId) {
        return new UnreadCountResponse(notificationRepository.countByRecipientIdAndReadAtIsNull(memberId));
    }

    @Transactional
    public NotificationResponse markRead(Long notificationId, Long memberId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));
        if (!n.isRecipient(memberId)) {
            throw new CustomException(ErrorCode.NOTIFICATION_FORBIDDEN);
        }
        n.markRead(LocalDateTime.now());
        String groupName = studyGroupRepository.findById(n.getGroupId())
                .map(StudyGroup::getName)
                .orElse("(삭제된 그룹)");
        return NotificationResponse.of(n, groupName);
    }

    private Map<Long, String> loadGroupNames(List<Long> groupIds) {
        if (groupIds.isEmpty()) {
            return Map.of();
        }
        return studyGroupRepository.findAllById(groupIds).stream()
                .collect(Collectors.toMap(StudyGroup::getId, StudyGroup::getName, (a, b) -> a));
    }

    @Transactional
    public int markAllRead(Long memberId) {
        return notificationRepository.markAllRead(memberId, LocalDateTime.now());
    }

    /** Schedule 삭제 시 호출 — 관련 알림 일괄 삭제. */
    @Transactional
    public void deleteByScheduleId(Long scheduleId) {
        notificationRepository.deleteByScheduleId(scheduleId);
    }
}
