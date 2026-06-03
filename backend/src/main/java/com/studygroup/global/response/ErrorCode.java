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

    // Group
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "GROUP001", "스터디 그룹을 찾을 수 없습니다."),
    GROUP_FULL(HttpStatus.BAD_REQUEST, "GROUP002", "스터디 그룹의 정원이 초과되었습니다."),
    NOT_GROUP_OWNER(HttpStatus.FORBIDDEN, "GROUP003", "스터디 그룹의 방장이 아닙니다."),

    // Membership
    MEMBERSHIP_NOT_FOUND(HttpStatus.NOT_FOUND, "MBR001", "가입 내역을 찾을 수 없습니다."),
    ALREADY_MEMBER(HttpStatus.BAD_REQUEST, "MBR002", "이미 가입되었거나 신청 대기 중인 그룹입니다."),
    NOT_MEMBER(HttpStatus.BAD_REQUEST, "MBR003", "그룹의 멤버가 아닙니다."),

    // Board
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "BOARD001", "게시글을 찾을 수 없습니다."),
    NOT_BOARD_AUTHOR(HttpStatus.FORBIDDEN, "BOARD002", "게시글 작성자가 아닙니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "BOARD003", "댓글을 찾을 수 없습니다."),
    NOT_COMMENT_AUTHOR(HttpStatus.FORBIDDEN, "BOARD004", "댓글 작성자가 아닙니다."),

    // Common
    NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON001", "요청한 리소스를 찾을 수 없습니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "COMMON002", "잘못된 입력입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON003", "서버 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
