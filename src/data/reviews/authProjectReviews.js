export const authProjectReviews = {
  "/golang": {
    "reviewedOn": "2026-09-14",
    "summary": "토큰 갱신의 신뢰 확인, 사용자별 권한 검사, 응답 정보 최소화가 우선입니다.",
    "items": [
      {
        "id": "go-access-trust",
        "priority": "high",
        "title": "토큰 갱신 때 사용자와 권한을 다시 확인하기",
        "observation": "만료된 Access Token의 서명을 확인하기 전에 그 안의 이메일·권한을 사용합니다. 요청한 Refresh Token과 Redis 저장값도 직접 대조하지 않습니다.",
        "impact": "유효한 갱신 토큰이 있는 조건에서, 바꿔 넣은 계정·권한이 새 토큰으로 이어질 여지가 있습니다.",
        "proposal": "검증한 Refresh Token과 저장된 로그인 정보를 대조하고 현재 사용자 권한으로 재발급할 필요가 있습니다. 로그아웃 때는 저장된 갱신 정보도 폐기해야 합니다.",
        "verification": "서명을 바꾼 토큰, 다른 계정의 갱신 토큰, 로그아웃 후 재사용이 모두 거절되는지 확인해야 합니다.",
        "references": [
          {
            "label": "Go: 검증 순서와 재발급",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/auth/jwt.go#L94"
          },
          {
            "label": "Go: 만료 오류를 처리하는 미들웨어",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/middleware/validator.go#L44"
          },
          {
            "label": "RFC 8725: JWT 검증 원칙",
            "href": "https://www.rfc-editor.org/rfc/rfc8725.html#section-3"
          },
          {
            "label": "Go: 요청 토큰 검사",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/middleware/validator.go#L57"
          },
          {
            "label": "Go: Redis 조회와 재발급",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/auth/jwt.go#L95"
          },
          {
            "label": "RFC 9700: Refresh Token 보호",
            "href": "https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14"
          },
          {
            "label": "Go: 쿠키만 지우는 로그아웃",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/login.go#L135"
          },
          {
            "label": "Go: 이전 권한을 사용하는 재발급",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/auth/jwt.go#L116"
          },
          {
            "label": "Go: 계정 수정·삭제",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/user.go#L91"
          }
        ]
      },
      {
        "id": "go-user-authorization",
        "priority": "high",
        "title": "본인 데이터만 수정하도록 권한 검사하기",
        "observation": "가입 요청에서 권한을 받고, 사용자 수정·삭제에서도 요청의 ID를 그대로 사용합니다.",
        "impact": "일반 사용자가 관리자 역할을 넣거나 다른 사용자의 정보를 바꿀 수 있는 경로가 있습니다.",
        "proposal": "가입 시 기본 권한은 서버가 정하고, 수정·삭제는 본인 또는 관리자만 허용하도록 보완할 필요가 있습니다.",
        "verification": "일반 사용자 두 명으로 타인 수정·삭제와 관리자 역할 요청이 거절되는지 확인해야 합니다.",
        "references": [
          {
            "label": "Go: 사용자 요청 처리",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/user.go#L18"
          },
          {
            "label": "Go: 사용자 모델의 permission 바인딩",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/domain/JwtUser.go#L7"
          },
          {
            "label": "Go: 라우트별 인증 범위",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/routing.go#L53"
          },
          {
            "label": "OWASP: 요청별 권한 검사",
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
          }
        ]
      },
      {
        "id": "go-response-minimization",
        "priority": "high",
        "title": "응답에서 비밀번호 해시와 토큰 빼기",
        "observation": "사용자 응답 객체에 비밀번호 해시가 포함되고, 별도 API는 토큰 원문을 반환합니다.",
        "impact": "화면에 필요 없는 인증 정보가 노출되어 계정 보호가 약해집니다.",
        "proposal": "응답용 객체에는 필요한 사용자 정보만 넣고, 토큰 원문 조회 API를 제거할 필요가 있습니다.",
        "verification": "사용자 조회·목록·수정 응답에 비밀번호 해시와 토큰이 없는지 확인해야 합니다.",
        "references": [
          {
            "label": "Go: 응답으로 반환하는 도메인 모델",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/domain/JwtUser.go#L7"
          },
          {
            "label": "Go: 사용자 응답",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/user.go#L49"
          },
          {
            "label": "Go: 토큰 조회 응답",
            "href": "https://github.com/hkpark130/go-jwt/blob/7df45739a9e451165a40ac539f2607e7c92eeada/api/handlers/login.go#L85"
          }
        ]
      }
    ]
  },
  "/springboot": {
    "reviewedOn": "2026-09-14",
    "summary": "기기별 로그인 관리와 브라우저 토큰 보호를 더 보완할 필요가 있습니다.",
    "items": [
      {
        "id": "spring-refresh-session",
        "priority": "medium",
        "implementation": "partial",
        "title": "로그인 기기별로 갱신 토큰 관리하기",
        "observation": "사용자 이름마다 Refresh Token 하나를 저장하고, 갱신해도 토큰을 바꾸지 않습니다.",
        "impact": "같은 토큰을 반복 사용할 수 있고, 기기별 로그인과 로그아웃을 구분하기 어렵습니다.",
        "proposal": "기기별 로그인 정보를 나누고, 갱신할 때 토큰을 교체해 이전 토큰의 재사용을 막을 필요가 있습니다.",
        "verification": "두 기기 로그인, 동시 갱신, 이전 토큰 재사용과 기기별 로그아웃을 확인해야 합니다.",
        "references": [
          {
            "label": "Spring: 로그인·갱신·로그아웃",
            "href": "https://github.com/hkpark130/Spring-Blog/blob/7599c95d0bf7442d0479f103e617bd58675e5f37/src/main/java/kr/p_e/hkpark130/springblog/service/UserService.java#L29"
          },
          {
            "label": "Spring: username별 토큰 저장",
            "href": "https://github.com/hkpark130/Spring-Blog/blob/7599c95d0bf7442d0479f103e617bd58675e5f37/src/main/java/kr/p_e/hkpark130/springblog/domain/RefreshToken.java#L12"
          },
          {
            "label": "RFC 9700: Refresh Token 보호",
            "href": "https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14"
          }
        ]
      },
      {
        "id": "spring-browser-boundary",
        "priority": "medium",
        "title": "브라우저에 저장한 토큰 보호하기",
        "observation": "Access Token은 localStorage에 저장하고, Refresh 쿠키에는 Secure 설정이 없습니다. 쿠키를 사용하는 갱신 요청의 CSRF 정책도 보완할 부분입니다.",
        "impact": "악성 스크립트의 토큰 읽기와 다른 사이트에서 보내는 요청은 각각 방어가 필요합니다.",
        "proposal": "HTTPS 쿠키에 Secure를 지정하고 허용한 출처의 갱신 요청만 받도록 보완할 필요가 있습니다. Access Token의 메모리 보관도 검토할 부분입니다.",
        "verification": "쿠키 속성, 새로고침 후 갱신, 허용하지 않은 사이트의 요청 거절을 확인해야 합니다.",
        "references": [
          {
            "label": "Spring: Refresh 쿠키",
            "href": "https://github.com/hkpark130/Spring-Blog/blob/7599c95d0bf7442d0479f103e617bd58675e5f37/src/main/java/kr/p_e/hkpark130/springblog/controller/UserController.java#L23"
          },
          {
            "label": "Spring: CSRF와 CORS 설정",
            "href": "https://github.com/hkpark130/Spring-Blog/blob/7599c95d0bf7442d0479f103e617bd58675e5f37/src/main/java/kr/p_e/hkpark130/springblog/config/SecurityConfig.java#L34"
          },
          {
            "label": "프론트: Access Token 전송",
            "href": "https://github.com/hkpark130/React-Intro/blob/a6a472118ee15b937c140d8f25c0d3d7de80703f/src/api/api.js"
          },
          {
            "label": "OWASP: CSRF와 SameSite의 적용 범위",
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"
          },
          {
            "label": "Spring Framework: CORS 설정 계약",
            "href": "https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html"
          }
        ]
      }
    ]
  },
  "/chrome": {
    "reviewedOn": "2026-09-14",
    "summary": "사용자 데이터의 소유권, AI 호출 한도, 대시보드 저장 실패 처리가 우선입니다.",
    "items": [
      {
        "id": "chrome-object-authorization",
        "priority": "high",
        "title": "로그인한 사용자의 데이터인지 확인하기",
        "observation": "Gateway는 JWT를 검사하지만, 북마크·대시보드 API는 요청의 userId나 위젯 ID를 사용합니다.",
        "impact": "로그인한 사용자가 다른 사람의 ID로 데이터를 조회하거나 바꿀 수 있는 경로가 있습니다.",
        "proposal": "검증한 JWT에서 사용자 ID를 얻고 북마크·대시보드·위젯의 소유자를 함께 확인할 필요가 있습니다.",
        "verification": "A의 토큰으로 B의 데이터를 조회·수정·삭제하는 요청이 거절되는지 확인해야 합니다.",
        "references": [
          {
            "label": "확장 백엔드: 북마크 요청의 사용자 ID",
            "href": "https://github.com/hkpark130/chrome-extension-back/blob/a148185ff456bbc83fc010a9dad767cd7e8b6a35/workspace/src/main/java/kr/co/direa/workspace/controller/BookmarkController.java#L21"
          },
          {
            "label": "확장 백엔드: 북마크 조회 조건",
            "href": "https://github.com/hkpark130/chrome-extension-back/blob/a148185ff456bbc83fc010a9dad767cd7e8b6a35/workspace/src/main/java/kr/co/direa/workspace/service/BookmarkService.java#L43"
          },
          {
            "label": "확장 백엔드: 위젯 ID 조회",
            "href": "https://github.com/hkpark130/chrome-extension-back/blob/a148185ff456bbc83fc010a9dad767cd7e8b6a35/dashboard/src/main/java/kr/co/direa/dashboard/service/DashboardService.java#L38"
          },
          {
            "label": "OWASP: 요청별 권한 검사",
            "href": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
          }
        ]
      },
      {
        "id": "chrome-public-ai",
        "priority": "high",
        "title": "AI 호출의 사용자와 사용량 제한하기",
        "observation": "AI 경로는 로그인 없이 통과하며, 입력 길이·동시 요청·응답 시간의 상한이 없습니다.",
        "impact": "반복 요청이나 오래 이어지는 응답이 외부 모델 비용과 서버 자원을 늘릴 수 있습니다.",
        "proposal": "사용자 인증과 호출 한도를 두고, 입력 길이·동시 처리 수·응답 시간을 제한할 필요가 있습니다.",
        "verification": "모형 API로 익명 요청, 한도 초과, 응답 지연과 연결 취소가 처리되는지 확인해야 합니다.",
        "references": [
          {
            "label": "확장 백엔드: 공개 경로 설정",
            "href": "https://github.com/hkpark130/chrome-extension-back/blob/a148185ff456bbc83fc010a9dad767cd7e8b6a35/gateway/src/main/java/kr/co/direa/gateway/config/SecurityGatewayConfig.java#L26"
          },
          {
            "label": "확장 백엔드: AI 스트리밍 진입점",
            "href": "https://github.com/hkpark130/chrome-extension-back/blob/a148185ff456bbc83fc010a9dad767cd7e8b6a35/external/src/main/java/kr/co/direa/external/controller/ExternalController.java#L32"
          },
          {
            "label": "OWASP API4: 자원 사용 제한",
            "href": "https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/"
          }
        ]
      },
      {
        "id": "chrome-write-consistency",
        "priority": "medium",
        "title": "대시보드 저장을 한 번에 처리하기",
        "observation": "빠진 위젯을 지운 뒤 나머지를 하나씩 저장하며, 전체 작업을 묶는 트랜잭션과 동시 수정 검사가 없습니다.",
        "impact": "중간 실패로 일부 위젯만 삭제되거나, 두 화면의 편집이 서로 덮일 수 있습니다.",
        "proposal": "소유권 확인 뒤 삭제·수정을 하나의 트랜잭션으로 처리하고, 같은 버전의 동시 저장을 감지할 필요가 있습니다.",
        "verification": "중간 저장 실패 시 전체가 되돌아가고, 동시 저장이 충돌로 안내되는지 확인해야 합니다.",
        "references": [
          {
            "label": "확장 백엔드: 위젯 일괄 저장",
            "href": "https://github.com/hkpark130/chrome-extension-back/blob/a148185ff456bbc83fc010a9dad767cd7e8b6a35/dashboard/src/main/java/kr/co/direa/dashboard/service/DashboardService.java#L38"
          },
          {
            "label": "Spring Framework: 트랜잭션 경계",
            "href": "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html"
          }
        ]
      }
    ]
  },
};
