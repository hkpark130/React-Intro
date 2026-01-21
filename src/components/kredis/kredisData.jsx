// Kredis Operator 페이지에서 사용하는 데이터 상수들

import {
  PlayArrow as PlayArrowIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Balance as BalanceIcon,
  Healing as HealingIcon,
} from '@mui/icons-material';

// Tech Stack 데이터
export const techStacks = [
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

// 아키텍처 컴포넌트 데이터
export const architectureComponents = [
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
];

// Reconcile Flow 단계 데이터
export const reconcileSteps = [
  { step: '1', title: 'CR 이벤트 수신', desc: 'Kredis CR의 생성/수정/삭제 이벤트 감지', color: '#e3f2fd' },
  { step: '2', title: '리소스 동기화', desc: 'Pod, Service, PVC 등 하위 리소스 생성/업데이트', color: '#fff8e1' },
  { step: '3', title: '클러스터 상태 확인', desc: 'Redis CLUSTER INFO로 현재 상태 파악', color: '#e8f5e9' },
  { step: '4', title: '작업 결정', desc: 'Create/Scale/Heal/Rebalance 중 필요한 작업 판단', color: '#fce4ec' },
  { step: '5', title: '작업 실행', desc: 'Job을 통한 클러스터 명령 실행 (redis-cli)', color: '#f3e5f5' },
  { step: '6', title: '상태 업데이트', desc: 'CR Status 업데이트 및 다음 Reconcile 스케줄링', color: '#e8eaf6' },
];

// 메인 다이어그램 데이터
export const mainDiagrams = [
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

// Operation 다이어그램 데이터 (아이콘은 컴포넌트에서 추가)
export const operationDiagramsData = [
  {
    id: 'op-create',
    title: 'Create Operation',
    iconType: 'play',
    image: '/images/diagrams/03_op_create.svg',
    description: '새 Redis 클러스터 초기화 - Pod/Service 생성, redis-cli --cluster create 실행',
    color: '#4caf50',
  },
  {
    id: 'op-scale-up',
    title: 'Scale Up Operation',
    iconType: 'add',
    image: '/images/diagrams/04_op_scale_up.svg',
    description: '노드 추가 - 마스터 조인, 슬롯 리밸런싱, 레플리카 연결',
    color: '#2196f3',
  },
  {
    id: 'op-scale-down',
    title: 'Scale Down Operation',
    iconType: 'remove',
    image: '/images/diagrams/05_op_scale_down.svg',
    description: '노드 제거 - 슬롯 마이그레이션, CLUSTER FORGET, Pod/PVC 정리',
    color: '#f44336',
  },
  {
    id: 'op-rebalance',
    title: 'Rebalance Operation',
    iconType: 'balance',
    image: '/images/diagrams/06_op_rebalance.svg',
    description: '슬롯 균등 분배 - 빈 마스터에 슬롯 부여 후 전체 리밸런싱',
    color: '#9c27b0',
  },
  {
    id: 'op-heal',
    title: 'Heal Operation',
    iconType: 'heal',
    image: '/images/diagrams/07_op_heal.svg',
    description: '클러스터 복구 - redis-cli --cluster fix로 상태 정상화',
    color: '#00897b',
  },
];

// 아이콘 타입을 실제 아이콘으로 매핑하는 함수
export const getOperationIcon = (iconType, color) => {
  const iconStyle = { color };
  switch (iconType) {
    case 'play': return <PlayArrowIcon sx={iconStyle} />;
    case 'add': return <AddCircleOutlineIcon sx={iconStyle} />;
    case 'remove': return <RemoveCircleOutlineIcon sx={iconStyle} />;
    case 'balance': return <BalanceIcon sx={iconStyle} />;
    case 'heal': return <HealingIcon sx={iconStyle} />;
    default: return null;
  }
};

// Features 데이터
export const features = [
  {
    icon: 'autofix',
    title: '자동 스케일링',
    description: 'Kubernetes Metrics API 연동으로 CPU/Memory 사용률 기반 자동 스케일링. Stabilization Window로 안정적인 스케일링 보장.',
    color: '#fff3e0',
    borderColor: '#ffcc80',
    iconColor: '#ff9800',
  },
  {
    icon: 'healing',
    title: 'Self-Healing & HA',
    description: '노드 장애 자동 감지 및 복구. Pod Anti-Affinity를 적용하여 같은 Shard의 Master/Replica가 서로 다른 워커 노드에 배포되도록 설계, 워커 노드 장애 시에도 Failover 가능. 실패한 Pod 재생성 및 클러스터 상태 자동 복원.',
    color: '#e8f5e9',
    borderColor: '#a5d6a7',
    iconColor: '#4caf50',
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
    icon: 'balance',
    title: '슬롯 리밸런싱',
    description: '스케일 업/다운 시 자동 슬롯 마이그레이션. 16384개 슬롯을 Master 노드에 균등 분배하여 데이터 무손실 보장.',
    color: '#f3e5f5',
    borderColor: '#ce93d8',
    iconColor: '#9c27b0',
  },
  {
    icon: 'monitor',
    title: 'Prometheus 통합',
    description: 'redis-exporter 사이드카 자동 배포. Pod별 메트릭 수집 및 Grafana 대시보드 연동 가능.',
    color: '#e3f2fd',
    borderColor: '#90caf9',
    iconColor: '#2196f3',
  },
];

// CRD YAML 예시
export const crdYaml = `apiVersion: cache.docker.direa.synology.me/v1alpha1
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

// 클러스터 상태 데이터
export const clusterStates = [
  { state: 'Creating', description: '클러스터 생성 중 (Pod, Service, PVC 생성)', color: '#fff3e0' },
  { state: 'Initialized', description: '초기 생성 완료 (redis-cli --cluster create 실행됨)', color: '#e3f2fd' },
  { state: 'Running', description: '정상 동작 중 (모든 노드 정상)', color: '#e8f5e9' },
  { state: 'Scaling', description: '스케일업 진행 중 (노드 추가 및 리밸런싱)', color: '#f3e5f5' },
  { state: 'ScalingDown', description: '스케일다운 진행 중 (슬롯 마이그레이션 후 노드 제거)', color: '#fce4ec' },
  { state: 'Rebalancing', description: '슬롯 리밸런싱 중', color: '#fff8e1' },
  { state: 'Healing', description: '장애 복구 중 (노드 재생성, Failover)', color: '#e0f7fa' },
  { state: 'Failed', description: '심각한 장애 (수동 개입 필요)', color: '#ffcdd2' },
];

// 트러블슈팅 데이터
export const troubleshootingItems = [
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
