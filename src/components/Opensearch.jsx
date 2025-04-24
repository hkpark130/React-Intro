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
import StorageIcon from '@mui/icons-material/Storage';
import DashboardIcon from '@mui/icons-material/Dashboard';

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
    <TitleSection
      title="오픈서치 대시보드 (OpenSearch DashBoard)"
      subtitle="Docker 기반의 로그 모니터링 시스템 구축"
      description="Docker + Packetbeat + Logstash + OpenSearch"
    />
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
      <Typography variant="h5" gutterBottom>
        📌 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        OpenSearch와 관련 도구들을 Docker로 구성하여 로그 모니터링 시스템을 구축한 프로젝트입니다.
        Packetbeat를 통해 네트워크 패킷을 수집하고, Logstash로 데이터를 처리한 후, OpenSearch에 저장하여 대시보드를 통해 시각화합니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        오픈서치(OpenSearch)를 사용하여 시스템 로그를 실시간으로 모니터링하고 분석할 수 있는 환경을 구축하였습니다.
      </Typography>
    </Box>
  );
}

function ImplementationSection() {
  const codeString = `opensearch-node1:
  image: opensearchproject/opensearch:2.11.0
  container_name: opensearch-node1
  environment:
    - discovery.type=single-node
    # 중요한 옵션들...
  ports:
    - 9200:9200
    - 9600:9600
  volumes:
    - opensearch-data:/usr/share/opensearch/data

logstash:
  image: opensearchproject/logstash-oss-with-opensearch-output-plugin:8.12.0
  container_name: logstash
  volumes:
    - ./logstash/pipelines:/usr/share/logstash/pipeline
  ports:
    - 5044:5044
    - 9600:9600

packetbeat:
  image: docker.elastic.co/beats/packetbeat:8.12.1
  container_name: packetbeat
  user: root
  volumes:
    - ./packetbeat/packetbeat.yml:/usr/share/packetbeat/packetbeat.yml
  network_mode: "host"

opensearch-dashboards:
  image: opensearchproject/opensearch-dashboards:2.11.0
  container_name: opensearch-dashboards
  ports:
    - 5601:5601
  environment:
    - OPENSEARCH_HOSTS=["http://opensearch-node1:9200"]
  depends_on:
    - opensearch-node1`;

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
        컨테이너화하여 쉽게 배포하고 관리할 수 있도록 구성했습니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        Packetbeat는 네트워크 패킷을 수집하여 HTTP, MySQL 등의 프로토콜을 분석하고, 
        Logstash는 이 데이터를 가공하여 OpenSearch로 전송합니다.
        OpenSearch DashBoard를 통해 직관적인 시각화 인터페이스를 제공하여 실시간 모니터링 및 분석이 가능합니다.
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        🚀 서비스 구성도
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/opensearch-architecture.jpg"
        altText="OpenSearch 서비스 구성도"
        caption="OpenSearch, Logstash, Packetbeat 서비스 구성도"
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        📊 서비스 구성요소
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/logo/docker.png" alt="Docker" width="50" height="40" style={{ objectFit: 'contain' }} />
          <Typography variant="body1">
            <strong>Docker:</strong> 컨테이너 기반으로 모든 서비스 관리
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/logo/packetbeat.png" alt="Packetbeat" width="50" height="50" style={{ objectFit: 'contain' }} />
          <Typography variant="body1">
            <strong>Packetbeat:</strong> 네트워크 패킷 수집 및 분석
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/logo/logstash.png" alt="Logstash" width="50" height="50" style={{ objectFit: 'contain' }} />
          <Typography variant="body1">
            <strong>Logstash:</strong> 데이터 처리 및 변환 파이프라인
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/logo/opensearch.png" alt="OpenSearch" width="50" height="50" style={{ objectFit: 'contain' }} />
          <Typography variant="body1">
            <strong>OpenSearch:</strong> 분산형 RESTful 검색 및 분석 엔진
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/logo/opensearch-dashboard.png" alt="OpenSearch Dashboard" width="50" height="50" style={{ objectFit: 'contain' }} />
          <Typography variant="body1">
            <strong>OpenSearch Dashboard:</strong> 데이터 시각화 및 대시보드 제공
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        💻 OpenSearch 대시보드 스크린샷
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/opensearch-dashboard.jpg"
        altText="OpenSearch Dashboard 스크린샷"
        caption="OpenSearch Dashboard - 로그 분석 및 시각화 화면"
        sx={{ border: '2px solid #ddd', borderRadius: 2, my: 2 }}
      />

      <motion.div variants={sectionVariant} custom={3.5}>
        <CodeAccordion 
          title="Docker Compose 구성 코드"
          codeString={codeString}
          language="yaml"
        />
      </motion.div>
    </Box>
  );
}

function ReferenceSection() {
  const openSearchConsoleCode = `opensearch-interfaces:serverjs> $ sh
opensearch@opensearch-interfaces:~/serverjs> pwd
/home/opensearch/serverjs
opensearch@opensearch-interfaces:~/serverjs> ls
index.js  node_modules  package.json  package-lock.json
opensearch@opensearch-interfaces:~/serverjs> cat index.js 
const { Client } = require('@opensearch-project/opensearch');

// 호스트 설정
const host = 'http://opensearchproject.example:9200';
const client = new Client({ node: host });

// 인덱스 검색 예제
async function run() {
  try {
    const response = await client.search({
      index: 'logstash-*',
      body: {
        query: {
          match_all: {}
        },
        size: 10
      }
    });
    console.log(response.body.hits.hits);
  } catch (err) {
    console.error('검색 오류:', err);
  }
}

run();`;

  return (
    <Box>
      <Reference
        spaLinks={[
          {
            prefix: '블로그 페이지:',
            to: '/blog',
            label: '"OpenSearch 모니터링" 관련 포스트'
          }
        ]}
        externalLinks={[
          {
            prefix: 'GitHub:',
            href: 'https://github.com/hkpark130/opensearch-dashboard',
            label: 'https://github.com/hkpark130/opensearch-dashboard'
          }
        ]}
      />
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          OpenSearch 연동 코드 예시
        </Typography>
        <CodeAccordion 
          title="Node.js로 OpenSearch 연결하기"
          codeString={openSearchConsoleCode}
          language="javascript"
        />
      </Box>
    </Box>
  );
}