# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

스터디 그룹 관리 서비스 — Spring Boot (backend) + React + Vite (frontend) + H2 DB
개발 환경: GitHub Codespaces

| 파트 | 도메인 |
|------|--------|
| 인증/회원관리 | auth |
| 스터디 그룹 | group |
| 멤버십/가입신청 | membership |
| 게시판/댓글 | board |
| 일정/출석 | schedule |
| 할일(Todo) | todo |

## Rules (반드시 읽을 것)

- **폴더 구조** → [`rules/structure.md`](rules/structure.md)
- **보안 규칙** → [`rules/security.md`](rules/security.md)
- **코드 컨벤션** → [`rules/conventions.md`](rules/conventions.md)

## Commands

```bash
# Backend (포트 8080)
cd backend
./gradlew bootRun
./gradlew test
./gradlew test --tests "*.ClassName"   # 단일 클래스 테스트

# Frontend (포트 5173)
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Database

H2 파일 기반 DB — 별도 설치 불필요, 앱 실행 시 자동 생성.  
H2 콘솔: `/h2-console` (JDBC URL: `jdbc:h2:file:./data/studygroup`, username: `sa`, password: 없음)

## Environment Variables

JWT Secret은 기본값이 설정되어 있어 별도 설정 없이 개발 가능.  
운영 환경 전환 시 `JWT_SECRET` 환경변수를 교체한다.

```yaml
jwt.secret: ${JWT_SECRET:local-dev-secret-key-change-this-in-production-minimum-32chars}
jwt.access-expiration: 1800000    # 30분
jwt.refresh-expiration: 604800000 # 7일
```
