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
          
          <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
            <ServerSetupSection />
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
    <>
      <TitleSection
        title="Redmine"
        subtitle="프로젝트 관리 및 이슈 트래킹 시스템"
        description="GitHub과 연계된 프로젝트 관리 시스템"
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
      category: '웹서버',
      labels: [
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
      category: '인프라',
      labels: [
        { label: 'AWS EC2', color: 'warning' }
      ],
    },
    {
      category: '연동',
      labels: [
        { label: 'GitHub', color: 'secondary' },
        { label: 'CI/CD', color: 'info' }
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
        📌 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        레드마인 구매해왔습니다. GitHub과 각 단계마다 연결되어 있어 수정사항이 생시 상세한 기록들을 모두 같이 알 수 있습니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        프로젝트의 이슈 트래킹, 일정 관리, 변경 사항 기록 및 GitHub 연동을 통합적으로 관리하는 시스템입니다.
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
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        레드마인은 프로젝트 진행 과정에서 발생하는 모든 이슈를 체계적으로 관리합니다.
        각 이슈는 담당자, 우선순위, 상태 등을 설정할 수 있으며, GitHub 커밋과 연동됩니다.
      </Typography>

      <ZoomableImageModal
        imageSrc="/images/redmine-issue.jpg"
        altText="Redmine 이슈 추적 시스템"
        caption="이슈 상세 페이지와 GitHub 연동 기능"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: 3 }}
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          주요 기능
        </Typography>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="body1" component="div">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>이슈 추적:</strong> 버그, 기능 요청, 작업 등 다양한 형태의 이슈 관리</li>
              <li><strong>워크플로우:</strong> 상태, 우선순위, 담당자 지정</li>
              <li><strong>GitHub 연동:</strong> 커밋, PR과 이슈 연결</li>
              <li><strong>파일 첨부:</strong> 이슈에 관련 파일 첨부 기능</li>
            </ul>
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <CodeAccordion 
          title="레드마인 연동 설정 파일" 
          language="yaml"
          codeString={`production.yml:
# GitHub 연동 설정
github:
  url: https://api.github.com
  key: your_github_api_key
  secret: your_github_secret

# 레드마인 설정
redmine:
  log_level: :info
  attachments_storage_path: ./files
  
# CI/CD 연동 설정  
ci:
  jenkins_url: http://jenkins:8080
  auto_update: true`}
        />
      </Box>
    </Box>
  );
}

function ServerSetupSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <StorageIcon />
        <Typography variant="h5" gutterBottom>
          서버 구성도
        </Typography>
      </Stack>
      <Typography variant="body1" component="p" sx={{ mb: 2 }}>
        레드마인은 AWS EC2 인스턴스에 호스팅되며, Apache 웹서버를 통해 외부에 노출됩니다.
        GitHub과 연동되어 코드 변경 사항을 자동으로 추적합니다.
      </Typography>
      
      <ZoomableImageModal
        imageSrc="/images/redmine-architecture.jpg"
        altText="Redmine 서버 구성도"
        caption="AWS EC2 - Apache - Redmine 서버 구성"
        sx={{ border: '2px solid #ddd', borderRadius: 2, mb: 3 }}
      />
      
      <Typography variant="body1" component="p" sx={{ mt: 2 }}>
        현재는 EC2 인스턴스의 메모리 제한으로 인해 시스템 사용을 중단한 상태입니다. 
        향후 인프라 확장 시 재구성할 예정입니다.
      </Typography>
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
            prefix: '레드마인 페이지:',
            href: 'https://github.com/hkpark130/redmine-config',
            label: '레드마인 설정 저장소'
          }
        ]}
      />
    </Box>
  );
}