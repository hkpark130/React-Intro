// Kredis Operator - 개별 섹션 컴포넌트들
import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TipsAndUpdates as TipsAndUpdatesIcon,
  Architecture as ArchitectureIcon,
  ExpandMore as ExpandMoreIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  AutoFixHigh as AutoFixHighIcon,
  Build as BuildIcon,
  BugReport as BugReportIcon,
  Warning as WarningIconMui,
  Settings as SettingsIcon,
  DataObject as DataObjectIcon,
  CloudSync as CloudSyncIcon,
  AccountTree as AccountTreeIcon,
  Healing as HealingIcon,
  Balance as BalanceIcon,
  MonitorHeart as MonitorHeartIcon,
} from '@mui/icons-material';
import TitleSection from '@/components/section/TitleSection';
import TechStack from '@/components/section/TechStack';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import CodeAccordion from '@/components/section/CodeAccordion';
import Reference from '@/components/section/Reference';

import {
  techStacks,
  architectureComponents,
  reconcileSteps,
  mainDiagrams,
  operationDiagramsData,
  getOperationIcon,
  features,
  crdYaml,
  clusterStates,
  troubleshootingItems,
} from './kredisData';

/* =======================
   Hero Section
   ======================= */
export function HeroSection() {
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
export function TechStackSection() {
  return <TechStack techStacks={techStacks} />;
}

/* =======================
   Background Section
   ======================= */
export function BackgroundSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
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
export function ArchitectureSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ArchitectureIcon color="primary" /> 시스템 아키텍처
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Kredis<strong>(CRD)</strong> Operator는 Kubebuilder 프레임워크를 기반으로 개발되었으며,
        Kubernetes의 <strong>Reconcile Loop 패턴</strong>을 따릅니다.
      </Typography>
      <Card elevation={2} sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>🏗️ 주요 컴포넌트</Typography>
          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' } }}>
            {architectureComponents.map((comp) => (
              <Card key={comp.title} elevation={1} sx={{ bgcolor: comp.color, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color={comp.textColor} gutterBottom>{comp.title}</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{comp.desc}</Typography>
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
   Reconcile Flow Section
   ======================= */
export function ReconcileFlowSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CloudSyncIcon color="info" /> Reconcile Loop 동작 방식
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Operator의 핵심은 <strong>Reconcile Loop</strong>입니다.
        사용자가 정의한 Desired State(CR)와 현재 Actual State를 지속적으로 비교하여 일치시키는 작업을 수행합니다.
      </Typography>
      <Card elevation={2} sx={{ mb: 3, background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' } }}>
            {reconcileSteps.map((item) => (
              <Card key={item.step} elevation={1} sx={{ bgcolor: item.color, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip label={item.step} size="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">{item.title}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5, pl: 1 }}>{item.desc}</Typography>
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
export function ArchitectureDiagramsSection() {
  const [expandedOp, setExpandedOp] = useState(false);

  const operationDiagrams = operationDiagramsData.map((op) => ({
    ...op,
    icon: getOperationIcon(op.iconType, op.color),
  }));

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccountTreeIcon color="secondary" /> 아키텍처 & 처리 흐름도
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Kubernetes Operator의 핵심인 Reconcile Loop와 각 오퍼레이션의 상세 흐름을 다이어그램으로 정리했습니다.
        <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.9em', ml: 1 }}>(클릭하면 확대됩니다)</Typography>
      </Typography>

      {/* 메인 다이어그램 */}
      <Box sx={{ mb: 2 }}>
        <Card elevation={3} sx={{ borderLeft: `5px solid ${mainDiagrams[0].color}`, bgcolor: mainDiagrams[0].bgColor, overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label="핵심" size="small" sx={{ bgcolor: mainDiagrams[0].color, color: 'white', fontWeight: 'bold' }} />
              <Typography variant="h6" fontWeight="bold">{mainDiagrams[0].title}</Typography>
              <Typography variant="body2" color="text.secondary">- {mainDiagrams[0].subtitle}</Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>{mainDiagrams[0].description}</Typography>
            <Box sx={{ height: 1, textAlign: 'center' }}>
              <ZoomableImageModal imageSrc={mainDiagrams[0].image} altText={mainDiagrams[0].title} caption={`${mainDiagrams[0].title} - ${mainDiagrams[0].subtitle}`} sx={{ border: '2px solid #ddd', borderRadius: 2, bgcolor: 'white', maxHeight: 450, minWidth: 400 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 서브 다이어그램 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {mainDiagrams.slice(1).map((diagram) => (
          <Card key={diagram.id} elevation={2} sx={{ flex: 1, borderLeft: `4px solid ${diagram.color}`, bgcolor: diagram.bgColor, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{diagram.title}</Typography>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', minHeight: 5 }}>{diagram.description}</Typography>
              </Box>
              <ZoomableImageModal imageSrc={diagram.image} altText={diagram.title} caption={`${diagram.title} - ${diagram.subtitle}`} sx={{ border: '1px solid #ddd', borderRadius: 1, bgcolor: 'white', maxHeight: 300, objectFit: 'contain', mt: 0 }} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Operations Accordion */}
      <Accordion expanded={expandedOp} onChange={() => setExpandedOp(!expandedOp)} sx={{ bgcolor: '#fafafa', '&:before': { display: 'none' }, borderRadius: '8px !important', border: '1px solid #e0e0e0' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f5f5f5', borderRadius: expandedOp ? '8px 8px 0 0' : '8px', '&:hover': { bgcolor: '#eeeeee' }, flexDirection: 'row-reverse', '& .MuiAccordionSummary-expandIconWrapper': { marginRight: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon color="action" />
            <Typography variant="subtitle1" fontWeight="bold">클러스터 작업 상세 흐름도</Typography>
            <Chip label={`${operationDiagrams.length}개`} size="small" variant="outlined" sx={{ ml: 1 }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Create, Scale Up/Down, Rebalance, Heal 등 각 클러스터 작업의 상세 처리 흐름입니다.</Typography>
          <Grid container spacing={2}>
            {operationDiagrams.map((op) => (
              <Grid item xs={12} sm={6} lg={4} key={op.id}>
                <Card elevation={1} sx={{ height: '100%', borderTop: `3px solid ${op.color}`, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3 }, bgcolor: op.color + '20' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {op.icon}
                      <Typography variant="subtitle2" fontWeight="bold">{op.title}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', minHeight: 36 }}>{op.description}</Typography>
                    <Box sx={{ height: 1, textAlign: 'center' }}>
                      <ZoomableImageModal imageSrc={op.image} altText={op.title} caption={op.title} sx={{ border: '1px solid #eee', borderRadius: 1, bgcolor: 'white', maxHeight: 200, minWidth: 300 }} />
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
export function AutoscalingDemoSection() {
  const [scaleType, setScaleType] = useState('memory');

  const handleScaleTypeChange = (event, newType) => {
    if (newType !== null) setScaleType(newType);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SpeedIcon color="warning" /> 오토스케일링 데모
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Metrics API를 통해 실시간으로 리소스 사용률을 모니터링하고, 임계값을 초과하면 자동으로 스케일링합니다.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup value={scaleType} exclusive onChange={handleScaleTypeChange} size="medium">
          <ToggleButton value="memory" sx={{ px: 3, py: 1, '&.Mui-selected': { bgcolor: '#fff3e0', color: '#ff9800' } }}>
            <MemoryIcon sx={{ mr: 1 }} /> Memory → Master 스케일링
          </ToggleButton>
          <ToggleButton value="cpu" sx={{ px: 3, py: 1, '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#2196f3' } }}>
            <SpeedIcon sx={{ mr: 1 }} /> CPU → Replica 스케일링
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Box component="video" controls sx={{ width: '100%', maxWidth: 800, borderRadius: 2, border: '2px solid #ddd' }} key={scaleType}>
          <source src={scaleType === 'memory' ? '/videos/memory_scale.mp4' : '/videos/cpu_scale.mp4'} type="video/mp4" />
          브라우저가 비디오를 지원하지 않습니다.
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
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
                  <Typography variant="body2" color="textSecondary">* Redis의 maxmemory 설정 기준으로 사용률 계산</Typography>
                </Stack>
              ) : (
                <Stack spacing={0.5} sx={{ fontSize: '13px' }}>
                  <Typography variant="body2"><strong>Scale Up 조건:</strong> CPU 사용률 &gt; 70%</Typography>
                  <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>→ 각 Master에 Replica 노드 추가</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Scale Down 조건:</strong> CPU 사용률 &lt; 20%</Typography>
                  <Typography variant="body2" sx={{ pl: 1.5, color: '#888' }}>→ Replica 노드 감소 (CLUSTER FORGET 후 제거)</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="textSecondary">* Kubernetes Metrics API (metrics-server) 사용</Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Card elevation={2} sx={{ width: '100%', borderLeft: `4px solid ${scaleType === 'memory' ? '#ff9800' : '#2196f3'}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: scaleType === 'memory' ? '#ff9800' : '#2196f3', mb: 1 }}>
                <strong>{scaleType === 'memory' ? 'Master 스케일 아웃 구조' : 'Replica 스케일 아웃 구조'}</strong>
              </Typography>
              <ZoomableImageModal imageSrc={scaleType === 'memory' ? '/images/master-scale.svg' : '/images/replica-scale.svg'} altText={scaleType === 'memory' ? 'Master 스케일 아웃' : 'Replica 스케일 아웃'} caption={scaleType === 'memory' ? 'Memory 사용률 증가 시 Master 노드 추가' : 'CPU 사용률 증가 시 Replica 노드 추가'} sx={{ border: '1px solid #ddd', borderRadius: 1, bgcolor: 'white' }} />
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
export function FeaturesSection() {
  const getFeatureIcon = (iconType, color) => {
    const iconStyle = { fontSize: 40, color };
    switch (iconType) {
      case 'autofix': return <AutoFixHighIcon sx={iconStyle} />;
      case 'healing': return <HealingIcon sx={iconStyle} />;
      case 'balance': return <BalanceIcon sx={iconStyle} />;
      case 'monitor': return <MonitorHeartIcon sx={iconStyle} />;
      default: return null;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SettingsIcon color="info" /> 주요 기능
      </Typography>
      {features.map((feature, index) => (
        <Card key={index} elevation={2} sx={{ height: '100%', bgcolor: feature.color, border: `1px solid ${feature.borderColor}`, borderRadius: 2, mb: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              {getFeatureIcon(feature.icon, feature.iconColor)}
              <Typography variant="h6" fontWeight="bold">{feature.title}</Typography>
            </Box>
            <Typography variant="body2">{feature.description}</Typography>
            {feature.code && (
              <Box sx={{ mt: 2 }}>
                <CodeAccordion title="Pod Anti-Affinity - 코드 예시" codeString={feature.code.trim()} language="go" />
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
export function CRDExampleSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DataObjectIcon color="success" /> CRD (Custom Resource Definition) 예시
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Kredis CR을 정의하면 Operator가 자동으로 Redis 클러스터를 생성하고 관리합니다.
        단순히 <code>masters</code>와 <code>replicas</code> 값만 변경해도 클러스터가 자동으로 스케일링됩니다.
      </Typography>
      <CodeAccordion title='cache_v1alpha1_kredis.yaml - "Kredis Custom Resource" yaml 예시' codeString={crdYaml} language="yaml" />
      <Card elevation={1} sx={{ mt: 3, bgcolor: '#fafafa', p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>주요 필드 설명</Typography>
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

/* =======================
   Cluster States Section
   ======================= */
export function ClusterStatesSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
            {clusterStates.map((item) => (
              <TableRow key={item.state}>
                <TableCell sx={{ bgcolor: item.color }}><Chip label={item.state} size="small" sx={{ fontWeight: 'bold' }} /></TableCell>
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
export function GrafanaSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        📊 Grafana 모니터링 대시보드
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Prometheus + Redis Exporter를 통해 수집한 메트릭을 Grafana 대시보드로 시각화합니다.
        클러스터 상태, Memory/CPU 사용률, 슬롯 분포 등을 실시간으로 모니터링할 수 있습니다.
      </Typography>
      <Card elevation={2}>
        <CardContent>
          <ZoomableImageModal imageSrc="/images/kredis-grafana.png" altText="Grafana Dashboard" caption="Grafana Dashboard - Prometheus + Redis Exporter를 통해 수집한 메트릭 시각화" sx={{ border: '2px solid #ddd', borderRadius: 2, bgcolor: 'white' }} />
        </CardContent>
      </Card>
    </Box>
  );
}

/* =======================
   Troubleshooting Section
   ======================= */
function renderTextWithLinks(text) {
  if (!text) return text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return <Link key={index} href={part} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>{part}</Link>;
    }
    return part;
  });
}

export function TroubleshootingSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <BugReportIcon color="error" /> 삽질기 & 트러블슈팅
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>개발 과정에서 만난 주요 문제들과 해결 방법을 공유합니다.</Typography>
      <Stack spacing={1}>
        {troubleshootingItems.map((trouble, idx) => (
          <Card elevation={2} sx={{ borderLeft: '4px solid #f44336' }} key={idx}>
            <CardContent sx={{ paddingTop: 0.7, paddingBottom: '0.3rem !important' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.3 }}>
                <WarningIconMui color="error" />
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
                  <CodeAccordion title="관련 코드" codeString={trouble.code} language="go" />
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
   Lessons Learned Section
   ======================= */
export function LessonsLearnedSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Alert severity="info" sx={{ mt: 3 }}>
        <AlertTitle>마치며</AlertTitle>
        Kubernetes Operator를 직접 구현해보면서 Kubernetes의 환경에 더 익숙해질 수 있었고 redis 클러스터 운영의 복잡성을 체감했습니다. <br />
        특히 Reconciliation Loop 패턴으로 CR이 지정한 원하는 상태와 클러스터의 실제 상태를 지속적으로 비교하고, 동기화를 유지하는 상태 관리가 정말 쉽지 않다는 것을 체감하였습니다. <br />
        마지막으로 자동으로 스케일 인/아웃 및 장애 복구를 수행하는 오퍼레이터의 강력함을 경험할 수 있었고 <br />
        실무에서 운영 자동화 도구로 활용할 수 있는 기회가 있기를 기대합니다.
      </Alert>
    </Box>
  );
}

/* =======================
   Reference Section
   ======================= */
export function ReferenceSection() {
  return (
    <Box>
      <Reference
        spaLinks={[]}
        externalLinks={[
          { prefix: 'GitHub 소스코드:', href: 'https://github.com/hkpark130/kredis-operator', label: 'https://github.com/hkpark130/kredis-operator' },
          { prefix: 'Kubebuilder 공식 문서:', href: 'https://book.kubebuilder.io/reference/markers/rbac.html', label: 'https://book.kubebuilder.io/' },
        ]}
      />
    </Box>
  );
}
