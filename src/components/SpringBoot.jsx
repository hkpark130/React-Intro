import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Container
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal'; 
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';

/* =======================
   단일 애니메이션 Variants 정의
   ======================= */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function SpringBootProject() {
  return (
    <Container 
      maxWidth="md" 
      sx={{
        mx: "auto",               // 중앙 정렬
        py: { xs: 3, sm: 4, md: 6 }, // 반응형 상하 패딩
        px: { xs: 2, sm: 3, md: 4 }, // 반응형 좌우 패딩
        display: 'flex', 
        flexDirection: 'column'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 3, sm: 4 }
        }}
      >
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <HeroSection />
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          <TechStackSection />
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          <OverviewSection />
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          <ImplementationSection />
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          <OutcomeSection />
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          <ReferenceSection />
        </motion.div>
      </Paper>
    </Container>
  );
}

function HeroSection() {
  return (
    <TitleSection
        title="스프링 블로그 (Spring Boot)"
        subtitle="Spring Boot를 이용하여 간단한 블로그 제작"
        description="Amazon EC2 + Docker + MySQL + CodeDeploy"
      />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '개발환경',
      labels: [
        { label: 'Docker', color: 'info' },
      ],
    },
    {
      category: '백엔드',
      labels: [
        { label: 'Spring Boot', color: 'success' },
      ],
    },
    {
      category: 'DB',
      labels: [
        { label: 'MySQL', color: 'primary' },
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

  return <TechStack techStacks={techStacks} />;
}

function OverviewSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        스프링 부트로 만든 간단한 블로그 페이지입니다. Amazon EC2 환경에서 Docker 컨테이너로 배포하고, MySQL을 이용해 포스팅 데이터를 관리합니다.
      </Typography>
    </Box>
  );
}

function ImplementationSection() {
    const codeString = `@RestController
@RequestMapping("/api/posts")
public class PostController {

    @GetMapping
    public List<Post> getAllPosts() {
        // DB에서 모든 게시글 조회
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        // 게시글 생성 후 저장
    }

    // 기타 API 구현 생략
}`;

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" gutterBottom>
            구현 상세
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
            AWS EC2 인스턴스에서 Docker를 통해 Spring Boot와 MySQL 컨테이너를 구동하며, CodePipeline과 CodeDeploy를 이용해 CI/CD 파이프라인을 구성합니다.
            GitHub에 Push가 발생하면 Pipeline이 트리거되어 애플리케이션을 빌드하고 자동으로 배포까지 완료되도록 설정되어 있습니다.
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
            데이터베이스는 RDS가 아닌 EC2 내부 MySQL 컨테이너에서 관리하며, 게시글과 사용자 정보를 관리합니다.
            REST API는 프론트엔드와의 통신을 위한 구조로 설계되어 있고, 기본적인 CRUD 외에도 간단한 인증 로직이 구현되어 있습니다.
        </Typography>

        <Typography variant="h5" gutterBottom>
            프로젝트 아키텍쳐
        </Typography>
        <ZoomableImageModal
            imageSrc="/images/spring-blog.jpg"
            altText="Spring Diagram"
            caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다."
            sx={{ border: '2px solid #ddd', borderRadius: 2 }}
        />

        <Typography variant="h5" sx={{ mt: 2 }} gutterBottom>
            JWT 인증 흐름도
        </Typography>
        <ZoomableImageModal
            imageSrc="/images/blog-jwt.jpg"
            altText="Spring Diagram"
            caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다."
            sx={{ border: '2px solid #ddd', borderRadius: 2 }}
        />

        <CodeAccordion codeString={codeString} />
    </Box>
  );
}

function OutcomeSection() {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        결과 및 성과
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        해당 블로그 프로젝트를 통해 배포 자동화와 컨테이너 기반 인프라에 대한 경험을 쌓을 수 있었습니다.
      </Typography>
      <Box component="ul" sx={{ pl: 3 }}>
        <li>
          <Typography variant="body1" component="p">
            AWS EC2, Docker, MySQL 기반 DevOps 파이프라인 구축 경험
          </Typography>
        </li>
        <li>
          <Typography variant="body1" component="p">
            CodeDeploy를 통한 무중단 배포 및 버전 관리
          </Typography>
        </li>
        <li>
          <Typography variant="body1" component="p">
            Spring Boot 기반 게시글, 댓글, 사용자 CRUD 기능 구현
          </Typography>
        </li>
      </Box>
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Reference
      spaLinks={[
        {
          prefix: '블로그 페이지:',
          to: '/blog',
          label: '"Spring Blog" 카테고리'
        }
      ]}
      externalLinks={[
        {
          prefix: 'GitHub:',
          href: 'https://github.com/hkpark130/Spring-Blog',
          label: 'https://github.com/hkpark130/Spring-Blog'
        }
      ]}
    />
  );
}
