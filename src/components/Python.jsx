// src/components/projects/Python.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal'; 
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
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

export default function Python() {
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
            <ServerStructureSection />
          </motion.div>
          
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          
          <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
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
      title="머신러닝 (Python)"
      subtitle="도쿄 23구 집 값 예측(선형회귀) 프로젝트"
      description="독립변수와 accuracy가 높습니다. 저장 크론잡으로 불용어 데이터를 수집하여 가공하고 학습시킵니다."
    />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '프레임워크',
      labels: [
        { label: 'Python', color: 'primary' },
        { label: 'Scikit-learn', color: 'success' },
      ],
    },
    {
      category: '웹서버',
      labels: [
        { label: 'Laravel', color: 'error' },
        { label: 'Tornado', color: 'info' },
      ],
    },
    {
      category: '애플리케이션',
      labels: [
        { label: 'nginx', color: 'success' },
        { label: 'Redis', color: 'error' },
        { label: 'supervisord', color: 'warning' },
      ],
    },
    {
      category: '인프라',
      labels: [
        { label: 'AWS EC2', color: 'warning' },
        { label: 'Docker', color: 'info' },
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
        "도쿄 23구 집 값 예측(선형회귀)" 프로젝트를 기획하여 만들어 보았습니다. 
        독립변수와 accuracy가 높습니다. 저장 크론잡으로 불용어 데이터를 수집하여 가공하고 학습시킵니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        Laravel 웹 프레임워크를 통해 사용자 인터페이스를 제공하고, Tornado를 사용하여 Python 머신러닝 
        모델과 연동합니다. 두 시스템은 Redis를 통해 통신하며, Supervisord를 통해 프로세스를 관리합니다.
      </Typography>
      <Box sx={{ my: 2 }}>
        <Stack 
          direction="column" 
          spacing={1}
          sx={{ 
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            p: 2,
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            주요 기능:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <li>데이터 수집: Scikit-learn + Pandas + 크롬잡 → Supervisord(Laravel)</li>
            <li>데이터 전처리: 불용어 처리</li>
            <li>학습 모델: 선형회귀</li>
            <li>웹 인터페이스: Python → Tornado</li>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function ServerStructureSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <Typography variant="h5" gutterBottom>
          🖥️ 서버 구성도
        </Typography>
      </Stack>
      <Typography variant="body1" component="p" sx={{ mb: 2.5 }}>
        본 프로젝트는 AWS EC2 인스턴스 위에서 Laravel과 Python(Tornado)이 함께 동작하는 구조로 설계되었습니다.
        Laravel은 웹 인터페이스를 제공하고, Python은 머신러닝 모델을 처리합니다. 두 시스템 간의 통신은 Redis를
        통해 이루어지며, nginx와 supervisord를 통해 서비스를 관리합니다.
      </Typography>

      <ZoomableImageModal
        imageSrc="/images/python-architecture.jpg"
        altText="Python 머신러닝 서버 구성도"
        caption="머신러닝 파이프라인 서버 구성도"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: 3 }}
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔄 데이터 흐름
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 1 }}>
          1. 사용자는 포트 8200을 통해 Laravel 웹 인터페이스에 접근
          2. Laravel은 API 요청을 포트 8201의 Python Tornado 서버로 전달
          3. Python 서비스는 Redis(포트 6379)와 통신하며 데이터를 처리
          4. 처리된 결과는 다시 Laravel을 통해 사용자에게 전달
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          🛠️ 주요 구성 요소
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 1 }}>
          - <strong>Laravel (포트 8200):</strong> 웹 애플리케이션 프레임워크, 사용자 인터페이스 제공<br />
          - <strong>Python/Tornado (포트 8201):</strong> 머신러닝 모델 실행 및 API 제공<br />
          - <strong>Redis (포트 6379):</strong> 데이터 캐싱 및 시스템 간 통신<br />
          - <strong>Nginx:</strong> 리버스 프록시로 포트 8202를 통해 서비스 제공<br />
          - <strong>Supervisord:</strong> 프로세스 관리 및 모니터링
        </Typography>
      </Box>
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Box>
      <Reference
        spaLinks={[]}
        externalLinks={[
          {
            prefix: '프로젝트 페이지:',
            href: 'https://hkpark130.p-e.kr:8200',
            label: '머신러닝 페이지로 이동'
          },
          {
            prefix: 'ML(Laravel) 소스코드:',
            href: 'https://github.com/hkpark130/Predict-Home-Laravel',
            label: 'https://github.com/hkpark130/Predict-Home-Laravel'
          },
          {
            prefix: 'ML(Tornado) 소스코드:',
            href: 'https://github.com/hkpark130/Predict-Home-API',
            label: 'https://github.com/hkpark130/Predict-Home-API'
          }
        ]}
      />
    </Box>
  );
}
