// src/components/KredisOperator.jsx
// 분리된 섹션 컴포넌트들을 조합하는 메인 컴포넌트
import React from 'react';
import { motion } from 'framer-motion';
import { Container, Paper, Divider } from '@mui/material';

// 분리된 섹션 컴포넌트들 import
import {
  HeroSection,
  TechStackSection,
  BackgroundSection,
  ArchitectureSection,
  ReconcileFlowSection,
  ArchitectureDiagramsSection,
  AutoscalingDemoSection,
  FeaturesSection,
  CRDExampleSection,
  ClusterStatesSection,
  GrafanaSection,
  TroubleshootingSection,
  LessonsLearnedSection,
  ReferenceSection,
} from './kredis/KredisSections';

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

export default function KredisOperatorFinal() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        mx: 'auto',
        py: { xs: 3, sm: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 1, lg: 2 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 3, sm: 4 },
          bgcolor: '#f9f9ff',
        }}
      >
        <motion.div initial="hidden" animate="visible" variants={sectionVariant}>
          <motion.div variants={sectionVariant} custom={0}>
            <HeroSection />
          </motion.div>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          <motion.div variants={sectionVariant} custom={1} style={{ marginTop: 32 }}>
            <TechStackSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={2} style={{ marginTop: 32 }}>
            <BackgroundSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={3} style={{ marginTop: 32 }}>
            <ArchitectureSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={3} style={{ marginTop: 32 }}>
            <ReconcileFlowSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={4} style={{ marginTop: 32 }}>
            <ArchitectureDiagramsSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={5} style={{ marginTop: 32 }}>
            <AutoscalingDemoSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={6} style={{ marginTop: 32 }}>
            <FeaturesSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={7} style={{ marginTop: 32 }}>
            <CRDExampleSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={8} style={{ marginTop: 32 }}>
            <ClusterStatesSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={9} style={{ marginTop: 32 }}>
            <GrafanaSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={10} style={{ marginTop: 32 }}>
            <TroubleshootingSection />
          </motion.div>

          <motion.div variants={sectionVariant} custom={11} style={{ marginTop: 32 }}>
            <LessonsLearnedSection />
          </motion.div>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          <motion.div variants={sectionVariant} custom={12} style={{ marginTop: 32 }}>
            <ReferenceSection />
          </motion.div>
        </motion.div>
      </Paper>
    </Container>
  );
}
