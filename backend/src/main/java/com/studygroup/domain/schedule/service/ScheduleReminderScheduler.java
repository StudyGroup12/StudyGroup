package com.studygroup.domain.schedule.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduleReminderScheduler {

    private final NotificationService notificationService;

    /**
     * 1분마다 실행. 시작 30분 전 ± 1분 윈도우에 들어온 일정에 대해 리마인더 알림 발송.
     * Schedule.reminderSentAt 플래그로 중복 발송 방지.
     */
    @Scheduled(fixedRate = 60_000L)
    public void runReminderJob() {
        try {
            notificationService.sendDueReminders();
        } catch (Exception e) {
            // 스케줄러 내부 예외는 다음 실행에 영향 가지 않도록 swallow
            log.warn("schedule reminder job failed", e);
        }
    }
}
