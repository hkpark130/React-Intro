import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Container,
  Stack,
  Alert,
  Button 
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal'; 
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
import StorageIcon from '@mui/icons-material/Storage';
import DashboardIcon from '@mui/icons-material/Dashboard';
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

export default function Opensearch() {
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
            <ImplementationSection />
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
    <>
      <TitleSection
        title="OpenSearch DashBoard"
        subtitle="Docker 기반의 로그 모니터링 시스템 구축"
        description="Docker + Packetbeat + Logstash + OpenSearch"
      />
      <Alert severity="error" sx={{ mt: 2, fontSize: '0.875rem' }} >
        EC2 리소스(1vCPU, 1G) 부족으로 인해 현재는 종료하고 있습니다.
      </Alert>
    </>
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'Docker', color: 'info' },
      ],
    },
    {
      category: '로그 수집',
      labels: [
        { label: 'Packetbeat', color: 'primary' },
        { label: 'Logstash', color: 'yellow' },
      ],
    },
    {
      category: '검색 엔진',
      labels: [
        { label: 'OpenSearch', color: 'success' },
      ],
    },
    {
      category: '시각화',
      labels: [
        { label: 'OpenSearch DashBoard', color: 'secondary' },
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
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <WebIcon color="primary" />
        <Typography variant="h5" gutterBottom>
          프로젝트 개요
        </Typography>
      </Stack>
      
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        OpenSearch와 관련 도구들을 Docker로 구성하여 로그 모니터링 시스템을 구축한 프로젝트입니다.
        Packetbeat를 통해 네트워크 패킷을 수집하고, Logstash로 데이터를 처리한 후, OpenSearch에 저장하여 대시보드를 통해 시각화합니다.
      </Typography>
      
      <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderLeft: '4px solid #1976d2' }}>
        <Typography variant="body1" component="p">
          자세한 설정 파일과 설치 방법 및 트러블 슈팅은 아래 GitHub 링크를 참고해주세요.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          size="small" 
          href="https://github.com/hkpark130/opensearch?tab=readme-ov-file" 
          target="_blank"
          startIcon={<svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>}
          sx={{ mt: 1.5 }}
        >
          트러블 슈팅 가이드
        </Button>
      </Paper>
    </Box>
  );
}

function ImplementationSection() {
  const packetBeatCode = `packetbeat.interfaces.device: any
packetbeat.protocols:
  http:
    ports: [80, 443, 5601, 8080, 8100, 8200, 8300]
output.elasticsearch:
  hosts: ["http://opensearch:9200"]
  index: "packetbeat-%{+yyyy.MM.dd}"`;

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
        Docker를 사용하여 OpenSearch 시스템의 각 구성 요소(Packetbeat, Logstash, OpenSearch, OpenSearch Dashboard)를
        컨테이너화하여 로컬에서도 쉽게 배포하고 관리할 수 있도록 구성했습니다.
      </Typography>
      <Typography variant="body1" component="p" >
        Packetbeat로 네트워크 인터페이스에서 HTTP 프로토콜을 사용하는 포트들의 로깅을 설정하였습니다.
      </Typography>
      <Typography variant="body2" component="p" >
        <code>network_mode: "host"</code>
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        Logstash는 이 데이터를 가공하여 OpenSearch로 전송합니다.
        OpenSearch DashBoard를 통해 직관적인 시각화 인터페이스를 제공하여 실시간 모니터링 및 분석이 가능합니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        SSL 인증서 적용시 Security Plugins 도 설치되기 때문에 리소스를 더 사용하게 됩니다.
        이런 이유로 현재는 다 꺼둔 상태입니다. 실제 프로덕션 환경에서는 충분한 리소스 할당이 필요합니다.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <CodeAccordion 
          title="packetbeat/packetbeat.yml"
          codeString={packetBeatCode}
          language="javascript"
        />
      </Box>      

      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        🖥️ 서비스 구성도
      </Typography>
      <Box sx={{ mb: 2 }}>
        <img 
          src="/images/opensearch.png" 
          alt="OpenSearch 서비스 구성도" 
          style={{ 
            maxWidth: '100%', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }} 
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        💻 OpenSearch 대시보드 스크린샷
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/opensearch-dashboard.png"
        altText="OpenSearch Dashboard 스크린샷"
        caption="OpenSearch Dashboard - 로그 분석 및 시각화 화면"
        sx={{ border: '2px solid #ddd', borderRadius: 2, my: 2 }}
      />
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Box>
      <Reference
        spaLinks={[
        ]}
        externalLinks={[
          {
            prefix: 'GitHub:',
            href: 'https://github.com/hkpark130/opensearch',
            label: 'https://github.com/hkpark130/opensearch'
          }
        ]}
      />
    </Box>
  );
}