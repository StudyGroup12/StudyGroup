package com.studygroup.domain.schedule.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @Scheduled 활성화. 메인 애플리케이션 클래스를 수정하지 않고 schedule 도메인 내부에서 활성화한다.
 */
@Configuration
@EnableScheduling
public class ScheduleConfig {
}
