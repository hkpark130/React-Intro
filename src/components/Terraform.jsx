
import { Box, Typography, Stack, Link } from '@mui/material';

import TitleSection from '@/components/section/TitleSection';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import CodeAccordion from '@/components/section/CodeAccordion';
import TechStack from '@/components/section/TechStack';
import Reference from '@/components/section/Reference';


import GitHubIcon from '@mui/icons-material/GitHub';
import WorkIcon from '@mui/icons-material/Work';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WebIcon from '@mui/icons-material/Web';



function Terraform() {
  return (
    <article className="project-document project-document--terraform">
      <div className="project-section-slot"><HeroSection /></div>
      <div className="project-section-slot"><TechStackSection /></div>
      <div className="project-section-slot"><OverviewSection /></div>
      <div className="project-section-slot"><GitHubActionsSection /></div>
      <div className="project-section-slot"><WorkflowSection /></div>
      <div className="project-section-slot"><ReferenceSection /></div>
    </article>
  );
}

function HeroSection() {
  return (
    <TitleSection title="IaC (Terraform)" subtitle="Infrastructure as Code 구현 프로젝트" description="AWS + GitHub Actions + Terraform" />
  );
}

function TechStackSection() {
  const techStacks = [
    {
      category: '인프라',
      labels: [
        { label: 'AWS', color: 'warning' },
        { label: 'Terraform', color: 'info' }
      ],
    },
    {
      category: 'CI/CD',
      labels: [
        { label: 'GitHub Actions', color: 'secondary' },
        { label: 'Makefile', color: 'success' },
      ],
    },
  ];

  return (
    <TechStack techStacks={techStacks} />
  );
}

function OverviewSection() {
  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
        <WebIcon color="primary" /> 프로젝트 개요
      </Typography>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        각 프로젝트의 인프라 리소스를 Terraform으로 관리하도록 하였습니다. 
        코드형 인프라(IaC)를 통해 인프라 설정을 버전 관리하고 자동화된 배포가 가능하도록 구성했습니다.
      </Typography>
      <Box sx={{mt:2,p:2}} className="project-note">
        <Typography variant="body1" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <strong>이름:</strong> GitHub Actions{' '}
              <Link href="https://github.com/hkpark130/terraform/tree/main/.github/workflows" target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                워크플로 코드
                <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Link>
            </li>
            <li><strong>Provider:</strong> AWS</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
}

function GitHubActionsSection() {
  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <GitHubIcon />
        <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
          GitHub Actions
        </Typography>
      </Stack>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        main 브랜치에 PR 생성이나 GitHub Actions에서도 Plan 명령어를 실행후 봇으로 결과 출력합니다.
        release 브랜치에 push하면 apply 명령어 실행후 봇으로 결과 출력합니다.
      </Typography>

      <Box sx={{mb:2}}>
        <img src="/images/gitbot.png" alt="Terraform GitHub Actions 워크플로우" style={{
            maxWidth: '100%',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }} />
        <Typography variant="body1" color="textSecondary" textAlign="center">
          GitHub Actions 봇 출력 결과
        </Typography>
      </Box>

      <CodeAccordion title=".github/workflows/project-dev-plan.yml" language="yaml" codeString={`on:
  pull_request:
    branches:
      - main
      
jobs:
  plan:
    name: Plan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        ...
      - name: check diff
        id: diff
        uses: technote-space/get-diff-action@v6
        ...
      - name: configure AWS credentials for portfolio
        ...
      - name: setup terraform
        id: setup
        if: steps.diff.outputs.diff
        ...
      - name: terraform init
        id: init
        if: steps.diff.outputs.diff
        ...
      - name: terraform plan
        if: steps.diff.outputs.diff
        id: plan
        ...
      - name: comment
        if: steps.diff.outputs.diff
        uses: actions/github-script@v6.1.0
        ...`} />
      <Typography variant="body1" color="textSecondary">
        main 브랜치에 PR 생성하면 Github Actions에서도 Plan 명령어를 실행후 bot으로 결과 출력합니다.
      </Typography>

      <CodeAccordion title=".github/workflows/project-dev-apply.yml" language="yaml" codeString={`on:
  push:
    branches:
      - release
      
jobs:
  apply:
    name: Apply
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        ...
      - uses: jwalton/gh-find-current-pr@v1
        id: findpr
        ...
      - name: setup terraform
        uses: hashicorp/setup-terraform@v2
        ...
      - name: configure AWS credentials for portfolio
        ...
     - name: terraform apply
        continue-on-error: true
        id: apply
        ...
      - name: comment
        if: \${{ steps.apply.outcome == 'success' }}
        uses: actions/github-script@v6.1.0
        ...`} />
      <Typography variant="body1" color="textSecondary">
        release 브랜치에 push하면 apply 명령어 실행후 bot으로 결과 출력합니다.
      </Typography>
    </Box>
  );
}

function WorkflowSection() {
  return (
    <Box sx={{mb:{xs:2,sm:3}}}>
      <Stack direction="row" spacing={1.5} alignItems="center" className="project-heading-row">
        <WorkIcon />
        <Typography variant="h5" gutterBottom component="h2" className="project-section-heading">
          Workflow
        </Typography>
      </Stack>
      <Typography variant="body1" component="p" sx={{mb:1.5}}>
        각 프로젝트마다 폴더가 있으며 Makefile로 테라폼 명령어를 실행합니다.
      </Typography>
      
      <Box sx={{my:2,p:2}} className="project-note">
        <Typography variant="body1" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>각 프로젝트의 modules 에 있는 tf 파일들을 불러오고 테라폼 초기세팅을 위해 <code>make setup</code> 명령어를 먼저 실행</li>
            <li><code>terraform plan</code>은 var-file 설정이 되도록 <code>make plan</code> 명령어로 실행</li>
            <li><code>terraform apply</code>은 GitHub Actions로 실행 (<u>로컬에서 실행 안 함!</u>)</li>
          </ul>
        </Typography>
        <CodeAccordion title="base.mk" language="makefile" codeString={`# 각 프로젝트마다 base.mk 를 include 함
# include $(shell git rev-parse --show-cdup)make/base.mk

PROJECT_ROOT := $(shell git rev-parse --show-cdup)
PROJECT 	 := $(shell echo \${PWD} | rev | cut -d '/' -f 3 | rev)
ENV 		 := $(shell echo \${PWD} | rev | cut -d '/' -f 2 | rev)
PLAN_OUT   	 := ./.terraform/default.plan

COMMON_VAR_FILE := $(PROJECT_ROOT)terraform/\${PROJECT}/tfvars/common.tfvars
VAR_FILE 		:= $(PROJECT_ROOT)terraform/\${PROJECT}/tfvars/\${ENV}.tfvars
VAR_OPTIONS 	:= -var-file "$(COMMON_VAR_FILE)" -var-file "$(VAR_FILE)"

.PHONY: setup install-terraform init-terraform plan

setup: install-terraform init-terraform
	$(info Setup completed.)

install-terraform:
	tfenv install

init-terraform:
	rm -rf .terraform
	terraform init

fmt: 
	terraform fmt

plan: fmt
	terraform plan $(VAR_OPTIONS) \
	-compact-warnings \
	-parallelism 10 \
	-out $(PLAN_OUT)`} />
      </Box>

      <ZoomableImageModal imageSrc="/images/gitbot2.png" altText="Terraform 워크플로우" caption="GitHub Actions 워크플로우 실행 목록" sx={{mt:3}} />
    </Box>
  );
}

function ReferenceSection() {
  return (
    <Reference spaLinks={[
      ]} externalLinks={[
        {
          prefix: 'GitHub:',
          href: 'https://github.com/hkpark130/terraform',
          label: 'https://github.com/hkpark130/terraform'
        }
      ]} />
  );
}

export default Terraform;