import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Container,
  Stack,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';
import { Link } from 'react-router-dom';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import BuildIcon from '@mui/icons-material/Build';

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

export default function Intro() {
  return (
    <Container 
      maxWidth="lg" 
      sx={{
        mx: "auto",               // 중앙 정렬
        py: { xs: 3, sm: 4, md: 6 }, // 반응형 상하 패딩
        px: { xs: 2, sm: 3, md: 1, lg: 2 }, // 반응형 좌우 패딩
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
            <PortfolioOverviewSection />
          </motion.div>
          
          <motion.div variants={sectionVariant} custom={3} style={{ marginTop: 32 }}>
            <ImplementationDetailsSection />
          </motion.div>
          
          <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
            <ProjectsSection />
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
      title="포트폴리오 웹사이트"
      subtitle="React · Spring Boot · Node.js SSR 기반 포트폴리오"
      description="SEO 최적화와 Notion 연동을 위한 별도 SSR(Node.js) 서비스 도입"
    />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'Docker', color: 'info' },
        { label: 'AWS EC2', color: 'warning' },
        { label: 'Nginx(Reverse Proxy)', color: 'secondary' }
      ],
    },
    {
      category: '프론트엔드',
      labels: [
        { label: 'React', color: 'primary' },
        { label: 'Material-UI', color: 'info' },
        { label: 'Framer Motion', color: 'success' },
        { label: 'Vite', color: 'warning' }
      ],
    },
    {
      category: 'SSR/SEO',
      labels: [
        { label: 'Node.js', color: 'success' },
        { label: 'Notion API', color: 'info' }
      ],
    },
    {
      category: 'CD',
      labels: [
        { label: 'AWS CodePipeline', color: 'warning' },
        { label: 'CodeDeploy', color: 'success' },
      ],
    },
  ];

  return (
    <TechStack techStacks={techStacks} />
  );
}

function PortfolioOverviewSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <WebIcon color="primary" />
        <Typography variant="h5">
          포트폴리오 개요
        </Typography>
      </Stack>

      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        이 페이지는 제 개인 프로젝트와 기술 스택을 소개하는 포트폴리오 사이트입니다.
      </Typography>

      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        블로그 기능은 마크다운 기반 컨텐츠 작성과 댓글 시스템을 포함하며 JWT 인증으로 관리자 권한을 제어합니다.
        SEO 및 Notion 연동을 위해 별도 Node.js 기반 SSR 서비스(<b>ssr-notion</b>)를 컨테이너로 분리하여 운영합니다.
        Nginx가 봇 트래픽을 감지하면 <code>/blog/:id</code> 요청을 SSR로 프록시하고, 일반 사용자는 SPA UI를 제공합니다.
        또한 <code>/notion/*</code>, <code>/seo/*</code>, <code>/sitemap.xml</code>, <code>/robots.txt</code>를 통해
        서버 측 렌더링, 메타 미리보기, 사이트맵/로봇 제어를 제공합니다.
      </Typography>
    </Box>
  );
}

function ProjectsSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <CodeIcon color="secondary" />
        <Typography variant="h5">
          주요 프로젝트 목록
        </Typography>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/spring-boot.png"
            alt="Spring Boot"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            Spring Boot 블로그
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Spring Boot로 개발한 RESTful API 서버와 블로그 시스템입니다.
          JWT 인증, CRUD 기능, 댓글 시스템이 구현되어 있으며 Docker 컨테이너로 배포됩니다.
        </Typography>
        <Button component={Link} to="/springboot" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/kubernetes.svg"
            alt="Kubernetes"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            K8S 오퍼레이터 for Managing Redis Clusters
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Go 언어로 구현한 Redis 클러스터의 관리 자동화를 위한 Kubernetes Operator입니다. <br/>
          Kredis라는 CRD(Custom Resource Definition)를 활용하여 Redis 클러스터 생성, 스케일링, 복구 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/kredis" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/go.png"
            alt="Go"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            Go JWT 인증 서버
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Go 언어로 구현한 경량화된 JWT 인증 서버입니다.
          사용자 등록, 로그인, 토큰 관리 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/golang" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/opensearch.png"
            alt="OpenSearch"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            OpenSearch 대시보드
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          OpenSearch를 활용한 로그 수집 및 분석 대시보드입니다.
          실시간 모니터링과 데이터 시각화 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/opensearch" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/tensorflow.png"
            alt="Python"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            Python 머신러닝 프로젝트
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          집값 예측을 위한 머신러닝 모델을 구현한 프로젝트입니다.
          데이터 전처리, 모델 학습, 예측 파이프라인이 포함되어 있습니다.
        </Typography>
        <Button component={Link} to="/python" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/terraform.png"
            alt="Terraform"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            Terraform 인프라
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Terraform을 이용한 인프라스트럭처 as 코드(IaC) 프로젝트입니다.
          클라우드 리소스를 자동으로 프로비저닝하고 관리하는 파이프라인을 구현했습니다.
        </Typography>
        <Button component={Link} to="/terraform" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/chrome.png"
            alt="Chrome Extension"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            Chrome 확장 앱
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          업무 생산성 향상을 위한 Chrome 확장 프로그램입니다.
          자동화 기능과 내부 시스템 연동을 통해 업무 효율성을 높입니다.
        </Typography>
        <Button component={Link} to="/chrome" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src="/logo/redmine.png"
            alt="Redmine"
            sx={{ 
              width: 36, 
              height: 36,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6">
            레드마인 자동화 도구
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1 }}>
          레드마인 프로젝트 관리 시스템을 위한 자동화 도구입니다.
          이슈 추적, 보고서 생성 및 워크플로우 자동화 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/redmine" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>
    </Box>
  );
}

function ImplementationDetailsSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <BuildIcon />
        <Typography variant="h5">
          구현 상세
        </Typography>
      </Stack>

      <Typography variant="body1" component="p" sx={{ mb: 2 }}>
        본 프로젝트는 프론트엔드와 백엔드를 분리한 웹 아키텍처로 구성되어 있습니다.
        CI/CD 파이프라인을 통해 자동 배포되며, Docker 컨테이너로 서비스됩니다.
      </Typography>

      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <Typography variant="h6" gutterBottom>
          🔄 CI/CD 파이프라인
        </Typography>
      </Stack>
      <ZoomableImageModal
        imageSrc="/images/cicd.png"
        altText="CI/CD 파이프라인"
        caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다."
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />

      <Typography variant="h6" gutterBottom>
        🖥️ 시스템 아키텍처
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/spring-blog.png"
        altText="Spring Diagram"
        caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다."
        sx={{ width: 600, height: 'auto', border: '2px solid #ddd', borderRadius: 2 }}
      />

      <Typography variant="body1" sx={{ mt: 2 }}>
        <strong>운영 현황:</strong> SEO 최적화와 서버 사이드 렌더링은 <b>별도 Node.js SSR 서비스(ssr-notion)</b>로 구현했습니다.
        Nginx가 봇을 감지하면 <code>/blog/:id</code>를 SSR로 프록시하고, <code>/notion/*</code> · <code>/seo/*</code> · <code>/sitemap.xml</code> · <code>/robots.txt</code>
        엔드포인트를 통해 Notion API 연동과 메타 태그 생성까지 서버에서 처리합니다.
      </Typography>
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Reference
      spaLinks={[
      ]}
      externalLinks={[
        {
          prefix: 'GitHub:',
          href: 'https://github.com/hkpark130/React-Intro',
          label: 'React-Intro 저장소'
        }
      ]}
    />
  );
}
