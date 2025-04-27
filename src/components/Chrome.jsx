import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
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
      maxWidth="md" 
      sx={{
        mx: "auto",               // 중앙 정렬
        py: { xs: 3, sm: 4, md: 6 }, // 반응형 상하 패딩
        px: { xs: 2, sm: 3, md: 1 }, // 반응형 좌우 패딩
        display: 'flex', 
        flexDirection: 'column'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{
          borderRadius: 3, 
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 3, sm: 4 },
          bgcolor: '#f9f9ff'
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariant}
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
            <FeaturesSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
            <ImplementationSection />
          </motion.div>
          
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          
          <motion.div variants={sectionVariant} custom={5} style={{ marginTop: 32 }}>
            <ReferenceSection />
          </motion.div>
        </motion.div>
      </Paper>
    </Container>
  );
}

function HeroSection() {
  return (
    <TitleSection
      title="사내 생산성 Chrome Extension"
      subtitle="업무 효율성 향상을 위한 크롬 확장 앱"
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
        { label: 'JavaScript', color: 'warning' }
      ],
    },
    {
      category: '백엔드',
      labels: [
        { label: 'Firebase', color: 'error' },
        { label: 'Spring Gateway', color: 'success' },
      ],
    },
    {
      category: '인증',
      labels: [
        { label: 'JWT', color: 'secondary' },
        { label: 'Keycloak', color: 'primary' },
      ],
    },
    {
      category: '도구',
      labels: [
        { label: 'Chrome API', color: 'info' },
        { label: 'ChatGPT API', color: 'success' },
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
        사내 업무 생산성 향상을 위해 개발한 크롬 확장 프로그램입니다. 자주 사용하는 내부 시스템들에 대한 접근성을 높이고, 
        반복 작업을 자동화하며, ChatGPT를 활용한 코드 보조 기능을 제공합니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        JWT 기반 인증으로 보안을 강화하고, 중앙 관리 시스템을 통해 확장 기능의 설정과 업데이트를 효율적으로 관리할 수 있도록 설계했습니다.
      </Typography>
    </Box>
  );
}

function FeaturesSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <ExtensionIcon />
        <Typography variant="h5" gutterBottom>
          주요 기능
        </Typography>
      </Stack>
      
      <Box sx={{ mb: 2 }}>
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" sx={{ mb: 0.5 }}>
            <strong>Dashboard:</strong> 내부 시스템 통합 접근 대시보드
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            <strong>Keycloak 연동:</strong> SSO 인증 시스템 통합
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            <strong>자동 로그인:</strong> JWT 토큰 기반 자동 인증
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            <strong>ChatGPT 통합:</strong> 코드 자동완성 및 포맷팅 지원
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            <strong>업무 자동화:</strong> 반복 작업 스크립트 실행 기능
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        📸 실제 작동 화면
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/chrome-extension-ui.jpg"
        altText="Chrome Extension 실행 화면"
        caption="사내 생산성 Chrome Extension 실행 화면"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: 3 }}
      />

      <Typography variant="h6" gutterBottom>
        🤖 ChatGPT 통합 기능
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/chrome-chatgpt-integration.jpg"
        altText="ChatGPT 통합 기능"
        caption="코드 자동완성을 위한 ChatGPT API 통합"
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />
    </Box>
  );
}

function ImplementationSection() {
  const manifestCode = `{
  "manifest_version": 3,
  "name": "사내 생산성 통합 Extension",
  "version": "1.0",
  "description": "업무 효율성 향상을 위한 확장 프로그램",
  "permissions": ["storage", "activeTab", "scripting", "cookies"],
  "host_permissions": [
    "https://*.company-domain.com/*",
    "https://keycloak.company-domain.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*.company-domain.com/*"],
      "js": ["contentScript.js"]
    }
  ]
}`;

  const backgroundCode = `// JWT 토큰 관리 및 인증 처리
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getToken") {
    chrome.cookies.get({
      url: "https://keycloak.company-domain.com",
      name: "access_token"
    }, function(cookie) {
      if (cookie) {
        sendResponse({token: cookie.value});
      } else {
        // 토큰이 없으면 로그인 페이지로 리디렉션
        chrome.tabs.create({
          url: "https://keycloak.company-domain.com/auth"
        });
        sendResponse({token: null});
      }
    });
    return true; // 비동기 응답을 위해 true 반환
  }
});`;

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
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        Chrome Extension API를 활용하여 팝업 인터페이스, 백그라운드 서비스, 컨텐츠 스크립트를 구현했습니다.
        React로 팝업 UI를 개발하고, 백그라운드 스크립트에서 JWT 토큰 관리와 API 통신을 처리합니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        사용자 인증은 사내 Keycloak 서버를 활용하며, Firebase를 통해 확장 프로그램의 설정과 상태를 동기화합니다.
        ChatGPT API 통합으로 코드 자동완성 및 문서 생성 기능을 제공합니다.
      </Typography>

      <Typography variant="h6" gutterBottom>
        🖥️ 시스템 아키텍처
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/chrome-extension-architecture.jpg"
        altText="Chrome Extension 시스템 아키텍처"
        caption="JWT 인증 기반 Chrome Extension 아키텍처"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: 3 }}
      />

      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <CodeIcon />
        <Typography variant="h6" gutterBottom>
          주요 코드
        </Typography>
      </Stack>
      
      <CodeAccordion 
        title="manifest.json" 
        language="json"
        codeString={manifestCode}
      />
      
      <Box sx={{ mt: 2 }}>
        <CodeAccordion 
          title="background.js" 
          language="javascript"
          codeString={backgroundCode}
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
          href: 'https://github.com/hkpark130/chrome-productivity-extension',
          label: 'https://github.com/hkpark130/chrome-productivity-extension'
        },
        {
          prefix: 'Chrome Web Store:',
          href: 'https://chrome.google.com/webstore/detail/...',
          label: '크롬 웹 스토어 페이지'
        }
      ]}
    />
  );
}