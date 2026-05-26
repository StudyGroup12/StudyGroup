# Auth 도메인 개발 가이드

`domain/auth/` 패키지에서 구현할 내용이다.  
작업 전 반드시 [global-infrastructure.md](global-infrastructure.md)를 먼저 읽을 것.

---

## 구현 목록

| 파일 | 설명 |
|------|------|
| `entity/Member.java` | 회원 엔티티 |
| `repository/MemberRepository.java` | JPA 레포지토리 |
| `service/AuthService.java` | 회원가입, 로그인, 토큰 재발급 |
| `controller/AuthController.java` | REST API 엔드포인트 |
| `dto/` | 요청/응답 DTO |
| `global/security/CustomUserDetailsService.java` | **반드시 구현** (기존 stub 교체) |

---

## 1. Member 엔티티

```java
// domain/auth/entity/Member.java
@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt 해싱 필수

    @Column(nullable = false)
    private String nickname;

    @Builder
    public Member(String email, String password, String nickname) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
    }
}
```

---

## 2. CustomUserDetailsService 구현 (필수)

`global/security/CustomUserDetailsService.java`의 stub을 아래와 같이 교체한다.

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        Member member = memberRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        return User.builder()
                .username(String.valueOf(member.getId()))
                .password(member.getPassword())
                .roles("USER")
                .build();
    }
}
```

---

## 3. DTO

```java
// dto/SignupRequest.java
@Getter
public class SignupRequest {
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;

    @NotBlank
    private String nickname;
}

// dto/LoginRequest.java
@Getter
public class LoginRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}

// dto/TokenResponse.java
@Getter
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
}

// dto/MemberResponse.java
@Getter
@AllArgsConstructor
public class MemberResponse {
    private Long id;
    private String email;
    private String nickname;

    public static MemberResponse from(Member member) {
        return new MemberResponse(member.getId(), member.getEmail(), member.getNickname());
    }
}
```

---

## 4. AuthService

```java
// service/AuthService.java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public void signup(SignupRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();
        memberRepository.save(member);
    }

    public TokenResponse login(LoginRequest request, HttpServletResponse response) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtProvider.createAccessToken(member.getId());
        String refreshToken = jwtProvider.createRefreshToken(member.getId());

        // Refresh Token은 HttpOnly 쿠키로 전달
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(604800)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return new TokenResponse(accessToken);
    }

    public TokenResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
        Long userId = jwtProvider.getUserId(refreshToken);
        return new TokenResponse(jwtProvider.createAccessToken(userId));
    }

    public MemberResponse getMyPage(Long userId) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        return MemberResponse.from(member);
    }
}
```

---

## 5. AuthController

```java
// controller/AuthController.java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@RequestBody @Valid SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request, response)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @CookieValue("refreshToken") String refreshToken) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(refreshToken)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponse>> getMyPage(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(authService.getMyPage(userId)));
    }
}
```

---

## 6. MemberRepository

```java
// repository/MemberRepository.java
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

---

## API 엔드포인트 정리

| Method | URL | 인증 | 설명 |
|--------|-----|------|------|
| POST | `/api/auth/signup` | 불필요 | 회원가입 |
| POST | `/api/auth/login` | 불필요 | 로그인 |
| POST | `/api/auth/refresh` | 불필요 | 토큰 재발급 |
| GET | `/api/auth/me` | 필요 | 내 정보 조회 |

---

## 주의사항

- 비밀번호는 반드시 `BCryptPasswordEncoder`로 해싱 (`PasswordEncoder`는 `SecurityConfig`에 Bean으로 등록되어 있음)
- Refresh Token은 `HttpOnly` 쿠키로만 발급, `localStorage` 저장 금지
- `CustomUserDetailsService`의 stub 코드를 반드시 교체해야 JWT 인증이 동작함
- 다른 도메인에서 현재 로그인 사용자 ID가 필요하면 `@AuthenticationPrincipal UserDetails`로 꺼내 쓸 것
