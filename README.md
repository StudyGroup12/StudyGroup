# StudyGroup

스터디 그룹을 생성하고 멤버를 모집·관리하며, 함께 일정과 할일을 공유하는 **스터디 그룹 관리 서비스**입니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 인증 / 회원관리 | 회원가입, JWT 로그인, 마이페이지 |
| 스터디 그룹 | 그룹 생성·조회·수정·삭제, 키워드 검색 |
| 멤버십 | 가입 신청, 승인·거절, 멤버 관리 |
| 게시판 | 그룹 내 게시글·댓글·좋아요 |
| 일정 / 출석 | 캘린더, 일정 등록, 출석 체크 |
| 할일 (Todo) | 그룹 공동 할일, 개인 체크리스트, 진행률 |

## 기술 스택

| 분류 | 기술 |
|------|------|
| Backend | Java 21, Spring Boot 3, Spring Security, Spring Data JPA |
| Frontend | React 18, Vite, TypeScript, React Query, React Router |
| Database | H2 (파일 기반, 별도 설치 불필요) |
| Auth | JWT (Access Token + Refresh Token) |
| 개발 환경 | GitHub Codespaces |

## 시작하기 (GitHub Codespaces)

1. 저장소 페이지에서 `Code` → `Codespaces` → `Create codespace on dev` 클릭
2. Codespace가 열리면 터미널에서 아래 명령어 실행

```bash
# Backend (포트 8080)
cd backend
./gradlew bootRun

# Frontend (포트 5173) — 새 터미널에서
cd frontend
npm run dev
```

3. Vite 서버가 뜨면 Codespaces가 자동으로 브라우저 탭을 열어준다.

> DB는 H2를 사용하므로 별도 설치 없이 바로 실행 가능하다.  
> H2 콘솔: 백엔드 실행 후 포트 8080의 `/h2-console` 접속 (JDBC URL: `jdbc:h2:file:./data/studygroup`, username: `sa`, password: 없음)

## 프로젝트 구조

```
StudyGroup/
├── .devcontainer/   # Codespaces 환경 설정
├── backend/         # Spring Boot
├── frontend/        # React + Vite
└── docs/            # 개발 가이드 문서
```

백엔드는 도메인별 패키지(`auth`, `group`, `membership`, `board`, `schedule`, `todo`)로 분리되어 있으며, 팀원 각자가 담당 도메인을 독립적으로 개발한다.
