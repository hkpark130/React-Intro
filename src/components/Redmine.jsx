import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Container,
  Stack,
  Link,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal'; 
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
import StorageIcon from '@mui/icons-material/Storage';
import BugReportIcon from '@mui/icons-material/BugReport';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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

export default function Redmine() {
  return (
    <Container 
      maxWidth="md" 
      sx={{
        mx: "auto",               
        py: { xs: 3, sm: 4, md: 6 }, 
        px: { xs: 2, sm: 3, md: 1 }, 
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
            <IssueTrackingSection />
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
        title="Redmine"
        subtitle="프로젝트 관리 및 이슈 트래킹 시스템"
      />
      <Alert severity="error" sx={{ mt: 2, fontSize: '0.875rem' }} >
        (EC2 메모리 사양상 현재는 운용하고 있지 않습니다.)
      </Alert>
    </>
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'AWS EC2', color: 'warning' },
        { label: 'Apache', color: 'error' }
      ],
    },
    {
      category: '애플리케이션',
      labels: [
        { label: 'Redmine', color: 'error' },
        { label: 'Ruby', color: 'warning' },
        { label: 'Rails', color: 'secondary' }
      ],
    },
    {
      category: '연동',
      labels: [
        { label: 'GitHub', color: 'secondary' }
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
      <Typography variant="body1" component="p" sx={{ mb: 0 }}>
        프로젝트의 변경 사항을 기록하고 관리하는 시스템입니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        EC2 인스턴스의 메모리 제한으로 인해 현재는 사용을 중단한 상태입니다.
      </Typography>
    </Box>
  );
}

function IssueTrackingSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <BugReportIcon color="error" />
        <Typography variant="h5" gutterBottom>
          이슈 트래킹 시스템
        </Typography>
      </Stack>
      <ZoomableImageModal
        imageSrc="/images/redmine.png"
        altText="Redmine 이슈 추적 시스템"
        caption="Github의 각 브랜치의 커밋 내용에는 해당 수정사항의 상세 내용을 기재해놓은 레드마인의 링크를 가리킵니다."
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: 0 }}
      />
    </Box>
  );
}
