package com.studygroup.domain.studytime.service;

import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.domain.studytime.dto.StudySessionResponse;
import com.studygroup.domain.studytime.dto.StudyTimerStatusResponse;
import com.studygroup.domain.studytime.entity.StudySession;
import com.studygroup.domain.studytime.repository.StudySessionRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final MembershipRepository membershipRepository;

    @Transactional
    public StudySessionResponse start(Long groupId, Long memberId) {
        validateMember(groupId, memberId);

        studySessionRepository.findByGroupIdAndMemberIdAndEndedAtIsNull(groupId, memberId)
                .ifPresent(s -> {
                    throw new CustomException(ErrorCode.STUDY_SESSION_ALREADY_RUNNING);
                });

        StudySession session = StudySession.builder()
                .groupId(groupId)
                .memberId(memberId)
                .startedAt(LocalDateTime.now())
                .build();

        return StudySessionResponse.from(studySessionRepository.save(session));
    }

    @Transactional
    public StudySessionResponse stop(Long groupId, Long memberId) {
        validateMember(groupId, memberId);

        StudySession running = studySessionRepository
                .findByGroupIdAndMemberIdAndEndedAtIsNull(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDY_SESSION_NOT_RUNNING));

        running.stop(LocalDateTime.now());
        return StudySessionResponse.from(running);
    }

    public StudyTimerStatusResponse getStatus(Long groupId, Long memberId) {
        validateMember(groupId, memberId);

        StudySession running = studySessionRepository
                .findByGroupIdAndMemberIdAndEndedAtIsNull(groupId, memberId)
                .orElse(null);

        List<StudySession> sessions = studySessionRepository.findByGroupIdAndMemberId(groupId, memberId);

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();

        long todayMinutes = sumMinutesSince(sessions, startOfToday);
        long weekMinutes = sumMinutesSince(sessions, startOfWeek);
        long totalMinutes = sessions.stream()
                .filter(s -> !s.isRunning())
                .mapToLong(StudySession::getDurationMinutes)
                .sum();

        return StudyTimerStatusResponse.of(running, todayMinutes, weekMinutes, totalMinutes);
    }

    private long sumMinutesSince(List<StudySession> sessions, LocalDateTime since) {
        return sessions.stream()
                .filter(s -> !s.isRunning())
                .filter(s -> !s.getStartedAt().isBefore(since))
                .mapToLong(StudySession::getDurationMinutes)
                .sum();
    }

    private void validateMember(Long groupId, Long memberId) {
        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));
        if (membership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.NOT_MEMBER);
        }
    }
}
