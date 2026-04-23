export const PROJECTS = [
  {
    slug: 'kredis',
    name: 'Kredis',
    kicker: 'Kubernetes Operator',
    path: '/kredis',
    description: 'Redis 클러스터 autoscaling operator. CRD 기반 reconcile 루프.',
    stack: ['Go', 'K8s', 'Operator'],
    tags: ['devops', 'infra', 'backend'],
    thumbnail: '/logo/kubernetes.svg',
    featured: true,
  },
  {
    slug: 'springboot',
    name: 'Spring Blog',
    kicker: 'Spring Boot',
    path: '/springboot',
    description: 'JWT · 캐시 · CodeDeploy 무중단 배포까지. 이 사이트 블로그를 서빙하는 엔진.',
    stack: ['Java', 'Spring', 'MySQL'],
    tags: ['backend'],
    thumbnail: '/logo/spring-boot.png',
    featured: true,
  },
  {
    slug: 'terraform',
    name: 'Terraform IaC',
    kicker: 'Infrastructure as Code',
    path: '/terraform',
    description: 'AWS 리소스 자동 프로비저닝 파이프라인.',
    stack: ['HCL', 'AWS'],
    tags: ['devops', 'infra'],
    thumbnail: '/logo/terraform.png',
    featured: true,
  },
  {
    slug: 'golang',
    name: 'Go JWT Auth',
    kicker: 'Go · 인증 서버',
    path: '/golang',
    description: 'Go로 구현한 경량 JWT 인증 서버 + 토큰 rotation.',
    stack: ['Go', 'JWT'],
    tags: ['backend'],
    thumbnail: '/logo/go.png',
    featured: false,
  },
  {
    slug: 'opensearch',
    name: 'OpenSearch Dashboard',
    kicker: '로그 분석',
    path: '/opensearch',
    description: 'OpenSearch 기반 로그 수집·시각화 대시보드.',
    stack: ['OpenSearch', 'Kibana'],
    tags: ['devops', 'infra'],
    thumbnail: '/logo/opensearch.png',
    featured: false,
  },
  {
    slug: 'python',
    name: '집값 예측 ML',
    kicker: 'Machine Learning',
    path: '/python',
    description: 'TensorFlow로 집값 예측 모델 학습 · 평가 파이프라인.',
    stack: ['Python', 'TensorFlow'],
    tags: ['ai'],
    thumbnail: '/logo/tensorflow.png',
    featured: false,
  },
  {
    slug: 'chrome',
    name: 'Chrome Extension',
    kicker: 'Browser Tooling',
    path: '/chrome',
    description: '업무 생산성 향상용 Chrome 확장 프로그램.',
    stack: ['JavaScript', 'Chrome API'],
    tags: ['frontend'],
    thumbnail: '/logo/chrome.png',
    featured: false,
  },
  {
    slug: 'chatbot',
    name: 'AI 챗봇',
    kicker: 'LLM Integration',
    path: '/chatbot',
    description: '포트폴리오 사이트에 내장된 AI 챗봇.',
    stack: ['LLM', 'Python'],
    tags: ['ai'],
    thumbnail: '/logo/chatbot.png',
    featured: false,
  },
  {
    slug: 'redmine',
    name: 'Redmine 자동화',
    kicker: '프로젝트 관리',
    path: '/redmine',
    description: 'Redmine 이슈 관리 자동화 도구 · 보고서 생성.',
    stack: ['Ruby', 'Redmine API'],
    tags: ['devops'],
    thumbnail: '/logo/redmine.png',
    featured: false,
  },
  {
    slug: 'ssr-notion',
    name: 'SSR-Notion Service',
    kicker: 'Node.js SSR',
    path: '/chatbot',
    description: 'Notion 렌더 + SEO 메타 preview + sitemap 서빙 Node.js SSR (별도 진입점 대체).',
    stack: ['Node.js', 'Express', 'Notion API'],
    tags: ['backend', 'infra'],
    thumbnail: '/logo/node.png',
    featured: false,
  },
];

export function getFeaturedProjects() {
  return PROJECTS.filter((p) => p.featured);
}

export function getProjectsByTag(tag) {
  if (!tag || tag === 'all') return PROJECTS;
  return PROJECTS.filter((p) => p.tags.includes(tag));
}

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
