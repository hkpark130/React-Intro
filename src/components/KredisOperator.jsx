// src/components/projects/KredisOperatorFinal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Paper,
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CodeAccordion from '@/components/section/CodeAccordion';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SettingsIcon from '@mui/icons-material/Settings';
import DataObjectIcon from '@mui/icons-material/DataObject';
import Reference from '@/components/section/Reference';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Cloud as CloudIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Architecture as ArchitectureIcon,
  PlayArrow as PlayArrowIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Balance as BalanceIcon,
  Healing as HealingIcon,
  ExpandMore as ExpandMoreIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  AutoFixHigh as AutoFixHighIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  BugReport as BugReportIcon,
  Lightbulb as LightbulbIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import TitleSection from '@/components/section/TitleSection';
import TechStack from '@/components/section/TechStack';

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
        mx: "auto",
        py: { xs: 3, sm: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 1, lg: 2 },
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

/* =======================
   Hero Section
   ======================= */
function HeroSection() {
  return (
    <>
      <TitleSection
        title="Kubernetes Operator 구축기"
        subtitle="쿠버네티스 환경에서 Redis 클러스터를 자동화하다"
        description="Kubernetes Operator 패턴을 활용한 Redis 클러스터 자동 생성, 스케일링, 자동 복구 시스템 개발기. 카카오 기술 블로그를 보고 영감을 받아 직접 구현해본 프로젝트입니다."
      />
      <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <strong>참고:</strong>
          <Box
            component="img"
            src="/logo/kakao.png"
            alt="Kakao"
            sx={{ width: 23, height: 23, objectFit: 'contain', borderRadius: 5 }}
          />
          <Link
            href="https://tech.kakao.com/posts/491"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' }}
          >
            Kakao Tech 블로그 - Redis Cluster Operator
          </Link>
          를 참고하여 직접 구현한 프로젝트입니다.
        </Typography>
      </Box>
    </>
  );
}

/* =======================
   Tech Stack Section
   ======================= */
function TechStackSection() {
  const techStacks = [
    {
      category: '개발 언어',
      labels: [
        { label: 'Go', color: 'info' },
        { label: 'Kubebuilder', color: 'primary' },
      ],
    },
    {
      category: '인프라',
      labels: [
        { label: 'Kubernetes', color: 'primary' },
        { label: 'Docker', color: 'info' },
        { label: 'Redis Cluster', color: 'error' },
      ],
    },
    {
      category: '모니터링',
      labels: [
        { label: 'Prometheus', color: 'warning' },
        { label: 'Grafana', color: 'success' },
        { label: 'Redis Exporter', color: 'error' },
      ],
    },
    {
      category: '쿠버네티스 리소스',
      labels: [
        { label: 'CRD', color: 'secondary' },
        { label: 'Pod', color: 'info' },
        { label: 'Service', color: 'success' },
        { label: 'PVC', color: 'warning' },
      ],
    },
  ];

  return (
    <TechStack techStacks={techStacks} />
  );
}

/* =======================
   Background Section
   ======================= */
function BackgroundSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 0.3
        }}
      >
        <TipsAndUpdatesIcon color="action" /> 프로젝트 배경
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>왜 Redis Operator를 만들게 되었나?</AlertTitle>
        카카오 기술 블로그의 "쿠버네티스에 레디스 캐시 클러스터 구축기"를 보고 영감을 받았습니다. 
        Kubernetes Operator 패턴에 대한 이해도를 높이기 위해 직접 구현해보는 개인 프로젝트로 시작했습니다.
      </Alert>
    </Box>
  );
}

/* =======================
   Architecture Section
   ======================= */
function ArchitectureSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <ArchitectureIcon color="primary" /> 시스템 아키텍처
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Kredis<strong>(CRD)</strong> Operator는 Kubebuilder 프레임워크를 기반으로 개발되었으며, 
        Kubernetes의 <strong>Reconcile Loop 패턴</strong>을 따릅니다.
      </Typography>

      {/* 주요 컴포넌트 */}
      <Card elevation={2} sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🏗️ 주요 컴포넌트
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            {[
              {
                title: 'KredisReconciler',
                desc: 'Kredis CR 이벤트 감지 및 처리\nPod, Service, PVC 리소스 관리\nFinalizer를 통한 리소스 정리',
                color: '#e3f2fd',
                textColor: 'primary',
              },
              {
                title: 'ClusterManager',
                desc: 'Redis 클러스터 상태 관리\n클러스터 생성/스케일링/복구 작업\nJob 기반 클러스터 명령 실행',
                color: '#fff3e0',
                textColor: 'warning.dark',
              },
              {
                title: 'Autoscaler',
                desc: 'Metrics API를 통한 리소스 모니터링\nCPU/Memory 기반 자동 스케일링\nStabilization Window로 안정성 확보',
                color: '#e8f5e9',
                textColor: 'success.dark',
              },
              {
                title: 'JobManager',
                desc: 'Redis 클러스터 작업을 Job으로 비동기 실행\nReconcile 마다 Job 모니터링\n장시간 작업(리밸런싱/리샤딩) 처리',
                color: '#fce4ec',
                textColor: 'error.dark',
              },
            ].map((comp) => (
              <Card
                key={comp.title}
                elevation={1}
                sx={{
                  bgcolor: comp.color,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: 'none',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color={comp.textColor} gutterBottom>
                    {comp.title}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {comp.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function ReconcileFlowSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <CloudSyncIcon color="info" /> Reconcile Loop 동작 방식
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        Operator의 핵심은 <strong>Reconcile Loop</strong>입니다. 
        사용자가 정의한 Desired State(CR)와 현재 Actual State를 지속적으로 비교하여 
        일치시키는 작업을 수행합니다.
      </Typography>

      <Card 
        elevation={2}
        sx={{ 
          mb: 3,
          background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {[
              { step: '1', title: 'CR 이벤트 수신', desc: 'Kredis CR의 생성/수정/삭제 이벤트 감지', color: '#e3f2fd' },
              { step: '2', title: '리소스 동기화', desc: 'Pod, Service, PVC 등 하위 리소스 생성/업데이트', color: '#fff8e1' },
              { step: '3', title: '클러스터 상태 확인', desc: 'Redis CLUSTER INFO로 현재 상태 파악', color: '#e8f5e9' },
              { step: '4', title: '작업 결정', desc: 'Create/Scale/Heal/Rebalance 중 필요한 작업 판단', color: '#fce4ec' },
              { step: '5', title: '작업 실행', desc: 'Job을 통한 클러스터 명령 실행 (redis-cli)', color: '#f3e5f5' },
              { step: '6', title: '상태 업데이트', desc: 'CR Status 업데이트 및 다음 Reconcile 스케줄링', color: '#e8eaf6' },
            ].map((item) => (
              <Card
                key={item.step}
                elevation={1}
                sx={{
                  bgcolor: item.color,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: 'none',
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip label={item.step} size="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      {item.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5, pl: 1 }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

/* =======================
   Architecture Diagrams Section
   ======================= */
function ArchitectureDiagramsSection() {
  const [expandedOp, setExpandedOp] = useState(false);

  // 메인에 노출할 핵심 다이어그램 (3개)
  const mainDiagrams = [
    {
      id: 'main-reconcile',
      title: 'Main Reconcile Loop',
      subtitle: 'Operator의 핵심 제어 흐름 (클릭하면 확대됩니다)',
      image: '/images/diagrams/01_main_reconcile_loop.svg',
      description: 'Kredis CR 변경 감지부터 클러스터 상태 동기화까지의 전체 Reconcile 사이클',
      highlight: true,
      color: '#673ab7',
      bgColor: '#ede7f6',
    },
    {
      id: 'cluster-manager',
      title: 'Cluster Manager',
      subtitle: '클러스터 상태 관리',
      image: '/images/diagrams/02_cluster_manager.svg',
      description: 'Pod 상태 확인, 클러스터 노드 발견, 필요 작업 결정',
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      id: 'autoscaler',
      title: 'Autoscaler',
      subtitle: '자동 스케일링 로직',
      image: '/images/diagrams/08_autoscaler.svg',
      description: 'Memory/CPU 메트릭 수집 및 스케일링 결정 알고리즘',
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
  ];

  // Accordion에 숨길 상세 Operations (5개)
  const operationDiagrams = [
    {
      id: 'op-create',
      title: 'Create Operation',
      icon: <PlayArrowIcon sx={{ color: '#4caf50' }} />,
      image: '/images/diagrams/03_op_create.svg',
      description: '새 Redis 클러스터 초기화 - Pod/Service 생성, redis-cli --cluster create 실행',
      color: '#4caf50',
    },
    {
      id: 'op-scale-up',
      title: 'Scale Up Operation',
      icon: <AddCircleOutlineIcon sx={{ color: '#2196f3' }} />,
      image: '/images/diagrams/04_op_scale_up.svg',
      description: '노드 추가 - 마스터 조인, 슬롯 리밸런싱, 레플리카 연결',
      color: '#2196f3',
    },
    {
      id: 'op-scale-down',
      title: 'Scale Down Operation',
      icon: <RemoveCircleOutlineIcon sx={{ color: '#f44336' }} />,
      image: '/images/diagrams/05_op_scale_down.svg',
      description: '노드 제거 - 슬롯 마이그레이션, CLUSTER FORGET, Pod/PVC 정리',
      color: '#f44336',
    },
    {
      id: 'op-rebalance',
      title: 'Rebalance Operation',
      icon: <BalanceIcon sx={{ color: '#9c27b0' }} />,
      image: '/images/diagrams/06_op_rebalance.svg',
      description: '슬롯 균등 분배 - 빈 마스터에 슬롯 부여 후 전체 리밸런싱',
      color: '#9c27b0',
    },
    {
      id: 'op-heal',
      title: 'Heal Operation',
      icon: <HealingIcon sx={{ color: '#00897b' }} />,
      image: '/images/diagrams/07_op_heal.svg',
      description: '클러스터 복구 - redis-cli --cluster fix로 상태 정상화',
      color: '#00897b',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <AccountTreeIcon color="secondary" /> 아키텍처 & 처리 흐름도
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Kubernetes Operator의 핵심인 Reconcile Loop와 각 오퍼레이션의 상세 흐름을 다이어그램으로 정리했습니다.
        <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.9em', ml: 1 }}>
          (클릭하면 확대됩니다)
        </Typography>
      </Typography>

      {/* ===== 메인 다이어그램: Main Reconcile Loop (전체 너비) ===== */}
      <Box sx={{ mb: 2 }}>
        <Card 
          elevation={3} 
          sx={{ 
            borderLeft: `5px solid ${mainDiagrams[0].color}`,
            bgcolor: mainDiagrams[0].bgColor,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip 
                label="핵심" 
                size="small" 
                sx={{ bgcolor: mainDiagrams[0].color, color: 'white', fontWeight: 'bold' }} 
              />
              <Typography variant="h6" fontWeight="bold">
                {mainDiagrams[0].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - {mainDiagrams[0].subtitle}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {mainDiagrams[0].description}
            </Typography>
            <Box sx={{ height: 1, textAlign: 'center' }} >
              <ZoomableImageModal
                imageSrc={mainDiagrams[0].image}
                altText={mainDiagrams[0].title}
                caption={`${mainDiagrams[0].title} - ${mainDiagrams[0].subtitle}`}
                sx={{ 
                  border: '2px solid #ddd', 
                  borderRadius: 2,
                  bgcolor: 'white',
                  maxHeight: 450,
                  minWidth: 400,
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ===== 서브 다이어그램: Cluster Manager & Autoscaler (2열) ===== */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 3, 
          flexDirection: { xs: 'column', md: 'row' } 
        }}
      >
        {mainDiagrams.slice(1).map((diagram) => (
          <Card 
            key={diagram.id}
            elevation={2} 
            sx={{ 
              flex: 1,
              borderLeft: `4px solid ${diagram.color}`,
              bgcolor: diagram.bgColor,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {diagram.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', minHeight: 5 }}>
                  {diagram.description}
                </Typography>
              </Box>
              <ZoomableImageModal
                imageSrc={diagram.image}
                altText={diagram.title}
                caption={`${diagram.title} - ${diagram.subtitle}`}
                sx={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 1,
                  bgcolor: 'white',
                  maxHeight: 300,
                  objectFit: 'contain',
                  mt: 0
                }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* ===== 상세 Operations Accordion ===== */}
      <Accordion 
        expanded={expandedOp} 
        onChange={() => setExpandedOp(!expandedOp)}
        sx={{ 
          bgcolor: '#fafafa',
          '&:before': { display: 'none' },
          borderRadius: '8px !important',
          border: '1px solid #e0e0e0',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            bgcolor: '#f5f5f5',
            borderRadius: expandedOp ? '8px 8px 0 0' : '8px',
            '&:hover': { bgcolor: '#eeeeee' },
            flexDirection: 'row-reverse',
            '& .MuiAccordionSummary-expandIconWrapper': {
              marginRight: 1,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon color="action" />
            <Typography variant="subtitle1" fontWeight="bold">
              클러스터 작업 상세 흐름도
            </Typography>
            <Chip 
              label={`${operationDiagrams.length}개`} 
              size="small" 
              variant="outlined" 
              sx={{ ml: 1 }} 
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Create, Scale Up/Down, Rebalance, Heal 등 각 클러스터 작업의 상세 처리 흐름입니다.
          </Typography>
          
          <Grid container spacing={2}>
            {operationDiagrams.map((op) => (
              <Grid item xs={12} sm={6} lg={4} key={op.id}>
                <Card 
                  elevation={1}
                  sx={{ 
                    height: '100%',
                    borderTop: `3px solid ${op.color}`,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 3 },
                    bgcolor: op.color + '20',
                    
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {op.icon}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {op.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', minHeight: 36 }}>
                      {op.description}
                    </Typography>
                    <Box sx={{ height: 1, textAlign: 'center', }} >
                      <ZoomableImageModal
                        imageSrc={op.image}
                        altText={op.title}
                        caption={op.title}
                        sx={{ 
                          border: '1px solid #eee', 
                          borderRadius: 1,
                          bgcolor: 'white',
                          maxHeight: 200,
                          minWidth: 300,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

/* =======================
   Autoscaling Demo Section
   ======================= */
function AutoscalingDemoSection() {
  const [scaleType, setScaleType] = useState('memory');

  const handleScaleTypeChange = (event, newType) => {
    if (newType !== null) {
      setScaleType(newType);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <SpeedIcon color="warning" /> 오토스케일링 데모
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Metrics API를 통해 실시간으로 리소스 사용률을 모니터링하고, 임계값을 초과하면 자동으로 스케일링합니다.
      </Typography>

      {/* 토글 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={scaleType}
          exclusive
          onChange={handleScaleTypeChange}
          size="medium"
        >
          <ToggleButton 
            value="memory" 
            sx={{ 
              px: 3, 
              py: 1,
              '&.Mui-selected': { bgcolor: '#fff3e0', color: '#ff9800' }
            }}
          >
            <MemoryIcon sx={{ mr: 1 }} /> Memory → Master 스케일링
          </ToggleButton>
          <ToggleButton 
            value="cpu" 
            sx={{ 
              px: 3, 
              py: 1,
              '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#2196f3' }
            }}
          >
            <SpeedIcon sx={{ mr: 1 }} /> CPU → Replica 스케일링
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 비디오 영역 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Box
          component="video"
          controls
          sx={{
            width: '100%',
            maxWidth: 800,
            borderRadius: 2,
            border: '2px solid #ddd',
          }}
          key={scaleType}
        >
          <source 
            src={scaleType === 'memory' 
              ? "/videos/memory_scale.mp4" 
              : "/videos/cpu_scale.mp4"
            } 
            type="video/mp4" 
          />
          브라우저가 비디오를 지원하지 않습니다.
        </Box>
      </Box>

      {/* 스케일링 흐름 + 핵심 용어 카드 */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* 스케일링 흐름 카드 */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Card elevation={2} sx={{ width: '100%', borderLeft: `4px solid ${scaleType === 'memory' ? '#ff9800' : '#2196f3'}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: scaleType === 'memory' ? '#ff9800' : '#2196f3', mb: 1.5 }}>
                <strong>{scaleType === 'memory' ? 'Memory 기반 Master 스케일링' : 'CPU 기반 Replica 스케일링'}</strong>
              </Typography>
              
              {scaleType === 'memory' ? (
                <Stack spacing={0.5} sx={{ fontSize: '13px' }}>
                  <Typography variant="body2"><strong>Scale Up 조건:</strong> Memory 사용률 &gt; 70%</Typography>
                  <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>→ Master 노드 추가 (슬롯 자동 리밸런싱)</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Scale Down 조건:</strong> Memory 사용률 &lt; 10%</Typography>
                  <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>→ Master 노드 감소 (슬롯 마이그레이션 후 제거)</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    * Redis의 maxmemory 설정 기준으로 사용률 계산
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={0.5} sx={{ fontSize: '13px' }}>
                  <Typography variant="body2"><strong>Scale Up 조건:</strong> CPU 사용률 &gt; 70%</Typography>
                  <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>→ 각 Master에 Replica 노드 추가</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Scale Down 조건:</strong> CPU 사용률 &lt; 20%</Typography>
                  <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>→ Replica 노드 감소 (CLUSTER FORGET 후 제거)</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    * Kubernetes Metrics API (metrics-server) 사용
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
        
        {/* 스케일 아웃 도식 */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Card elevation={2} sx={{ width: '100%', borderLeft: `4px solid ${scaleType === 'memory' ? '#ff9800' : '#2196f3'}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: scaleType === 'memory' ? '#ff9800' : '#2196f3', mb: 1 }}>
                <strong>{scaleType === 'memory' ? 'Master 스케일 아웃 구조' : 'Replica 스케일 아웃 구조'}</strong>
              </Typography>
              <ZoomableImageModal
                imageSrc={scaleType === 'memory' 
                  ? "/images/master-scale.svg" 
                  : "/images/replica-scale.svg"
                }
                altText={scaleType === 'memory' ? 'Master 스케일 아웃' : 'Replica 스케일 아웃'}
                caption={scaleType === 'memory' 
                  ? 'Memory 사용률 증가 시 Master 노드 추가' 
                  : 'CPU 사용률 증가 시 Replica 노드 추가'
                }
                sx={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 1,
                  bgcolor: 'white',
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

/* =======================
   Features Section
   ======================= */
function FeaturesSection() {
  const features = [
    {
      icon: <AutoFixHighIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      title: '자동 스케일링',
      description: 'Kubernetes Metrics API 연동으로 CPU/Memory 사용률 기반 자동 스케일링. Stabilization Window로 안정적인 스케일링 보장.',
      color: '#fff3e0',
      borderColor: '#ffcc80',
    },
    {
      icon: <HealingIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: 'Self-Healing & HA',
      description: '노드 장애 자동 감지 및 복구. Pod Anti-Affinity를 적용하여 같은 Shard의 Master/Replica가 서로 다른 워커 노드에 배포되도록 설계, 워커 노드 장애 시에도 Failover 가능. 실패한 Pod 재생성 및 클러스터 상태 자동 복원.',
      color: '#e8f5e9',
      borderColor: '#a5d6a7',
      code: `
podAntiAffinity := &corev1.PodAntiAffinity{
  PreferredDuringSchedulingIgnoredDuringExecution: []corev1.WeightedPodAffinityTerm{
    {
      Weight: 100,
      PodAffinityTerm: corev1.PodAffinityTerm{
        LabelSelector: &metav1.LabelSelector{
          MatchLabels: map[string]string{
            "app":                        "kredis",
            "app.kubernetes.io/instance": k.Name,
            "shard-index":              shardIndexLabel,  // 예: "0"
          },
        },
        TopologyKey: "kubernetes.io/hostname",
      },
    },
  },
}

# 예시: 각 Pod의 Labels: shard-index 라벨을 기준으로 Anti-Affinity 설정
# 
# kredis-sample-0-0:
#   app: kredis
#   app.kubernetes.io/instance: kredis-sample
#   shard-index: "0"  ←--------
#   instance-index: "0"
#   role: master
# 
# kredis-sample-0-1:
#   app: kredis
#   app.kubernetes.io/instance: kredis-sample
#   shard-index: "0"  ← 같은 shard! (다른 worker-node 에 배포될 예정)
#   instance-index: "1"
#   role: slave
`,
    },
    {
      icon: <BalanceIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: '슬롯 리밸런싱',
      description: '스케일 업/다운 시 자동 슬롯 마이그레이션. 16384개 슬롯을 Master 노드에 균등 분배하여 데이터 무손실 보장.',
      color: '#f3e5f5',
      borderColor: '#ce93d8',
    },
    {
      icon: <MonitorHeartIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'Prometheus 통합',
      description: 'redis-exporter 사이드카 자동 배포. Pod별 메트릭 수집 및 Grafana 대시보드 연동 가능.',
      color: '#e3f2fd',
      borderColor: '#90caf9',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <SettingsIcon color="info" /> 주요 기능
      </Typography>

        {features.map((feature, index) => (
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                bgcolor: feature.color,
                border: `1px solid ${feature.borderColor}`,
                borderRadius: 2,
                mb: 1,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  {feature.icon}
                  <Typography variant="h6" fontWeight="bold">
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {feature.description}
                </Typography>
                {feature.code && (
                  <Box sx={{ mt: 2 }}>
                    <CodeAccordion
                      title={`Pod Anti-Affinity - 코드 예시`}
                      codeString={feature.code.trim()}
                      language="go"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
        ))}
    </Box>
  );
}

/* =======================
   CRD Example Section
   ======================= */
function CRDExampleSection() {
  const crdYaml = `apiVersion: cache.docker.direa.synology.me/v1alpha1
kind: Kredis
metadata:
  labels:
    app.kubernetes.io/name: kredis
    app.kubernetes.io/instance: kredis-sample
    app.kubernetes.io/part-of: kredis-operator
    app.kubernetes.io/managed-by: kustomize
    app.kubernetes.io/created-by: kredis-operator
    app.kubernetes.io/name-prefix: kredis-operator
  name: kredis-sample
  namespace: kredis-operator-system
spec:
  masters: 3 # Redis 마스터 노드 수
  replicas: 1 # 각 마스터당 슬레이브(복제본) 노드 수
  maxMemory: "700Mi" # redis.conf maxmemory
  basePort: 6379
  image: "docker.direa.synology.me/redis-cluster:8.2-rc1"
  resources:
    limits:
      cpu: "1"
      memory: "1Gi"
    requests:
      cpu: 500m
      memory: "512Mi"
  # Autoscaling 설정
  autoscaling:
    enabled: true
    minMasters: 3             # 최소 마스터 수
    maxMasters: 10            # 최대 마스터 수
    minReplicasPerMaster: 1   # 최소 레플리카 수
    maxReplicasPerMaster: 5   # 최대 레플리카 수
    memoryScaleUpThreshold: 70   # Memory 70% 이상 → Master 추가
    memoryScaleDownThreshold: 10 # Memory 10% 이하 → Master 감소
    cpuScaleUpThreshold: 70      # CPU 70% 이상 → Replica 추가
    cpuScaleDownThreshold: 20    # CPU 20% 이하 → Replica 감소
    scaleUpStabilizationWindowSeconds: 60     # 스케일업 대기 시간 60초
    scaleDownStabilizationWindowSeconds: 600  # 스케일다운 대기 시간 10분 (600)초
  exporter:
    enabled: true
    image: "bitnami/redis-exporter:latest"
    port: 9121`;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <DataObjectIcon color="success" /> CRD (Custom Resource Definition) 예시
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Kredis CR을 정의하면 Operator가 자동으로 Redis 클러스터를 생성하고 관리합니다.
        단순히 <code>masters</code>와 <code>replicas</code> 값만 변경해도 클러스터가 자동으로 스케일링됩니다.
      </Typography>

      <CodeAccordion 
        title="cache_v1alpha1_kredis.yaml - “Kredis Custom Resource” yaml 예시"
        codeString={crdYaml}
        language="yaml"
      />

      <Card elevation={1} sx={{ mt: 3, bgcolor: '#fafafa', p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          주요 필드 설명
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2"><strong>spec.masters:</strong> Master 노드 수 (최소 minMasters)</Typography>
            <Typography variant="body2"><strong>spec.replicas:</strong> Master당 Replica 수</Typography>
            <Typography variant="body2"><strong>spec.maxMemory:</strong> Redis maxmemory 설정</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2"><strong>autoscaling.enabled:</strong> 오토스케일링 활성화</Typography>
            <Typography variant="body2"><strong>exporter.enabled:</strong> Prometheus 메트릭 수집</Typography>
            <Typography variant="body2"><strong>stabilizationWindow:</strong> 스케일링 안정화 대기 시간</Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

function ClusterStatesSection() {
  const states = [
    { state: 'Creating', description: '클러스터 생성 중 (Pod, Service, PVC 생성)', color: '#fff3e0' },
    { state: 'Initialized', description: '초기 생성 완료 (redis-cli --cluster create 실행됨)', color: '#e3f2fd' },
    { state: 'Running', description: '정상 동작 중 (모든 노드 정상)', color: '#e8f5e9' },
    { state: 'Scaling', description: '스케일업 진행 중 (노드 추가 및 리밸런싱)', color: '#f3e5f5' },
    { state: 'ScalingDown', description: '스케일다운 진행 중 (슬롯 마이그레이션 후 노드 제거)', color: '#fce4ec' },
    { state: 'Rebalancing', description: '슬롯 리밸런싱 중', color: '#fff8e1' },
    { state: 'Healing', description: '장애 복구 중 (노드 재생성, Failover)', color: '#e0f7fa' },
    { state: 'Failed', description: '심각한 장애 (수동 개입 필요)', color: '#ffcdd2' },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <ArchitectureIcon color="error" /> 클러스터 상태 (ClusterState)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Kredis Operator는 클러스터의 현재 상태를 <code>status.clusterState</code> 필드에 기록합니다.
        각 상태에 따라 적절한 Reconcile 동작이 수행됩니다.
      </Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>상태</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>설명</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {states.map((item) => (
              <TableRow key={item.state}>
                <TableCell sx={{ bgcolor: item.color }}>
                  <Chip label={item.state} size="small" sx={{ fontWeight: 'bold' }} />
                </TableCell>
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body2" color="textSecondary">
          <strong>상태 전이 흐름:</strong> Creating → Initialized → Running ↔ (Scaling / ScalingDown / Healing / Rebalancing) → Running
        </Typography>
      </Box>
    </Box>
  );
}

/* =======================
   Grafana Section
   ======================= */
function GrafanaSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        📊 Grafana 모니터링 대시보드
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Prometheus + Redis Exporter를 통해 수집한 메트릭을 Grafana 대시보드로 시각화합니다.
        클러스터 상태, Memory/CPU 사용률, 슬롯 분포 등을 실시간으로 모니터링할 수 있습니다.
      </Typography>

      <Card elevation={2}>
        <CardContent>
          <ZoomableImageModal
            imageSrc="/images/kredis-grafana.png"
            altText="Grafana Dashboard"
            caption="Grafana Dashboard - Prometheus + Redis Exporter를 통해 수집한 메트릭 시각화"
            sx={{ 
              border: '2px solid #ddd', 
              borderRadius: 2,
              bgcolor: 'white',
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

/* =======================
   Troubleshooting Section
   ======================= */
const troubleshootingItems = [
  {
    title: '문제 1: 클러스터 생성 시 노드 리셋 이슈',
    description: '재시작된 Pod가 이전 클러스터 정보를 가지고 있어 CLUSTER CREATE 실패',
    solution: 'isNodeResetNeeded() 함수로 리셋 필요 여부를 사전 체크하고, 필요한 노드만 FLUSHALL + CLUSTER RESET 실행. 비동기로 리셋 완료 여부를 확인 후 다음 단계 진행.'
  },
  {
    title: '문제 2: 스케일업 시 노드 중복 추가 시도',
    description: '스케일업 과정에서 노드를 클러스터에 추가하려 할 때, 해당 노드가 이미 클러스터에 존재하는 경우가 발생. 여러 Reconcile이 동시에 실행되면서 상태 동기화 문제가 발생한 것으로 추정되나, 정확한 근본 원인은 파악하지 못함.',
    solution: '노드가 클러스터에 이미 존재하는 경우, 노드의 현재 역할(master/slave)과 기대 역할을 비교하여 필요시 역할 변환 수행. 다만 이는 임시방편이며, Reconcile 동시성 제어나 상태 업데이트 타이밍 이슈 등 근본 원인 해결은 추후 과제로 남김.'
  },
  {
    title: '문제 3: Reconcile Loop 무한 재시도',
    description: '특정 오류 상황에서 Reconcile이 무한 반복되며 API Server에 부하 발생',
    solution: 'LastClusterOperation에 작업 상태와 타임스탬프를 기록하여 상태 기반 처리. RequeueAfter를 적절히 설정하여 exponential backoff 효과 구현.'
  },
  {
    title: '문제 4: Autoscaling 플래핑',
    description: '메트릭이 임계값 근처에서 변동할 때 Scale Up/Down이 반복됨',
    solution: 'Stabilization Window 도입: Scale Up: 60초 대기 (빠른 대응), Scale Down: 600초 대기 (보수적 접근). LastScaleTime을 기록하여 Window 내 중복 스케일링 방지'
  },
  {
    title: '문제 5: Job 기반 비동기 처리 (PodExecutor -> JobManager)',
    description: 'redis-cli --cluster rebalance 나 reshard 명령어는 수 분이 걸릴 수 있습니다. Reconcile 함수 내에서 직접 실행하면 타임아웃이 발생합니다.',
    solution: 'Kubernetes Job으로 클러스터 명령어를 실행하고, 다음 Reconcile에서 Job 상태를 확인합니다. Job 완료 시 후속 작업을 진행합니다.',
    code: `// Job 생성 후 즉시 리턴
if err := cm.JobManager.CreateClusterJob(ctx, kredis, nodeAddrs, replicas); err != nil {
    return err
}
delta.LastClusterOperation = "create-in-progress"
return nil  // 다음 Reconcile에서 Job 상태 확인

// 다음 Reconcile에서 Job 상태 확인
jobResult, _ := cm.JobManager.GetJobStatus(ctx, kredis, JobTypeCreate)
switch jobResult.Status {
case JobStatusSucceeded:
    return cm.verifyClusterCreation(ctx, kredis, pods, delta)
case JobStatusFailed:
    delta.LastClusterOperation = "create-failed"
    return fmt.Errorf("create cluster Job failed")
case JobStatusRunning:
    return nil  // 계속 대기
}`
  },
  {
    title: '문제 6: StatefulSet에서 원하는 Pod 삭제 불가 (스케일 다운)',
    description: 'StatefulSet은 항상 가장 높은 인덱스부터 Pod를 삭제합니다. 하지만 Redis Cluster Scale-Down 시에는 특정 노드(슬롯이 없는 마스터 노드와 그에 연결된 슬레이브 노드)만 삭제해야 합니다.',
    solution: 'StatefulSet 대신 오퍼레이터가 Pod를 직접 생성/삭제합니다. PendingScaleDown 상태로 삭제 대상 노드를 추적하고, 슬롯 마이그레이션 완료 후 해당 Pod만 삭제합니다.',
    code: `// reconcilePods - StatefulSet 대신 직접 Pod 관리
func (r *KredisReconciler) reconcilePods(ctx context.Context, kredis *cachev1alpha1.Kredis) error {
    expectedPodNames := resource.GetExpectedPodNames(kredis.Name, kredis.Spec.Masters, kredis.Spec.Replicas)
    
    // 존재하지 않는 Pod만 생성 (Scale-Up)
    for _, expectedName := range expectedPodNames {
        if _, exists := currentPodMap[expectedName]; !exists {
            r.createPodWithPVCs(ctx, kredis, expectedName)
        }
    }
    // Pod 삭제는 ClusterManager가 Scale-Down 완료 후 처리
    return nil
}`
  },
  {
    title: '문제 7: 리밸런싱 시 슬롯이 없는 마스터 노드에서 발생하는 에러',
    description: '리밸런싱 작업을 할 때 슬롯이 없는 마스터가 있으면 "ERR Please use SETSLOT only with masters. error" 에러가 발생합니다. 이는 노드가 마스터에서 레플리카로 전환되는 과정에서 발생하는 문제입니다. 관련 이슈: https://github.com/redis/redis/issues/11104',
    solution: '바로 rebalance를 실행하지 말고, reshard로 먼저 슬롯을 분배한 후 rebalance로 균등 분배하는 방식으로 진행하면 위 에러가 발생하지 않습니다.'
  }
];

// URL을 링크로 변환하는 헬퍼 함수
function renderTextWithLinks(text) {
  if (!text) return text;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <Link 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ wordBreak: 'break-all' }}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

function TroubleshootingSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2
        }}
      >
        <BugReportIcon color="error" /> 삽질기 & 트러블슈팅
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        개발 과정에서 만난 주요 문제들과 해결 방법을 공유합니다.
      </Typography>

      <Stack spacing={1}>
        {troubleshootingItems.map((trouble, idx) => (
          <Card elevation={2} sx={{ borderLeft: '4px solid #f44336', }} key={idx}>
            <CardContent
              sx={{
                paddingTop: 0.7,
                paddingBottom: "0.3rem !important",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.3 }}>
                <WarningIcon color="error" />
                <Typography variant="h6">{trouble.title}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>증상:</strong> {renderTextWithLinks(trouble.description)}
              </Typography>
              <Alert severity="success" sx={{ paddingTop: 0, paddingBottom: 0 }}>
                <AlertTitle>해결</AlertTitle>
                {trouble.solution}
              </Alert>
              {trouble.code && (
                <Box sx={{ mt: 0.5 }}>
                  <CodeAccordion 
                    title="관련 코드"
                    codeString={trouble.code}
                    language="go"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

/* =======================
   Reference Section
   ======================= */
function ReferenceSection() {
  return (
    <Box>
      <Reference
        spaLinks={[]}
        externalLinks={[
          {
            prefix: 'GitHub 소스코드:',
            href: 'https://github.com/hkpark130/kredis-operator',
            label: 'https://github.com/hkpark130/kredis-operator'
          },
          {
            prefix: 'Kubebuilder 공식 문서:',
            href: 'https://book.kubebuilder.io/reference/markers/rbac.html',
            label: 'https://book.kubebuilder.io/'
          },
        ]}
      />
    </Box>
  );
}

function LessonsLearnedSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Alert severity="info" sx={{ mt: 3 }}>
        <AlertTitle>마치며</AlertTitle>
        Kubernetes Operator를 직접 구현해보면서 Kubernetes의 환경에 더 익숙해질 수 있었고 redis 클러스터 운영의 복잡성을 체감했습니다. <br/>
        특히 Reconciliation Loop 패턴으로 CR이 지정한 원하는 상태와 클러스터의 실제 상태를 지속적으로 비교하고, 동기화를 유지하는 상태 관리가 정말 쉽지 않다는 것을 체감하였습니다. <br/>
        마지막으로 자동으로 스케일 인/아웃 및 장애 복구를 수행하는 오퍼레이터의 강력함을 경험할 수 있었고 <br/>
        실무에서 운영 자동화 도구로 활용할 수 있는 기회가 있기를 기대합니다.
      </Alert>
    </Box>
  );
}
