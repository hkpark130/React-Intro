import React from 'react'
import {
  Box,
  Typography,
  Card,
  Paper,
  Button,
  CardContent,
  CardActions,
  Container
} from '@mui/material';

export default function Profile() {
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
        <Box justifyContent="center" display="flex" flexWrap="wrap" gap={2}>
          <Card sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h5">Spring Boot Project</Typography>
              <Typography variant="body2">
                서버 사이드 애플리케이션용 스프링 부트 예제
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href="https://github.com/..." target="_blank">
                GitHub
              </Button>
            </CardActions>
          </Card>

          <Card sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h5">Python Project</Typography>
              <Typography variant="body2">
                파이썬을 사용한 데이터 분석/크롤링/ETL 파이프라인 프로젝트
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href="https://github.com/..." target="_blank">
                GitHub
              </Button>
            </CardActions>
          </Card>

          {/* 필요한 만큼 Card 또는 컴포넌트를 추가 */}
        </Box>
      </Paper>
    </Container>
  )
}
