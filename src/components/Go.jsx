// src/components/projects/GoProject.jsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Link as MuiLink,
  Divider,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';

const sectionVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 },
  }),
};

function Go() {
  const [open, setOpen] = useState(false);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariant}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: '#f9f9ff' }}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            🛡️ Go로 만든 JWT 인증 서버
          </Typography>
          <Divider sx={{ my: 3 }} />

          {/* 개요 */}
          <motion.div variants={sectionVariant} custom={0}>
            <Typography variant="h5" gutterBottom>📌 개요</Typography>
            <Typography variant="body1" color="text.secondary">
              Go 언어로 구현된 JWT 인증 서버로, 사용자 로그인, 토큰 발급/검증, 리프레시 토큰 재발급 기능을 포함합니다.
              보안성과 확장성을 고려한 설계가 돋보입니다.
            </Typography>
          </motion.div>

          {/* 기술 스택 */}
          <motion.div variants={sectionVariant} custom={1} style={{ marginTop: 32 }}>
            <Typography variant="h5" gutterBottom>🚧 기술 스택</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {['Go', 'JWT', 'REST API', 'Gin', 'GORM', 'MySQL', 'Docker'].map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 500 }}
                />
              ))}
            </Stack>
          </motion.div>

          {/* 링크 */}
          <motion.div variants={sectionVariant} custom={2} style={{ marginTop: 32 }}>
            <Typography variant="h5" gutterBottom>🔗 링크</Typography>
            <Typography variant="body1">
              깃허브:{' '}
              <MuiLink
                href="https://github.com/your-username/go-jwt-server"
                target="_blank"
                underline="hover"
                color="primary"
              >
                github.com/your-username/go-jwt-server
              </MuiLink>
            </Typography>
          </motion.div>

          {/* 흐름도 */}
          <motion.div variants={sectionVariant} custom={3} style={{ marginTop: 32 }}>
            <Typography variant="h5" gutterBottom>🧭 인증 흐름도</Typography>
            <Card sx={{ mt: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="body1" color="text.secondary">
                  사용자 → 로그인 <br />
                  서버: 계정 검증 → JWT 발급 → 클라이언트에서 JWT 저장<br />
                  클라이언트 → 요청 시 JWT 포함 → 서버에서 JWT 검증
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          {/* 아키텍처 */}
          <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
            <Typography variant="h5" gutterBottom>🏗️ 아키텍처</Typography>
            <Typography variant="body1" color="text.secondary">
              Handler - Service - Repository 구조 분리로 유지보수성을 강화했으며,
              DB 사용에는 GORM, HTTP 라우팅에는 Gin 프레임워크를 적용했습니다.
              컨테이너화는 Docker를 활용하여 환경 관리 및 배포를 효율화했습니다.
            </Typography>
          </motion.div>

          <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        💌 나에게 연락하기
      </Button>
    </>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default Go;