import React from 'react';
import { Box, Container } from '@mui/material';

export default function Bio() {
  return (
    <Box component="section" sx={{ py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md">
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
          About
        </Box>
        <Box component="h1" sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--ink)', mt: 1, mb: 0 }}>
          박현경
        </Box>
        <Box sx={{ display: 'inline-block', mt: 1, px: 1.2, py: 0.4, bgcolor: 'var(--ink)', color: 'var(--on-ink)', borderRadius: 'var(--radius-xs)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px' }}>
          DEVOPS ENGINEER · CKA · AWS SAA
        </Box>
        <Box sx={{ maxWidth: 620, fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.75, mt: 3 }}>
          {/* TODO(user): 2~3 문단의 본인 소개를 여기에. 현재는 placeholder. */}
          Cloud-native 시스템을 설계·운영하며 Kubernetes Operator, Infrastructure as Code,
          그리고 관찰성(observability)을 깊이 다뤄 왔습니다. 작은 리소스 위에서도 안정적으로
          움직이는 시스템, 측정 가능한 개선, 반복 가능한 자동화에 관심이 있습니다.
        </Box>
      </Container>
    </Box>
  );
}
