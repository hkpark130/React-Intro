
import { Box, Typography, Stack, Alert } from '@mui/material';

import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import TechStack from '@/components/section/TechStack';
import BugReportIcon from '@mui/icons-material/BugReport';
import WebIcon from '@mui/icons-material/Web';



export default function Redmine() {
  return (
    <article className="project-document project-document--redmine">
      <div className="project-section-slot"><HeroSection /></div>
      <div className="project-section-slot"><TechStackSection /></div>
      <div className="project-section-slot"><OverviewSection /></div>
      <div className="project-section-slot"><IssueTrackingSection /></div>
    </article>
  );
}

function HeroSection() {
  return (
    <>
      <TitleSection title="Redmine" subtitle="프로젝트 관리 및 이슈 트래킹 시스템" />
      <Alert severity="error" sx={{ mt: 2, fontSize: '0.875rem', borderLeft: '4px solid #D74141' }}>
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
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
        <WebIcon color="primary" /> 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:0}}>
        프로젝트의 변경 사항을 기록하고 관리하는 시스템입니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        EC2 인스턴스의 메모리 제한으로 인해 현재는 사용을 중단한 상태입니다.
      </Typography>
    </Box>
  );
}

function IssueTrackingSection() {
  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <BugReportIcon color="error" />
        <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
          이슈 트래킹 시스템
        </Typography>
      </Stack>
      <ZoomableImageModal imageSrc="/images/redmine.png" altText="Redmine 이슈 추적 시스템" caption="Github의 각 브랜치의 커밋 내용에는 해당 수정사항의 상세 내용을 기재해놓은 레드마인의 링크를 가리킵니다." sx={{mb:0}} />
    </Box>
  );
}
