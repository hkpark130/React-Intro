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
import StorageIcon from '@mui/icons-material/Storage';
import { Link } from 'react-router-dom';

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
      subtitle="React와 Spring Boot를 활용한 포트폴리오 페이지"
      description="기술 스택 소개 및 프로젝트 전시"
    />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'Docker', color: 'info' },
        { label: 'AWS EC2', color: 'warning' }
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
        블로그 기능에서는 마크다운 기반 컨텐츠 작성과 댓글 시스템을 통해 방문자와 소통할 수 있으며,
        JWT 인증을 통해 관리자 권한을 제어하고 있습니다. 현재 SEO 최적화 및 성능 향상을 위해
        Next.js로의 마이그레이션을 준비 중입니다.
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
        <Typography variant="h6" gutterBottom>
          🌱 Spring Boot 블로그
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Spring Boot로 개발한 RESTful API 서버와 블로그 시스템입니다.
          JWT 인증, CRUD 기능, 댓글 시스템이 구현되어 있으며 Docker 컨테이너로 배포됩니다.
        </Typography>
        <Button component={Link} to="/springboot" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🐍 Python 머신러닝 프로젝트
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          집값 예측을 위한 머신러닝 모델을 구현한 프로젝트입니다.
          데이터 전처리, 모델 학습, 예측 파이프라인이 포함되어 있습니다.
        </Typography>
        <Button component={Link} to="/python" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🔐 Go JWT 인증 서버
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Go 언어로 구현한 경량화된 JWT 인증 서버입니다.
          사용자 등록, 로그인, 토큰 관리 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/golang" variant="outlined" size="small" sx={{ mr: 1 }}>
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
        <StorageIcon color="info" />
        <Typography variant="h5">
          구현 상세
        </Typography>
      </Stack>

      <Typography variant="body1" component="p" sx={{ mb: 2 }}>
        본 프로젝트는 프론트엔드와 백엔드를 분리한 모던 웹 아키텍처로 구성되어 있습니다.
        CI/CD 파이프라인을 통해 자동 배포되며, Docker 컨테이너로 서비스됩니다.
      </Typography>

      <Typography variant="h6" gutterBottom>
        🏗️ 시스템 아키텍처
      </Typography>
      <Box sx={{ mb: 2 }}>
        <img 
          src="/images/portfolio-architecture.jpg" 
          alt="포트폴리오 시스템 아키텍처" 
          style={{ 
            maxWidth: '100%', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }} 
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        🔄 CI/CD 파이프라인
      </Typography>
      <Box sx={{ mb: 2 }}>
        <img 
          src="/images/portfolio-cicd.jpg" 
          alt="CI/CD 파이프라인" 
          style={{ 
            maxWidth: '100%', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }} 
        />
      </Box>

      <Typography variant="body1" sx={{ mt: 2 }}>
        <strong>향후 계획:</strong> 현재 SEO 최적화, 서버 사이드 렌더링 및 정적 페이지 생성을 위해 
        Next.js로의 마이그레이션을 진행 중입니다. 이를 통해 검색 엔진 노출도 향상 및 초기 로딩 성능을 
        개선할 예정입니다.
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
