
import { Box, Typography, Stack } from '@mui/material';

import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import BuildIcon from '@mui/icons-material/Build';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WebIcon from '@mui/icons-material/Web';



export default function SpringBootProject() {
  return (
    <article className="project-document project-document--spring-boot">
      <div className="project-section-slot"><HeroSection /></div>
      <div className="project-section-slot"><TechStackSection /></div>
      <div className="project-section-slot"><OverviewSection /></div>
      <div className="project-section-slot"><ImplementationSection /></div>
      <div className="project-section-slot"><ReferenceSection /></div>
    </article>
  );
}

function HeroSection() {
  return (
    <TitleSection title="스프링 블로그 (Spring Boot)" subtitle="Spring Boot를 이용하여 간단한 블로그 제작" description="Amazon EC2 + Docker + MySQL + CodeDeploy" />
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
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
        <WebIcon color="primary" /> 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
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
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <BuildIcon />
        <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
          구현 상세
        </Typography>
      </Stack>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        당시 배포 구성은 AWS EC2의 Docker와 CodePipeline·CodeDeploy를 연결하는 방식입니다.
        배포 브랜치에 Push하면 파이프라인이 시작되는 구성입니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        게시글과 사용자 정보를 관계형 DB에 저장하고, REST API로 조회·작성·댓글 기능을 제공합니다.
      </Typography>

      <Typography variant="h5" gutterBottom component="h3" className="project-subsection-heading">
        🖥️ 프로젝트 아키텍쳐
      </Typography>
      <ZoomableImageModal imageSrc="/images/spring-blog.png" altText="Spring Diagram" caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다." />
      
      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <AccountTreeIcon />
        <Typography variant="h6" gutterBottom component="h3" className="project-subsection-heading">
          JWT 인증 흐름도
        </Typography>
      </Stack>
      <ZoomableImageModal imageSrc="/images/blog-jwt.jpg" altText="Spring JWT 인증 흐름도" caption="JWT 발급과 갱신 흐름" />
      <Typography variant="body2" component="p" sx={{mb:1.5}}>
        서명 키는 외부 설정으로 분리하고 Access·Refresh의 용도와 발급자를 검증합니다.
        갱신은 Refresh 검증 뒤 DB 저장값과 사용자 연결을 확인하며, 일반 API는 Access만 허용합니다.
        갱신할 때 Refresh Token도 교체하고 이전 토큰의 재사용을 막는 방식은 보완할 부분입니다.
      </Typography>

      <div>
        <CodeAccordion title="초기 게시글 캐시 구현 발췌" codeString={codeString} />
      </div>
      <Typography variant="body2" component="p" sx={{mt:1.5}}>
        위 발췌는 초기 구현입니다. 이후 최대 64개·120초 만료의 Caffeine 캐시를 사용하도록 바꾸고,
        글·댓글 변경이 성공적으로 저장된 뒤 해당 게시글 캐시를 무효화합니다. 목록의 댓글 수는 한 번에 조회하며,
        작성기는 수정 시각을 대조해 저장 충돌을 안내합니다.
      </Typography>
    </Box>
  );
}

function ReferenceSection() {
  return (
      <Reference spaLinks={[
          {
            prefix: '블로그 페이지:',
            to: '/blog',
            label: '"Spring Blog" 카테고리',
            highlighted: true
          }
        ]} externalLinks={[
          {
            prefix: 'GitHub:',
            href: 'https://github.com/hkpark130/Spring-Blog',
            label: 'https://github.com/hkpark130/Spring-Blog'
          }
        ]} />
  );
}
