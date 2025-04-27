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

export default function GolangProject() {
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
      title="JWT 인증 시스템 (Golang)"
      subtitle="Go 언어를 이용한 JWT 인증 서비스 개발"
      description="Redis + PostgreSQL + Clean Architecture"
    />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'Docker', color: 'info' },
        { label: 'AWS EC2', color: 'warning' },
        { label: 'Apache [프론트 엔드]', color: 'error' },
      ],
    },
    {
      category: '백엔드',
      labels: [
        { label: 'Go', color: 'info' },
      ],
    },
    {
      category: '인증',
      labels: [
        { label: 'JWT', color: 'secondary' },
        { label: '토큰 관리', color: 'success' },
      ],
    },
    {
      category: '데이터베이스',
      labels: [
        { label: 'Redis', color: 'error' },
        { label: 'PostgreSQL', color: 'primary' },
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
        Go 언어를 이용하여 JWT 인증 인증 서비스를 구현한 프로젝트입니다. Access Token과 Refresh Token을 활용하여 안전하고 효율적인 사용자 인증 시스템을 제공합니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        Redis를 이용해 토큰 정보를 관리하고, Cookie를 통해 클라이언트에게 토큰을 전달합니다. Golang 컨테이너는 3000번 포트를 사용하며, Apache Proxy를 통해 외부 연결을 제공합니다.
      </Typography>
    </Box>
  );
}

function ImplementationSection() {
  const authHandlerCode = `// 토큰 생성 로직입니다. Header와 Payload, signature 포함한 토큰을 발급합니다.
func IssueToken(payload *Payload) (string, error) {
	jwt := &Jwt{Alg: "HS256", SecretKey: os.Getenv("SECRET_KEY")}

	jsonHeader, err := json.Marshal(Header{
		Typ: "JWT",
		Alg: jwt.Alg,
	})
	if err != nil {
		log.Panicln("json encode error: %w ", err)
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Panicln("json encode error: %w ", err)
	}

	msg := strings.Join([]string{
		base64.RawURLEncoding.EncodeToString(jsonHeader),
		base64.RawURLEncoding.EncodeToString(jsonPayload)}, ".")

	signature := hmac256(msg, jwt.SecretKey)

	token := strings.Join([]string{
		base64.RawURLEncoding.EncodeToString(jsonHeader),
		base64.RawURLEncoding.EncodeToString(jsonPayload),
		signature}, ".")

	return token, err
}`;

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
        이 프로젝트는 Go 언어와 Gin 프레임워크를 사용하여 효율적이고 확장 가능한 JWT 인증 시스템을 구현했습니다. Access Token과 Refresh Token을 모두 지원하여 보안성을 강화했습니다.
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
        Redis는 토큰 저장소로 활용되어 빠른 조회와 검증이 가능하며, PostgreSQL은 사용자 정보를 저장합니다. 클린 아키텍처 패턴을 적용하여 도메인, 유스케이스, 인터페이스 계층이 명확히 분리되어 있습니다.
      </Typography>

      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
      >
        <AccountTreeIcon />
        <Typography variant="h6" gutterBottom>
          JWT 인증 처리 흐름
        </Typography>
      </Stack>
      <ZoomableImageModal
        imageSrc="/images/go-jwt-flow.png"
        altText="JWT 인증 처리 흐름"
        caption="🔼 클릭 후 스크롤하면 확대/축소, 드래그하면 이미지 이동 가능합니다."
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        📂 클린 아키텍처 구조
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/clean.png"
        altText="클린 아키텍처 구조"
        caption="gorm.DB 인터페이스에 의존하여 어댑터만 변경하면 PostSQL에서 MySQL로 전환하기 쉽도록 구현하였습니다."
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />
      <Box 
        component="pre" 
        sx={{ 
          p: 0, 
          borderRadius: 2, 
          bgcolor: 'grey.100',
          overflowX: 'auto',
          fontSize: '0.9em',
          fontFamily: 'monospace'
        }}
      >
        {`api/
  ├── domain/       # 도메인 모델과 인터페이스 정의
  ├── repository/   # 데이터 접근 계층
  ├── handlers/     # 비즈니스 로직 및 요청 처리
  ├── middleware/   # 인증 및 검증 로직
  └── adapter/      # 외부 시스템 연결 (DB, Redis)`}
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        🖥️ 서버 구성도
      </Typography>
      <ZoomableImageModal
        imageSrc="/images/go.png"
        altText="서버 구성도"
        caption="Docker 컨테이너 기반의 서버 구성도"
        sx={{ border: '2px solid #ddd', borderRadius: 2 }}
      />

      <motion.div variants={sectionVariant} custom={3.5} style={{ marginTop: 16 }}>
        <CodeAccordion 
          title="토큰 발급 코드"
          codeString={authHandlerCode} 
          language="go"
        />
      </motion.div>
    </Box>
  );
}

function ReferenceSection() {
  return (
      <Reference
        spaLinks={[
        ]}
        externalLinks={[
          {
            prefix: 'GitHub:',
            href: 'https://github.com/hkpark130/go-jwt',
            label: 'https://github.com/hkpark130/go-jwt'
          },
          {
            prefix: '실제 프로젝트 페이지:',
            href: 'https://hkpark130.p-e.kr:8300',
            label: 'https://hkpark130.p-e.kr:8300',
            highlighted: true
          }
        ]}
      />
  );
}