
import { Box, Typography, Stack, Button } from '@mui/material';

import TitleSection from '@/components/section/TitleSection';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';
import { Link } from 'react-router-dom';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import BuildIcon from '@mui/icons-material/Build';



export default function Intro() {
  return (
    <article className="project-document project-document--intro">
      <div className="project-section-slot"><HeroSection /></div>
      <div className="project-section-slot"><TechStackSection /></div>
      <div className="project-section-slot"><PortfolioOverviewSection /></div>
      <div className="project-section-slot"><ImplementationDetailsSection /></div>
      <div className="project-section-slot"><ProjectsSection /></div>
      <div className="project-section-slot"><ReferenceSection /></div>
    </article>
  );
}

function HeroSection() {
  return (
    <TitleSection title="포트폴리오 웹사이트" subtitle="React · Spring Boot · Node.js SSR 기반 포트폴리오" description="프로젝트 소개와 기술 기록, Markdown 작성기와 검색용 HTML 응답" />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'Docker', color: 'info' },
        { label: 'AWS EC2', color: 'warning' },
        { label: 'Nginx(Reverse Proxy)', color: 'secondary' }
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
      category: 'SSR/SEO',
      labels: [
        { label: 'Node.js', color: 'success' },
        { label: 'Notion API', color: 'info' }
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
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{mb:1}} className="project-heading-row">
        <WebIcon color="primary" />
        <Typography variant="h5" component="h2" className="project-section-heading">
          포트폴리오 개요
        </Typography>
      </Stack>

      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        이 페이지는 제 개인 프로젝트와 기술 스택을 소개하는 포트폴리오 사이트입니다.
      </Typography>

      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        블로그 기능은 마크다운 기반 콘텐츠 작성과 댓글 시스템, JWT 기반 로그인을 포함합니다.<br />작성·편집 권한은 Spring API에서 검사합니다. <br />
        검색 봇의 HTML 응답과 Notion 문서 변환은 Node.js 서비스(<b>ssr-notion</b>)가 맡습니다. <br />
        저장소의 Nginx 설정은 봇의 <code>/blog/:id</code> 요청을 SSR로 전달하고 일반 사용자에게는 SPA를 제공합니다. <br />
        기존 글 주소를 유지하면서 작성·조회 역할과 외부 호출 범위를 정리했습니다. <br />
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        Notion 공식 JavaScript SDK(<code>@notionhq/client</code>)와 npm의 문서 변환·렌더링 라이브러리를
        활용하기 위해 Node.js 서비스를 도입했습니다. <br />
        API 통신과 Notion 블록 처리를 모두 직접 구현하는 부담을 줄이고, 블로그 HTML 생성도 같은 JavaScript 환경에서 처리하는 구성입니다. <br />
        현재 Notion 가져오기는 Spring에서 관리자 권한을 확인한 뒤 실행합니다.
      </Typography>
      <ul className="project-bullet-list">
        <li><b>작성:</b> React에서 Markdown과 커스텀 블록을 편집하고 미리봅니다. Notion은 선택한 페이지를 가져올 때 호출하며 결과는 게시글 본문으로 저장합니다.</li>
        <li><b>조회:</b> Spring이 저장된 글을 제공하고, Node는 이 본문으로 검색용 HTML을 만듭니다. 링크 카드는 저장된 제목·설명으로 표시합니다.</li>
        <li><b>자원:</b> 캐시의 개수·용량·수명을 제한하고, Notion 요청의 시간·크기·동시 실행 수도 제한했습니다.</li>
      </ul>
    </Box>
  );
}

function ProjectsSection() {
  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{mb:2}} className="project-heading-row">
        <CodeIcon color="secondary" />
        <Typography variant="h5" component="h2" className="project-section-heading">
          주요 프로젝트 목록
        </Typography>
      </Stack>

      <ul className="project-index-list">
      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/spring-boot.png" alt="Spring Boot" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            Spring Boot 블로그
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          Spring Boot로 개발한 RESTful API 서버와 블로그 시스템입니다.
          JWT 인증, CRUD 기능, 댓글 시스템이 구현되어 있으며 Docker 컨테이너로 배포됩니다.
        </Typography>
        <Button component={Link} to="/springboot" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/kubernetes.svg" alt="Kubernetes" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            K8S 오퍼레이터 for Managing Redis Clusters
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          Go 언어로 구현한 Redis 클러스터의 관리 자동화를 위한 Kubernetes Operator입니다. <br />
          Kredis라는 CRD(Custom Resource Definition)를 활용하여 Redis 클러스터 생성, 스케일링, 복구 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/kredis" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/go.png" alt="Go" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            Go JWT 인증 서버
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          Go 언어로 구현한 경량화된 JWT 인증 서버입니다.
          사용자 등록, 로그인, 토큰 관리 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/golang" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/opensearch.png" alt="OpenSearch" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            OpenSearch 대시보드
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          OpenSearch를 활용한 로그 수집 및 분석 대시보드입니다.
          실시간 모니터링과 데이터 시각화 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/opensearch" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/tensorflow.png" alt="Python" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            Python 머신러닝 프로젝트
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          집값 예측을 위한 머신러닝 모델을 구현한 프로젝트입니다.
          데이터 전처리, 모델 학습, 예측 파이프라인이 포함되어 있습니다.
        </Typography>
        <Button component={Link} to="/python" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/terraform.png" alt="Terraform" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            Terraform 인프라
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          Terraform을 이용한 인프라스트럭처 as 코드(IaC) 프로젝트입니다.
          클라우드 리소스를 자동으로 프로비저닝하고 관리하는 파이프라인을 구현했습니다.
        </Typography>
        <Button component={Link} to="/terraform" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/chrome.png" alt="Chrome Extension" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            Chrome 확장 앱
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          업무 생산성 향상을 위한 Chrome 확장 프로그램입니다.
          자동화 기능과 내부 시스템 연동을 통해 업무 효율성을 높입니다.
        </Typography>
        <Button component={Link} to="/chrome" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>

      <Box component="li" className="project-index-item">
        <Stack direction="row" spacing={2} alignItems="center" sx={{mb:1}} className="project-heading-row">
          <Box component="img" src="/logo/redmine.png" alt="Redmine" sx={{width:36,height:36,objectFit:'contain'}} />
          <Typography variant="h6" component="h3" className="project-subsection-heading">
            레드마인 자동화 도구
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{mb:1}}>
          레드마인 프로젝트 관리 시스템을 위한 자동화 도구입니다.
          이슈 추적, 보고서 생성 및 워크플로우 자동화 기능을 제공합니다.
        </Typography>
        <Button component={Link} to="/redmine" variant="outlined" size="small" sx={{ mr: 1 }}>
          자세히 보기
        </Button>
      </Box>
      </ul>
    </Box>
  );
}

function ImplementationDetailsSection() {
  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{mb:1}} className="project-heading-row">
        <BuildIcon />
        <Typography variant="h5" component="h2" className="project-section-heading">
          구현 상세
        </Typography>
      </Stack>

      <Typography variant="body1" component="p" sx={{mb:2}}>
        본 프로젝트는 프론트엔드와 백엔드를 분리한 웹 아키텍처로 구성되어 있습니다.
        CI/CD 파이프라인을 통해 자동 배포되며, Docker 컨테이너로 서비스됩니다.
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <Typography variant="h6" gutterBottom component="h3" className="project-subsection-heading">
          🔄 CI/CD 파이프라인
        </Typography>
      </Stack>
      <ZoomableImageModal imageSrc="/images/cicd.png" altText="CI/CD 파이프라인" caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다." />

      <Typography variant="h6" gutterBottom component="h3" className="project-subsection-heading">
        🖥️ 시스템 아키텍처
      </Typography>
      <ZoomableImageModal imageSrc="/images/spring-blog.png" altText="Spring Diagram" caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다." />

      <Typography variant="body1" sx={{mt:2}}>
        <strong>구현 구성:</strong> 검색 봇을 위한 HTML 응답은 <b>별도 Node.js SSR 서비스(ssr-notion)</b>로 구현했습니다.
        Nginx가 봇을 감지하면 <code>/blog/:id</code>를 SSR로 프록시하고, <code>/notion/*</code> · <code>/seo/*</code> · <code>/sitemap.xml</code> · <code>/robots.txt</code>
        엔드포인트를 통해 Notion 문서 변환과 검색용 HTML을 제공합니다. Notion 가져오기는 관리자 전용이며,
        링크 미리보기는 임의 사이트를 조회하지 않는 기본 정보 응답으로 바꿨습니다.
      </Typography>
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Reference spaLinks={[
      ]} externalLinks={[
        {
          prefix: 'GitHub:',
          href: 'https://github.com/hkpark130/React-Intro',
          label: 'React-Intro 저장소'
        }
      ]} />
  );
}
