package com.studygroup.global.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AUTH001", "로그인이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "AUTH002", "접근 권한이 없습니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH003", "만료된 토큰입니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH004", "유효하지 않은 토큰입니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "AUTH005", "이메일 또는 비밀번호가 올바르지 않습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "AUTH006", "이미 사용 중인 이메일입니다."),

    // Common
    NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON001", "요청한 리소스를 찾을 수 없습니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "COMMON002", "잘못된 입력입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON003", "서버 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
