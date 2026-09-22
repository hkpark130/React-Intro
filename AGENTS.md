# React-Intro 작업 지침

상위 작업 공간에 [../AGENTS.md](../AGENTS.md)가 있으면 먼저 읽는다. 독립 체크아웃에서도 아래 운영 보호 규칙을 적용한다.

## 운영 보호

- 2026-09-22 이번 작업은 사용자가 포트폴리오·RAG 운영 배포와 CI/CD 검증을 명시적으로 승인했다. 아래의 종전 push 금지는 이번 승인 범위에 한해 예외이며, RPG·공용 인프라 보호는 그대로 적용한다.

- 이 사이트와 RPG는 같은 EC2를 사용한다. `hk-rpg-backend`의 중지·재기동·재생성은 절대 금지한다. 공용 `edge-proxy`, `ext-network`, DB, Docker 데몬과 인증서를 변경하거나 재시작하지 않는다.
- `/home/ec2-user/build/cert`는 공용 프록시도 사용한다. `build/` 전체 삭제·교체는 금지한다.
- `master` push는 `.github/workflows/deploy.yml`과 CodePipeline을 통해 운영 배포를 일으킬 수 있다. 문서 변경도 예외가 아니다. 배포 요청 없이 push·워크플로 기동·`deploy.sh` 실행을 하지 않는다.
- 현재 사용자가 push를 명시적으로 금지했다. 블로그 데이터는 백업을 복원한 로컬 Spring/H2에서 읽고 수정한다. 운영 API로 로컬 편집 요청을 보내지 않는다.
- `production.yml`/`docker-compose.yml`의 호스트 443/80 바인딩을 운영에 그대로 적용하지 않는다. 실제 운영은 `edge-proxy`가 해당 포트를 점유한다.

## 변경 지점

- React 19 + Vite + MUI, JSX/ES modules. `@/`는 `src/`를 가리킨다.
- 현재 요청은 **기존 내용을 보존하는 전체 시각적 재설계와 공통 상단 내비게이션**이다. 이전 사이드바 복원 지시는 대체되었다. 프로젝트 순서와 기존 설명·구성도·기능은 보존한다. 새 프로젝트·개념 강의·성과·장식 이미지·로고 모음·부가 버튼은 임의로 추가하지 않는다.
- `src/main.jsx`가 `BrowserRouter`를 제공한다. `src/App.jsx`는 `layout/PortfolioLayout.jsx` 안에서 `layout/PortfolioRoutes.jsx`와 `/blog` 하위의 `src/blog/BlogApplication.jsx`를 연결한다. 상단 메뉴는 `layout/TopNavigation.jsx`, 프로젝트 순서는 `layout/projectNavigation.js`, 공통 테마는 `layout/portfolioTheme.js`다. 홈은 기존 React 포트폴리오 프로젝트 설명이며 별도 마케팅 표지로 바꾸지 않는다.
- 명시적으로 요청한 기술 검토는 `src/data/reviews/`에 프로젝트별 현재 구현·한계·개선 제안·검증·공식 근거를 모으고 `components/section/ProjectReview.jsx`로 제공한다. 원래 설명의 명백한 과장은 함께 정정하고, 제안·실제 로컬 코드 반영·운영 검증을 구분한다.
- 작성 도구와 포트폴리오·블로그의 실제 처리 구조도 개선 범위다. 기존 Markdown/커스텀 블록·게시글 ID·PPT에서 연결한 글 주소를 보존한다. t3.small을 고려해 새 상시 서비스나 로컬 AI 추론(Ollama 등)을 추가하지 않는다. 작성 도구는 편집기 전용 파일에 모으고 렌더러는 SPA/SSR 공통 정책으로 검증한다.
- 작성 도구의 이름·설명·명령은 `components/markdown/editor/editorTools.js`에서 관리하며, 아이콘 상단 도구와 검색 메뉴가 같은 명령을 실행한다. `/` 검색은 코드·HTML·기존 커스텀 블록 밖의 빈 줄에서만 열고, 취소·한글 조합·실행 취소·커서 복귀를 보존한다. 제목·카테고리 주변은 간결하게 유지한다. 공통 확대 이미지의 기본 좌우 여백은 `auto`로 두어 높이를 제한한 구성도도 중앙에 정렬한다.
- 상단 메뉴는 기존 프로젝트의 순서를 유지하며 프로젝트·기술 기록·소개로 접근한다. 블로그 목록·상세·작성·편집에서도 같은 내비게이션을 사용하고 모바일 메뉴·직접 경로 진입·키보드 초점 복귀를 확인한다. 이전 개편 소스를 일괄 복원하지 말고 사용자가 좋아한 소개 페이지의 내용만 복원한다.
- 공통 상단 바의 높이는 `--portfolio-header-height: 64px`다. 블로그 목차·분야·본문 앵커의 스크롤 위치에 이를 반영한다. `Profile.jsx`/`profile.css`에는 복원한 소개 내용을 담으며, 자격·수상 이미지도 공통 확대기를 사용한다. 이전 `LegacyPortfolio.jsx`·`Sidebar.jsx`는 현재 진입점에서 사용하지 않는다.
- `/openstack`은 `OpenStackBuild.jsx`와 `openstack-build.css`의 별도 구축 사례다. 물리 장비 준비·MAAS·Juju 배포·네트워크·Ceph 구성과 당시 문제 해결을 먼저 설명한다. 모니터링 도구 소개로 대체하지 않으며, 초기 구축·후속 확장·기준일이 있는 규모를 구별한다.
- 구성도와 유닛 목록은 `components/openstack/`과 `data/openstackArchitecture.js`, 독립 SVG는 `public/architecture/`에 있다. 상위 노드·LXD·principal/subordinate의 포함 관계를 보존하고, Neutron/OVN의 제어 관계와 실제 패킷 흐름을 구분한다. 날짜가 다른 설정·미확인 물리 배선을 현재 전체 배치로 단정하지 않는다.
- 별도 새 프로젝트 목록은 없다. 이전 개편 경로 `/projects`는 홈, `/cicd`는 구축·배포 기록 `/blog/55`로 연결한다. 실제 메뉴와 이동을 함께 확인한다.
- 블로그의 본문·푸터·4개 라우트·토큰 갱신은 `src/blog/BlogApplication.jsx`가 소유하며 내비게이션은 공통 상단 레이아웃이 제공한다. 테마는 `blogTheme.js`, 문서 격리는 `blog-scope.css`, 작성·로그인은 `blog-support.css`다. `html`/`body`의 `blog-document` 클래스는 블로그 진입 때 추가하고 떠날 때 제거한다.
- 블로그 목록·상세의 레이아웃은 `components/blog.css`, 읽기 목차는 `BlogReader.jsx`다. 외곽 최대 1240px·모바일 20px 여백, 본문 최대 760px·18px 글꼴을 기준으로 한다. `blog` 컨테이너 쿼리로 실제 본문 폭에 반응한다. 목록의 제목과 요약은 같은 글로 연결하며 첫 글에만 붙은 별도 읽기 버튼은 제거한다.
- 로그인 Dialog와 카테고리 Select는 MUI 기본 body Portal을 유지한다. 블로그 ThemeProvider와 활성 문서의 토큰·스타일로 글꼴을 맞추고, 초점 이동·Escape·스크롤 잠금/해제 및 블로그→포트폴리오 전환을 검사한다.
- `ChatWidget`은 공통 레이아웃에서 포트폴리오와 블로그 목록·상세·작성·편집에 표시한다. 2026-09-22 사용자 요청으로 블로그 숨김 규칙을 대체했다. 한글 조합 Enter 방지·Escape·초점 복귀·사용 불가 API 안내를 유지하고, 출처 링크로 글에 이동할 때 창을 닫는다. 로그인 등 다른 모달이 열린 동안 답변이 도착해도 챗봇이 초점을 가져오지 않는다.
- 2026-09-22 사용자 요청으로 `/chatbot`의 직접 Transformer 설계·학습 소개를 RAG 글 안내 프로젝트로 교체했다. 경로는 유지한다. `../rag-test/portfolio_server.py`의 `/api/chat` JSON 계약을 사용하며 출처 링크는 반환된 글 ID로 만드는 `/blog/{id}`다. 사이트 주인·소개 질문은 검색·모델 호출 없이 고정 안내와 `/profile` 링크를 제공한다. 이 링크만 별도로 허용하며 생성 문장의 URL을 자동 링크로 만들지 않는다. 챗봇 HTTP 클라이언트는 블로그 인증·갱신과 분리한다.
- RAG의 로컬 실험에는 사용자가 요청한 Ollama 실행을 허용한다. `../rag-test/start-local.ps1`은 작업 폴더 안의 실행 파일·모델을 사용하며 자동 시작 서비스로 설치하지 않는다. 이 예외는 운영 EC2에 새 프로세스를 추가할 권한이 아니다. 기본 연결은 loopback `8000`, Ollama는 `11434`; `RAG_API_TARGET`의 원격 주소는 거부한다. 운영 push·배포 금지는 계속 적용한다.
- RAG 흐름 설명은 Ollama의 임베딩 생성, SQLite의 벡터 저장, Python의 코사인 연산·검색 순위 결정을 구별한다. 2026-09-22 요청으로 추가한 2차원 벡터 예시는 원리 설명용이며 실제 768차원 임베딩을 투영한 그래프나 실제 검색 점수로 표현하지 않는다.
- RAG 페이지는 사용자의 DevOps·인프라 직무에 맞춰 시스템 연결과 2GB OpenStack 실행 경험 중심으로 간결하게 설명한다. 요청에 따라 이 페이지의 `개선할 점`·`검색 품질을 확인한 범위` 절은 제거했다. 다른 프로젝트의 검토 절까지 삭제하는 요청으로 확대하지 않는다. 슬라이더·좌표·수식은 항상 표시하며 동적으로 바뀌는 유사도 옆에 예시 기준의 추천·제외 결과를 함께 보여준다. 설명을 쉽게 해 달라는 요청을 그래프 접기나 별도 질문 선택·고정 비교표 추가로 확대하지 않는다.
- 공식 원본 로고는 `public/brands/`, 출처·정책·해시는 `sources.json`에 있다. 로고 색·비율과 기술명, 라이선스·출처 메타데이터는 유지하되 화면에 로고 출처 링크나 문구를 표시하지 않는다. 구성도는 기존 `ZoomableImageModal`을 공통 사용하며 별도 새 탭·SVG 다운로드 버튼을 제거한다. 화살표 의미를 보존하고 모바일 터치 드래그·크기 조절까지 확인한다.
- 블로그 글꼴은 로컬 `public/fonts/PretendardVariable.woff2`, 라이선스는 같은 폴더에 있다. 원래 사이트 아이콘 설정은 `index.html`과 `public/manifest.json`에 유지한다. 회사 원문·경력 문서·DB 백업을 정적 자산이나 내보내기 묶음에 넣지 않는다.
- `components/section/`의 `TitleSection`, `CommonSection`, `TechStack`, `CodeAccordion`, `Reference`, `ZoomableImageModal`을 먼저 검토한다. 섹션/데이터 분리는 기존 `components/kredis/`가 참고 사례다.
- 블로그는 `src/api/api.js` → `/api/posts` → Spring-Blog DB를 사용한다. `blog-all-posts.json`은 편집 근거이며 운영 데이터 소스가 아니다.
- SSR/Notion/SEO는 `server/notion-service/src/index.js`, 라우팅은 `nginx.prd.conf`에 있다. 일반 사용자 SPA와 봇 SSR 경로를 함께 고려한다.
- Node 도입 의도는 공식 `@notionhq/client`와 npm의 Notion 블록 변환·렌더링 생태계를 활용해 직접 구현할 부분을 줄이기 위한 것이다. CORS만을 위한 우회 서비스로 축약하거나 그 전제로 불필요한 컨테이너로 평가하지 않는다. 공식 SDK의 API 조회와 변환/렌더링 라이브러리의 역할, 최초 도입 의도와 이후 구현 변경을 구분한다.
- 회사 원자료를 공개할 때는 상위 지침의 원문 보존·사실 확인 기준을 적용한다. 2026-09-22 사용자 결정에 따라 본문·명령·출력·그림의 원래 내부/공인 IP·서브넷·DNS 주소를 유지하고 임의 마스킹이나 예시 주소 치환을 하지 않는다.

## 로컬 명령과 검증

이 저장소에서 실행한다. 의존성이 없거나 lockfile이 바뀌었을 때 `npm ci`를 사용한다.

- 블로그 로컬 편집: `npm run dev:editorial` → `127.0.0.1:5178`. Spring의 `editorial` 프로필을 8100에서 먼저 실행한다. 다른 작업이 쓰는 5173을 중지하지 않는다. 이 모드는 loopback API만 허용하며 원격 `VITE_API_URL`을 거부한다.
- `src/main.jsx`의 서비스 워커 등록은 production 빌드에만 적용한다. 로컬 개발에서 서비스 워커 등록을 강제하지 않는다.
- 일반 개발: `npm run dev -- --host 127.0.0.1`. 블로그 편집에는 위 editorial 모드를 사용하고 운영 주소를 개발 프록시에 넣지 않는다.
- 소스 변경 검증: `npm test`, `npm run lint`, `npm run build`. `tests/`에 Vitest/React DOM 기반 렌더러·로컬 연결 회귀 검사가 있다. 전체 lint의 기존 실패와 변경으로 생긴 실패를 구별한다.
- 블로그 SSR 로컬 검증: `server/notion-service`에서 `npm ci`, `npm test`, `npm run start:editorial`. 기본 listen은 `127.0.0.1:3100`, Spring은 `127.0.0.1:8100`이다. 이 모드는 원격 Spring·redirect·환경 프록시 경유를 막고 `/notion`·`/seo`의 외부 조회를 거부한다. 기존 서버를 중지하지 않고 필요하면 사용하지 않는 `PORT`를 명시한다. 공통 Markdown 파서 원본은 `server/notion-service/src/markdown/prepareMarkdown.js`이며 SPA 경로는 재export만 한다.
- 화면/라우팅 변경: 로컬 브라우저에서 직접 경로 진입, 모바일/데스크톱 메뉴, 기존 블로그 접근을 확인한다. 문서만 수정하면 경로·내용·diff 확인으로 충분하다.
- 기존 lint 오류와 새 회귀를 구분하고 관련 없는 코드를 일괄 수정하지 않는다. 배포 스크립트를 검증 명령으로 실행하지 않는다.

## Code Review Rules

- 게임 경로·공용 포트·인증서·네트워크에 영향을 주는 변경은 반드시 지적한다. 포트폴리오 소스 변경으로 게임 재시작이 필요해지는 설계를 받아들이지 않는다.
- 새 메뉴와 라우트의 불일치, SPA deep link 및 SSR 경로의 회귀를 확인한다.
- 공개 자료의 내부 정보 노출과 근거 없는 완료/성능 주장을 지적한다.
