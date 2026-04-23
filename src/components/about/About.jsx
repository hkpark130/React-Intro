import React from 'react';
import { Box, Container, Link, Stack, Grid, Card, CardMedia, CardContent, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import Bio from './Bio';
import TechStackCompact from './TechStackCompact';

const SectionTitle = ({ icon: Icon, children }) => (
  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2.5 }}>
    <Icon sx={{ fontSize: 20, color: 'var(--ink-muted)' }} />
    <Box sx={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{children}</Box>
  </Stack>
);

function LinksSection() {
  const linkSx = { display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'var(--ink)', fontSize: 14 };
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={EmailIcon}>Links</SectionTitle>
        <Stack spacing={1.2}>
          <Link href="https://github.com/hkpark130" target="_blank" rel="noopener noreferrer" sx={linkSx}>
            <GitHubIcon fontSize="small" /> github.com/hkpark130
          </Link>
          <Link href="https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/" target="_blank" rel="noopener noreferrer" sx={linkSx}>
            <LinkedInIcon fontSize="small" /> LinkedIn
          </Link>
          <Link href="mailto:hkpark130@naver.com" sx={linkSx}>
            <EmailIcon fontSize="small" /> hkpark130@naver.com
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}

function CertsSection() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={EmojiEventsIcon}>Certifications</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none', bgcolor: 'var(--bg-canvas)' }} elevation={0}>
              <CardMedia component="img" image="/images/cka.png" alt="CKA" sx={{ height: 180, objectFit: 'contain', bgcolor: '#1a73e8', p: 0 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>Certified Kubernetes Administrator</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>CNCF</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none', bgcolor: 'var(--bg-canvas)' }} elevation={0}>
              <CardMedia component="img" image="/images/aws.png" alt="AWS SAA" sx={{ height: 180, objectFit: 'contain', bgcolor: 'var(--bg-subtle)', p: 0 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>AWS Certified Solutions Architect — Associate</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>Amazon Web Services</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function AwardsSection() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={SchoolIcon}>Awards</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none' }} elevation={0}>
              <CardMedia component="img" image="/images/award1.png" alt="JAVA 프로그래밍 경진대회" sx={{ height: 200 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>JAVA 프로그래밍 경진대회</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>한빛미디어 (은상) · 2016</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none' }} elevation={0}>
              <CardMedia component="img" image="/images/award2.png" alt="신규 사업 아이디어 콘테스트" sx={{ height: 200 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>신규 사업 아이디어 콘테스트</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>KWC (장려상) · 2018</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function InfraSection() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={EmojiEventsIcon}>Infra & Deployment</SectionTitle>
        <Box sx={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, mb: 3 }}>
          이 사이트의 프론트엔드(React) · 백엔드(Spring Boot) · SSR(Node.js) 세 서비스가 Docker로 분리되어
          Nginx 뒤에서 실행됩니다. GitHub push → AWS CodePipeline → CodeDeploy → EC2 의 CI/CD 파이프라인으로 배포.
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)', mb: 1 }}>CI/CD 파이프라인</Typography>
          <ZoomableImageModal imageSrc="/images/cicd.png" altText="CI/CD pipeline" caption="🔼 클릭 후 스크롤로 확대/축소" />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)', mb: 1 }}>시스템 아키텍처</Typography>
          <ZoomableImageModal imageSrc="/images/spring-blog.png" altText="System architecture" caption="🔼 클릭 후 스크롤로 확대/축소" />
        </Box>
      </Container>
    </Box>
  );
}

export default function About() {
  return (
    <>
      <Bio />
      <LinksSection />
      <TechStackCompact />
      <CertsSection />
      <AwardsSection />
      <InfraSection />
    </>
  );
}
