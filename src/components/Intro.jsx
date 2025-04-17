import React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function Intro() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>반갑습니다!</Typography>
      <Typography variant="body1">
        이 페이지는 제가 만든 프로젝트들을 소개하기 위한 포트폴리오입니다.
        사이드바를 클릭해서 각 프로젝트 페이지를 확인하세요.
      </Typography>
    </Box>
  )
}
