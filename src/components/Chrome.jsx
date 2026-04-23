import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Container,
  Stack,
  Link
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal'; 
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
import ExtensionIcon from '@mui/icons-material/Extension';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';

/* =======================
   섹션 애니메이션 Variants 정의
   ======================= */
const sectionVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};

export default function ChromeExtension() {
  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}
    >
      <motion.article
        initial="hidden"
        animate="visible"
        variants={sectionVariant}
        style={{ maxWidth: 1040, margin: '0 auto' }}
      >
        {/* 한 모션으로 감싸고, 내부에서 각각 모션 적용 */}
        <motion.div variants={sectionVariant} custom={0}>
          <HeroSection />
        </motion.div>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <motion.div variants={sectionVariant} custom={1} style={{ marginTop: 32 }}>
          <TechStackSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={2} style={{ marginTop: 32 }}>
          <OverviewSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={3} style={{ marginTop: 32 }}>
          <ImplementationSection />
        </motion.div>

        <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
          <FeaturesSection />
        </motion.div>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <motion.div variants={sectionVariant} custom={5} style={{ marginTop: 32 }}>
          <ReferenceSection />
        </motion.div>
      </motion.article>
    </Container>
  );
}

function HeroSection() {
  return (
    <TitleSection
      title="사내 생산성 Chrome Extension"
      subtitle="업무 생산성 향상을 위한 크롬 확장 앱"
      description="React + Spring Cloud + Chrome API"
    />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '프론트엔드',
      labels: [
        { label: 'React', color: 'info' },
        { label: 'Vite', color: 'purple' },
        { label: 'TailwindCSS ', color: 'success' },
        { label: '(Grid Layout, Big Calendar, oidc) 플러그인', color: 'primary' },
      ],
    },
    {
      category: '백엔드',
      labels: [
        { label: 'Spring Cloud Gateway', color: 'success' },
        { label: 'MySQL', color: 'info' },
        { label: 'JPA', color: 'success' },
      ],
    },
    {
      category: '인증',
      labels: [
        { label: 'JWT', color: 'secondary' },
        { label: 'Keycloak', color: 'primary' },
        { label: 'Spring Security', color: 'success' },
      ],
    },
    {
      category: '외부 API',
      labels: [
        { label: 'Chrome Extension API', color: 'error' },
        { label: '공공데이터 포털', color: 'primary' },
        { label: 'ChatGPT API', color: 'black' },
        { label: 'Gitlab API', color: 'warning' },
        { label: 'Redmine API', color: 'error' },         
      ],
    },
  ];

  return (
    <TechStack techStacks={techStacks} />
  );
}

function OverviewSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom>
        <WebIcon color="primary" /> 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        사내 시스템 접근성과 일상 업무 편의성 향상을 위해
        북마크, 투두리스트, 회의실 예약, 깃랩/레드마인/챗GPT/날씨 API 연동 기능을 하나로 통합한
        Chrome 확장 프로그램을 개발했습니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        JWT 기반 인증으로 보안을 강화하고, Keycloak을 통한 SSO 로그인을 구현하여 재로그인 하지 않도록 사용자 경험을 향상시켰습니다.
      </Typography>
    </Box>
  );
}

function FeaturesSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom>
        📸 실제 작동 화면
      </Typography>
      <Box sx={{ mb: 1 }}>
        <video 
          controls 
          preload="none" 
          autoPlay 
          muted 
          loop 
          playsInline 
          style={{ width: '100%'}}
        >
          <source src="/videos/chrome.webm" type="video/webm" />
        </video>
      </Box>

      <Typography variant="h6" gutterBottom>
        🤖 ChatGPT 컴포넌트 (SSE 프로토콜)
      </Typography>
      <Box sx={{ mb: 1 }}>
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          style={{ width: '50%', height: 'auto' }}
        >
          <source src="/videos/sse.webm" type="video/webm" />
        </video>
      </Box>
    </Box>
  );
}

function ImplementationSection() {
  const backgroundCode = `/**
 * 로그인 프로세스를 시작하는 함수
 * Keycloak 인증 URL 생성하고 웹 인증 흐름을 시작해 토큰 발급
 */
async function startLogin() {
...
/**
 * 인증 코드를 액세스 토큰, 리프레시 토큰으로 교환하는 함수 (PKCE)
 * Keycloak 토큰 엔드포인트에 코드를 보내 토큰을 받아옴
 */
async function exchangeCodeForToken(code) {
...
/**
 * 사용자 정보를 가져오는 함수
 * 액세스 토큰을 사용하여 Keycloak의 사용자 정보 엔드포인트에서 사용자 프로필 조회
 */
async function getUserInfo(accessToken) {
...

/**
 * 로그아웃 프로세스를 시작하는 함수
 * Keycloak 로그아웃 URL을 생성하고 웹 인증 흐름을 통해 로그아웃 처리 후 chrome 스토리지 정리
 */
async function startLogout() {
...
/**
 * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받는 함수
 * 토큰 만료 시 자동으로 갱신하기 위해 사용
 */
async function refreshTokens(refreshToken) {
...
/**
 * 자동 로그인을 수행하는 함수
 * 저장된 리프레시 토큰이 있을 경우 토큰을 갱신하여 로그인 상태 유지
 */
async function performSilentLogin() {
`;
  
  const springCode = `public class GPTService {
    private final ChatModel chatModel; // Spring AI 통합

    // 스트리밍 응답으로 ChatGPT 결과 반환
    public Flux<ChatResponse> getStream(String message) {
        Prompt prompt = new Prompt(new UserMessage(message));
        return chatModel.stream(prompt);
    }
}

public class ExternalController {
    private final GPTService gptService;
    private final WeatherService weatherService;
    private final RedmineService redmineIssueService;
    private final GitlabService gitlabService;

    // ChatGPT API - 서버 전송 이벤트(SSE) 스트림 구현
    @PostMapping(value = "/ai", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<SseMessageDto>> generateStream(@RequestBody PromptRequestDto request) {
        return gptService.getStream(request.getMessage())
                .map(chatResponse -> {
                    String text = chatResponse.getResult().getOutput().getText();
                    return ServerSentEvent.builder(new SseMessageDto(text)).build();
                });
    }

    // 지리정보 기반 날씨 API
    @GetMapping("/weather/{lat}/{lon}")
    public Mono<WeatherResponseDto> getWeather(
            @PathVariable String lat,
            @PathVariable String lon
    ) {
        WeatherRequestDto requestDto = new WeatherRequestDto(Double.parseDouble(lat), Double.parseDouble(lon));
        return weatherService.getWeatherData(requestDto);
    }
}
// ------------------------------------------------------------------------------------------------------------
    public Mono<IssueListResponseDto> getIssuesByUserEmail(String email, int offset, int limit) {
      return getUserIdByEmail(email)
      // 레드마인 API 통신
      // ...
    }

    Mono<List<GitLabDto>> reviewerReq = gitlabWebClient.get()
      .uri(uriBuilder -> uriBuilder
              .path("/merge_requests")
      // 깃랩 API 통신
      // ...

`;


  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <BuildIcon />
        <Typography variant="h5" gutterBottom>
          구현 상세
        </Typography>
      </Stack>

      <Typography variant="body1" component="p" sx={{ mb: 2.5 }}>
        React로 프론트 엔드를 구축했고 Chrome Extension 과 Keycloak을 통해
        SSO 인증으로 사용자 경험을 향상시키고, Spring Cloud Gateway를 이용해 통합 백엔드 서비스를 구축했습니다.
      </Typography>
      
      {/* 주요 기술 스택 리스트 - 첨부된 사진에서처럼 구성 */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        bgcolor: 'rgba(0,0,0,0.02)', 
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.09)'
      }}>
        {/* Frontend 섹션 */}
        <Typography variant="h6" gutterBottom fontWeight="600">
          • Frontend
        </Typography>
        <Box sx={{ pl: 3, mb: 2 }}>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            React + Vite (Grid Layout, Big Calendar)
          </Typography>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            JavaScript (SSE 스트리밍 처리), axios
          </Typography>
          <Typography whiteSpace='pre-wrap' component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            Keycloak (SSO 인증 연동) <u><b>여기서 토큰발급, 갱신</b></u>
          </Typography>
        </Box>

        {/* Backend 섹션 */}
        <Typography variant="h6" gutterBottom fontWeight="600">
          • Backend
        </Typography>
        <Box sx={{ pl: 3, mb: 2 }}>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            Spring Cloud 기반 API 서버
          </Typography>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            JPA (기본 데이터 관리)
          </Typography>
          <Typography whiteSpace='pre-wrap' component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            JWT <u><b>토큰 인증만</b></u> 수행
          </Typography>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            Spring WebFlux + WebClient (비동기 통신)
          </Typography>
          <Typography component="div" sx={{ mb: 0.5, fontWeight: 'medium', fontSize: '0.95rem' }}>
            <b>외부 통신 모듈(External Service): [Spring WebFlux (비동기, Reactive)]</b>
          </Typography>
          <Typography component="div" sx={{ mb: 2, fontWeight: 'medium', fontSize: '0.95rem'}}>
            <b>그 외 모듈(Workspace Service, etc): [Spring MVC (동기, Servlet)]</b>
          </Typography>
        </Box>

        

        {/* 비동기/Reactive 기술 섹션 */}
        <Typography variant="h6" gutterBottom fontWeight="600">
          • 비동기/Reactive 기술
        </Typography>
        <Box sx={{ pl: 3, mb: 1 }}>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            Mono (단일 API 응답)
          </Typography>
          <Box sx={{ pl: 4, mb: 1 }}>
            <Typography component="div" sx={{ mb: 0.3, fontSize: '0.9rem' }}>
              공공데이터 포털(날씨 API)
            </Typography>
            <Typography component="div" sx={{ mb: 0.3, fontSize: '0.9rem' }}>
              깃랩 MR 데이터 요청
            </Typography>
            <Typography component="div" sx={{ mb: 0.3, fontSize: '0.9rem' }}>
              레드마인 Issue 데이터 요청
            </Typography>
          </Box>
          <Typography component="div" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ mr: 1, fontSize: '0.8rem', lineHeight: 1 }}>○</Box>
            Flux (SSE 스트리밍 응답)
          </Typography>
          <Box sx={{ pl: 4, mb: 1 }}>
            <Typography component="div" sx={{ mb: 0.3, fontSize: '0.9rem' }}>
              OpenAI GPT-4o API
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <ExtensionIcon />
        <Typography variant="h6" gutterBottom>
          주요 기능
        </Typography>
      </Stack>
      
      <Box sx={{ mb: 2 }}>
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" sx={{ mb: 0.5 }}>
            Grid 형식의 드래그 앤 드랍으로 커스텀하게 위젯 크기, 위치 설정
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            SSO 인증 시스템 통합, 토큰 기반 자동 로그인 (Silent login)
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            자주 방문하는 사이트 (Chrome의 topSites API에서 자주 방문한 사이트 가져오기)
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            북마크 바로가기 관리 (개인화된 URL 저장 및 빠른 이동, faviconURL 로고 사용)
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            투두리스트 기능 (할 일 관리 및 완료 체크, 드래그 앤 드랍으로 우선순위 지정)
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            회의실 예약 시스템 (실시간 예약 현황 조회 및 등록, 반복설정도 가능)
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            사내 시스템 연동 (GitLab, Redmine, Hi,Works 데이터 불러오기)
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            챗봇 (GPT) 연동 (질의응답) - SSE 스트리밍 방식 구현
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            공공데이터 기반 실시간 날씨 정보 제공
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        🖥️ 시스템 아키텍처
      </Typography>
      <Typography component="li" sx={{ mb: 0.5 }}>
        리액트 + 스프링 + 키클록 구조도
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/chrome-keycloak.png"
        altText="Chrome Extension 시스템 아키텍처"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: -1 }}
      />

      <Typography component="li" sx={{ mb: 0.5 }}>
        PKCE를 통해 토큰 발급 과정
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/pkce.png"
        altText="PKCE를 통해 토큰 발급 과정"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: -1 }}
      />

      <Typography component="li" sx={{ mb: 0.5 }}>
        Spring Cloud 모듈 종류 (Kiali - 트래픽 모니터링)
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/kiali.png"
        altText="Spring Cloud 모듈 종류 (Kiali - 트래픽 모니터링)"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: -1 }}
      />
      
      <Box sx={{ mt: 2 }}>
        <CodeAccordion 
          title="background.js" 
          language="javascript"
          codeString={backgroundCode}
        />

        <CodeAccordion 
          title="백엔드 프로젝트 코드" 
          language="java"
          codeString={springCode}
        />
      </Box>
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Reference
      spaLinks={[]}
      externalLinks={[
        {
          prefix: 'GitHub:',
          href: 'https://github.com/hkpark130/chrome-extension',
          label: '리액트 (프론트 엔드)'
        },
        {
          prefix: 'GitHub:',
          href: 'https://github.com/hkpark130/chrome-extension-back',
          label: '스프링 클라우드 (백엔드)'
        },
        // {
        //   prefix: 'Chrome Web Store:',
        //   href: 'https://chrome.google.com/webstore/detail/...',
        //   label: '크롬 웹 스토어 페이지'
        // }
      ]}
    />
  );
}