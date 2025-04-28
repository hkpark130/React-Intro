import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Container,
  Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal'; 
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
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

export default function SpringBootProject() {
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
      category: '인프라',
      labels: [
        { label: 'Docker', color: 'info' },
        { label: 'AWS EC2', color: 'warning' }
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
        스프링 부트로 만든 간단한 블로그 페이지입니다. Amazon EC2 환경에서 Docker 컨테이너로 배포하고, MySQL을 이용해 포스팅 데이터를 관리합니다.
      </Typography>
    </Box>
  );
}

function ImplementationSection() {
  const codeString = `    # 게시글 조회시 캐시에 저장
    @Cacheable(value = "posts", key = "#id")
    public PostResponseDto getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        return convertToDto(post);
    }
    
    # 삭제 및 수정시 commentCounts:댓글수, posts:게시글 캐시 제거
    @Transactional
    @CacheEvict(value = {"posts", "commentCounts"}, key = "#postId")
    public void deletePost(Long postId, String username) {
    ...
    @Transactional
    @CacheEvict(value = {"posts"}, key = "#postId")
    public void updatePost(Long postId, PostRequestDto dto, String username) {
`;

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
        AWS EC2 인스턴스에서 Docker를 통해 Spring Boot와 MySQL 컨테이너를 구동하며, CodePipeline과 CodeDeploy를 이용해 CI/CD 파이프라인을 구성합니다.
        GitHub에 Push가 발생하면 Pipeline이 트리거되어 애플리케이션을 빌드하고 자동으로 배포까지 완료되도록 설정되어 있습니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        데이터베이스는 RDS가 아닌 EC2 내부 MySQL 컨테이너에서 관리하며, 게시글과 사용자 정보를 관리합니다.
        REST API는 프론트엔드와의 통신을 위한 구조로 설계되어 있고, 기본적인 CRUD 외에도 간단한 인증 로직이 구현되어 있습니다.
      </Typography>

      <Typography variant="h5" gutterBottom>
        🖥️ 프로젝트 아키텍쳐
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/spring-blog.jpg"
        altText="Spring Diagram"
        caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다."
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />
      
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <AccountTreeIcon />
        <Typography variant="h6" gutterBottom>
          JWT 인증 흐름도
        </Typography>
      </Stack>
      <ZoomableImageModal
        imageSrc="/images/blog-jwt.jpg"
        altText="Spring Diagram"
        caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다."
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />

      <motion.div variants={sectionVariant} custom={3.5}>
        <CodeAccordion codeString={codeString} />
      </motion.div>
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
            label: '"Spring Blog" 카테고리',
            highlighted: true
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