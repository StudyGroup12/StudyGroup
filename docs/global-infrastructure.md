# Global 인프라 가이드

`global/` 패키지는 모든 도메인이 공통으로 사용하는 기반 코드다.  
도메인 개발 전에 반드시 읽고 시작할 것.

---

## 패키지 구조

```
global/
├── config/
│   └── SecurityConfig.java          # Spring Security, CORS 설정
├── entity/
│   └── BaseEntity.java              # 공통 시간 필드 (모든 Entity 상속)
├── exception/
│   ├── CustomException.java         # 커스텀 예외
│   └── GlobalExceptionHandler.java  # 전역 예외 처리
├── jwt/
│   └── JwtProvider.java             # JWT 생성·검증
├── response/
│   ├── ApiResponse.java             # 공통 응답 형식
│   └── ErrorCode.java               # 에러 코드 enum
└── security/
    ├── JwtAuthenticationFilter.java  # JWT 인증 필터
    └── CustomUserDetailsService.java # ← auth 담당자가 구현
```

---

## 1. ApiResponse — 공통 응답 형식

모든 API 응답은 `ApiResponse<T>`로 감싸서 반환한다.

```java
// 데이터 반환
return ResponseEntity.ok(ApiResponse.success(responseDto));

// 데이터 없는 성공 (삭제 등)
return ResponseEntity.ok(ApiResponse.success());

// 생성 성공
return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(responseDto));
```

**응답 JSON 형식:**
```json
// 성공
{ "success": true, "data": { ... }, "error": null }

// 실패
{ "success": false, "data": null, "error": { "code": "AUTH001", "message": "로그인이 필요합니다." } }
```

---

## 2. ErrorCode — 에러 코드

에러 코드는 `ErrorCode` enum에 정의되어 있다.  
도메인에 필요한 에러 코드를 추가할 때는 `ErrorCode.java`에 직접 추가한다.

```java
// 현재 정의된 에러 코드
UNAUTHORIZED       // 401 - 로그인 필요
FORBIDDEN          // 403 - 권한 없음
EXPIRED_TOKEN      // 401 - 만료된 토큰
INVALID_TOKEN      // 401 - 유효하지 않은 토큰
INVALID_CREDENTIALS // 401 - 이메일/비밀번호 불일치
DUPLICATE_EMAIL    // 409 - 이메일 중복
NOT_FOUND          // 404 - 리소스 없음
INVALID_INPUT      // 400 - 잘못된 입력
INTERNAL_SERVER_ERROR // 500 - 서버 오류
```

**도메인별 에러 코드 추가 예시:**
```java
// ErrorCode.java에 추가
GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "GROUP001", "존재하지 않는 그룹입니다."),
ALREADY_MEMBER(HttpStatus.CONFLICT, "GROUP002", "이미 가입된 그룹입니다."),
```

---

## 3. CustomException — 예외 발생

서비스 레이어에서 비즈니스 예외가 발생하면 `CustomException`을 사용한다.  
`GlobalExceptionHandler`가 자동으로 잡아서 `ApiResponse` 형식으로 응답한다.

```java
// 사용 예시
if (!post.getAuthor().getId().equals(currentUserId)) {
    throw new CustomException(ErrorCode.FORBIDDEN);
}

Member member = memberRepository.findById(id)
    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
```

---

## 4. BaseEntity — 공통 시간 필드

모든 Entity는 `BaseEntity`를 상속해서 `createdAt`, `updatedAt`을 자동 관리한다.

```java
@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    // ...
}
```

---

## 5. JwtProvider — JWT 토큰

`auth` 도메인에서만 직접 사용한다. 다른 도메인은 SecurityContext에서 인증 정보를 꺼내 쓴다.

```java
// access token 발급
String accessToken = jwtProvider.createAccessToken(member.getId());

// refresh token 발급
String refreshToken = jwtProvider.createRefreshToken(member.getId());

// 토큰에서 userId 추출
Long userId = jwtProvider.getUserId(token);
```

---

## 6. 현재 로그인한 사용자 가져오기

컨트롤러에서 현재 인증된 사용자의 ID를 꺼내는 방법:

```java
@GetMapping("/me")
public ResponseEntity<ApiResponse<MyPageResponse>> getMyPage(
        @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = Long.parseLong(userDetails.getUsername());
    return ResponseEntity.ok(ApiResponse.success(memberService.getMyPage(userId)));
}
```

---

## 7. SecurityConfig — 공개 엔드포인트 추가

`/api/auth/**` 외에 인증 없이 접근 가능한 엔드포인트가 생기면 `SecurityConfig.java`의 아래 부분에 추가한다.

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/h2-console/**").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/groups").permitAll() // 예: 그룹 목록은 비로그인도 조회 가능
    .anyRequest().authenticated()
)
```

## 8. CORS — Codespaces 대응

CORS는 로컬(`localhost:5173`)과 GitHub Codespaces(`*.app.github.dev`) 모두 허용하도록 `setAllowedOriginPatterns`로 설정되어 있다.  
추가 origin이 필요하면 `SecurityConfig.java`의 `corsConfigurationSource()`에 패턴을 추가한다.

## 9. H2 콘솔

개발 중 DB 확인: 백엔드 실행 후 `/h2-console` 접속  
- JDBC URL: `jdbc:h2:file:./data/studygroup`
- Username: `sa` / Password: 없음
