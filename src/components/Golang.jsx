
import { Box, Typography, Stack } from '@mui/material';

import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WebIcon from '@mui/icons-material/Web';



export default function GolangProject() {
  return (
    <article className="project-document project-document--golang">
      <div className="project-section-slot"><HeroSection /></div>
      <div className="project-section-slot"><TechStackSection /></div>
      <div className="project-section-slot"><OverviewSection /></div>
      <div className="project-section-slot"><ImplementationSection /></div>
      <div className="project-section-slot"><ReferenceSection /></div>
    </article>
  );
}

function HeroSection() {
  return (
    <TitleSection title="JWT 인증 시스템 (Golang)" subtitle="Go 언어를 이용한 JWT 인증 서비스 개발" description="Redis + PostgreSQL + 계층 분리 실습" />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'Docker', color: 'info' },
        { label: 'AWS EC2', color: 'warning' },
        { label: 'Apache [프론트 엔드]', color: 'error' },
      ],
    },
    {
      category: '백엔드',
      labels: [
        { label: 'Go', color: 'info' },
      ],
    },
    {
      category: '인증',
      labels: [
        { label: 'JWT', color: 'secondary' },
        { label: '토큰 관리', color: 'success' },
      ],
    },
    {
      category: '데이터베이스',
      labels: [
        { label: 'Redis', color: 'error' },
        { label: 'PostgreSQL', color: 'primary' },
      ],
    },
  ];

  return (
    <TechStack techStacks={techStacks} />
  );
}

function OverviewSection() {
  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
        <WebIcon color="primary" /> 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        Go 언어로 Access Token 발급, Refresh Token 재발급, 사용자 조회를 구현한 인증 프로젝트입니다. 토큰 형식과 인증 흐름을 직접 다루며 구현한 당시 코드이며, 보안 검증과 세션 관리에서 보완할 지점은 아래 개선 검토에 정리했습니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        Redis에 Refresh Token을 저장하고, Secure·HttpOnly Cookie로 토큰을 전달합니다. 당시 구성은 Go 컨테이너의 3000번 포트를 Apache Proxy에 연결하는 방식입니다.
      </Typography>
    </Box>
  );
}

function ImplementationSection() {
  const authHandlerCode = `// 토큰 생성 로직입니다. Header와 Payload, signature 포함한 토큰을 발급합니다.
func IssueToken(payload *Payload) (string, error) {
	jwt := &Jwt{Alg: "HS256", SecretKey: os.Getenv("SECRET_KEY")}

	jsonHeader, err := json.Marshal(Header{
		Typ: "JWT",
		Alg: jwt.Alg,
	})
	if err != nil {
		log.Panicln("json encode error: %w ", err)
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Panicln("json encode error: %w ", err)
	}

	msg := strings.Join([]string{
		base64.RawURLEncoding.EncodeToString(jsonHeader),
		base64.RawURLEncoding.EncodeToString(jsonPayload)}, ".")

	signature := hmac256(msg, jwt.SecretKey)

	token := strings.Join([]string{
		base64.RawURLEncoding.EncodeToString(jsonHeader),
		base64.RawURLEncoding.EncodeToString(jsonPayload),
		signature}, ".")

	return token, err
}`;

  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <BuildIcon />
        <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
          구현 상세
        </Typography>
      </Stack>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        Go와 Gin으로 로그인과 토큰 갱신 경로를 구현했습니다. 두 종류의 토큰을 발급하는 것에 더해, 서명 검증을 마친 주체와 서버에 저장한 갱신 세션을 연결해야 인증 경계가 유지됩니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        Redis는 Refresh Token 저장소, PostgreSQL은 사용자 저장소입니다. 디렉터리는 도메인·핸들러·저장소·어댑터로 나누었지만, 핸들러와 인증 코드는 구체 저장소에, 도메인 모델은 GORM에 직접 의존합니다.
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <AccountTreeIcon />
        <Typography variant="h6" gutterBottom component="h3" className="project-subsection-heading">
          JWT 인증 처리 흐름
        </Typography>
      </Stack>
      <ZoomableImageModal imageSrc="/images/go-jwt-flow.png" altText="JWT 인증 처리 흐름" caption="당시 구현의 발급·갱신 흐름입니다. 현재 검토에서 확인한 서명 검사 순서와 갱신 세션 연결의 한계는 아래 설명을 함께 참고해 주세요." />
      <Typography variant="body2" component="p" sx={{mb:1.5}}>
        이 구현은 만료를 서명보다 먼저 검사하고, 재발급 때 만료된 Access Token의 email·permission을 다시 사용합니다. 제출한 Refresh Token과 Redis의 해당 세션을 대조하는 절차도 필요합니다. 그림과 발급 코드만으로 인증 검증이 완결되었다고 볼 수는 없습니다.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{mt:3}} component="h3" className="project-subsection-heading">
        📂 계층 분리 구조
      </Typography>
      <ZoomableImageModal imageSrc="/images/clean.png" altText="당시 계층 분리 구성도" caption="GORM의 DB 핸들을 사용하는 구조입니다. DB 교체에는 연결 어댑터뿐 아니라 스키마·쿼리·트랜잭션의 호환성 검증도 필요합니다." />
      <Box component="pre" sx={{p:0,overflowX:'auto'}}>
        {`api/
  ├── domain/       # 도메인 모델과 인터페이스 정의
  ├── repository/   # 데이터 접근 계층
  ├── handlers/     # 비즈니스 로직 및 요청 처리
  ├── middleware/   # 인증 및 검증 로직
  └── adapter/      # 외부 시스템 연결 (DB, Redis)`}
      </Box>

      <Typography variant="h6" gutterBottom sx={{mt:3}} component="h3" className="project-subsection-heading">
        🖥️ 서버 구성도
      </Typography>
      <ZoomableImageModal imageSrc="/images/go.png" altText="서버 구성도" caption="Docker 컨테이너 기반의 서버 구성도" />

      <div>
        <CodeAccordion title="당시 토큰 발급 코드 — 검증·세션 관리는 별도 보완 필요" codeString={authHandlerCode} language="go" />
      </div>
    </Box>
  );
}

function ReferenceSection() {
  return (
      <Reference spaLinks={[
        ]} externalLinks={[
          {
            prefix: 'GitHub:',
            href: 'https://github.com/hkpark130/go-jwt',
            label: 'https://github.com/hkpark130/go-jwt'
          },
          {
            prefix: '실제 프로젝트 페이지:',
            href: 'https://hkpark130.p-e.kr:8300',
            label: 'https://hkpark130.p-e.kr:8300',
            highlighted: true
          }
        ]} />
  );
}
