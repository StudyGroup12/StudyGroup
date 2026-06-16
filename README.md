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
| CI / CD | GitHub Actions (빌드·테스트 자동화 + Server 레포 자동 배포) |

## 시작하기 (GitHub Codespaces)

> **데모 실행은 [`StudyGroup12/Server`](https://github.com/StudyGroup12/Server) 레포지토리에서 진행한다.**
> 이 레포(`StudyGroup`)의 `main` 브랜치에 변경이 머지되면 CI/CD 파이프라인이 빌드·테스트를 거쳐
> Server 레포의 `main`으로 코드를 자동 동기화한다. (자세한 내용은 [CI / CD](#ci--cd) 참고)

1. **Server 레포지토리**에서 `Code` → `Codespaces` → `Create codespace on main` 클릭
2. Codespace가 열리면 의존성이 자동 설치되며(`postCreateCommand`), 접속 시 최신 코드로 자동 동기화된다(`postAttachCommand`)
3. 터미널에서 아래 명령어로 서버를 실행한다

```bash
# Backend (포트 8080)
cd backend
./gradlew bootRun

# Frontend (포트 5173) — 새 터미널에서
cd frontend
npm run dev
```

4. Vite 서버가 뜨면 Codespaces가 자동으로 브라우저 탭을 열어준다.

> DB는 H2를 사용하므로 별도 설치 없이 바로 실행 가능하다.  
> H2 콘솔: 백엔드 실행 후 포트 8080의 `/h2-console` 접속 (JDBC URL: `jdbc:h2:file:./data/studygroup`, username: `sa`, password: 없음)

## CI / CD

GitHub Actions로 **빌드·테스트 자동화(CI)** 와 **데모 환경 자동 배포(CD)** 를 구성했다.
워크플로우 정의: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

| 단계 | 실행 시점 | 내용 |
|------|-----------|------|
| **CI · Backend** | `main`·`dev`로의 push / PR | JDK 21 환경에서 `./gradlew build` (빌드 + 테스트) |
| **CI · Frontend** | `main`·`dev`로의 push / PR | Node 20에서 `npm ci` → `npm run lint` → `npm run build` |
| **CD · Deploy** | `main` push + CI 통과 시에만 | `StudyGroup12/Server`의 `main`으로 코드 자동 동기화 |

- **CI**: 모든 push와 PR마다 백엔드·프론트엔드를 병렬로 빌드·검증해, 깨지는 코드가 `main`에 들어가는 것을 막는다.
- **CD**: `main`에 머지되고 CI가 통과한 경우에만 데모용 미러인 Server 레포로 자동 반영된다. 따라서 코드를 머지하면 별도 수작업 없이 데모 환경이 최신 상태로 유지된다.
- 워크플로우 파일(`.github/workflows`)은 동기화 대상에서 제외되며, 배포에는 전용 토큰(`SERVER_SYNC_TOKEN` 시크릿)을 사용한다.

## 프로젝트 구조

```
StudyGroup/
├── .github/workflows/   # GitHub Actions CI/CD 파이프라인
├── .devcontainer/       # Codespaces 환경 설정
├── backend/             # Spring Boot
├── frontend/            # React + Vite
└── docs/                # 개발 가이드 문서
```

백엔드는 도메인별 패키지(`auth`, `group`, `membership`, `board`, `schedule`, `todo`)로 분리되어 있으며, 팀원 각자가 담당 도메인을 독립적으로 개발한다.
