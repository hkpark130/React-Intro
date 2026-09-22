import { Link } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ZoomableImageModal from './section/ZoomableImageModal';
import './profile.css';

const experience = [
  { title: '클라우드 운영과 문제 해결', description: 'OpenStack과 Ceph, Kubernetes를 운영하며 네트워크와 스토리지 문제를 다뤘습니다. 노드 지표와 VM 정보를 연결하는 관측 도구를 직접 만들어, VM별 트래픽의 원인을 조사했습니다.', tags: ['OpenStack', 'Ceph', 'Kubernetes'], to: '/openstack', link: '클라우드 운영 사례' },
  { title: '설치 환경에 맞춘 배포 자동화', description: 'MR 검증부터 빌드와 산출물 생성, 배포까지 연결했습니다. 일반 서버의 JAR, Kubernetes, 오프라인 설치 패키지처럼 서로 다른 전달 방식을 함께 다뤘습니다.', tags: ['Jenkins', 'Ansible', 'Helm'], to: '/cicd', link: '배포 자동화 사례' },
  { title: '운영에 필요한 도구와 서비스 개발', description: 'Redis Cluster의 상태를 관리하는 Go Operator를 구현하고, Spring Boot와 React로 기술 블로그를 만들었습니다. 인프라를 사용하는 애플리케이션의 동작까지 함께 살펴봅니다.', tags: ['Go', 'Spring Boot', 'React'], to: '/kredis', link: 'Redis Operator 구현' },
];
const credentials = [
  { image: '/images/cka.png', title: 'Certified Kubernetes Administrator', organization: 'Cloud Native Computing Foundation', kind: '자격 이력' },
  { image: '/images/aws.png', title: 'AWS Solutions Architect – Associate', organization: 'Amazon Web Services', kind: '자격 이력' },
  { image: '/images/award1.png', title: 'JAVA 프로그래밍 경진대회', organization: '한빛미디어 · 은상 · 2016', kind: '수상 이력', href: 'http://cafe.naver.com/thisisjava/11141' },
  { image: '/images/award2.png', title: '신규 사업 아이디어 콘테스트', organization: 'KWC · 장려상 · 2018', kind: '수상 이력' },
];

const careerStages = [
  { period: '2018.04 — 2022.02', title: '서비스 개발' },
  { period: '2022.02 — 2023.06', title: 'SRE' },
  { period: '2023.07부터', title: '인프라' },
];

export default function Profile() {
  return (
    <div className="support-page profile-page">
      <header className="profile-hero">
        <div className="profile-introduction">
          <p className="profile-role">DevOps Engineer</p>
          <h1>박현경</h1>
          <p className="support-lead">클라우드를 운영하고, 배포를 자동화합니다.<br />문제의 원인을 찾는 도구와 그 과정을 설명하는 기록을 만듭니다.</p>
          <Link className="profile-work-link" to="/">프로젝트에서 작업 살펴보기</Link>
        </div>
        <aside className="profile-contact" aria-label="연락처">
          <h2>연락처</h2>
          <p>함께 나누고 싶은 이야기가 있다면<br />이메일로 연락해 주세요.</p>
          <a href="mailto:hkpark130@naver.com"><MailOutlineIcon fontSize="small" />hkpark130@naver.com</a>
          <div className="profile-socials">
            <a href="https://github.com/hkpark130" target="_blank" rel="noopener noreferrer"><GitHubIcon fontSize="small" />GitHub</a>
            <a href="https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/" target="_blank" rel="noopener noreferrer"><LinkedInIcon fontSize="small" />LinkedIn</a>
          </div>
        </aside>
      </header>
      <section className="profile-career" aria-labelledby="profile-career-title">
        <div className="profile-career-heading"><h2 id="profile-career-title">개발에서 인프라 운영까지</h2></div>
        <ol>{careerStages.map(stage => <li key={stage.title}><span>{stage.period}</span><h3>{stage.title}</h3></li>)}</ol>
      </section>
      <section className="profile-experience" aria-labelledby="profile-experience-title">
        <div className="support-section-heading"><h2 id="profile-experience-title">주요 경험</h2><p>직접 맡아 온 일과<br className="profile-desktop-break" /> 그 안에서 만든 것들입니다.</p></div>
        <div className="profile-experience-list">
          {experience.map(item => <article key={item.title} className="profile-experience-item"><h3>{item.title}</h3><p>{item.description}</p><div className="profile-experience-meta"><ul aria-label="관련 기술">{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><Link to={item.to}>{item.link}</Link></div></article>)}
        </div>
      </section>
      <section className="profile-records" aria-labelledby="profile-records-title">
        <div className="support-section-heading"><h2 id="profile-records-title">자격과 수상</h2><p>자격 취득과 수상 이력입니다.<br className="profile-desktop-break" /> 이미지를 눌러 자세히 볼 수 있습니다.</p></div>
        <div className="profile-credentials">
          {credentials.map(item => <article className="profile-credential" key={item.title}>
            <div className="profile-credential-image"><ZoomableImageModal imageSrc={item.image} altText={item.title} sx={{ width: '100%', height: 100, objectFit: 'contain', margin: 0, border: 0 }} /></div>
            <div><span>{item.kind}</span><h3>{item.title}</h3><p>{item.organization}</p>{item.href && <a href={item.href} target="_blank" rel="noopener noreferrer">작품 소개 보기</a>}</div>
          </article>)}
        </div>
      </section>
      <section className="profile-next"><div><h2>선택의 이유도 기록합니다.</h2><p>VM의 트래픽을 조사하고, 배포 환경의 제약을 풀어 간 과정을 기술 글로 남겼습니다.</p></div><Link className="support-secondary-link" to="/blog">기술 블로그 읽기</Link></section>
    </div>
  );
}
