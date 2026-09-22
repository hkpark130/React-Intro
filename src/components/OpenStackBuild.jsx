import PropTypes from 'prop-types';
import { Box, Chip, Link, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TitleSection from './section/TitleSection';
import CommonSection from './section/CommonSection';
import OpenStackArchitecture from './openstack/OpenStackArchitecture';
import ZoomableImageModal from './section/ZoomableImageModal';
import { openstackBuildPhotos } from '../data/openstackBuildPhotos';
import './openstack-build.css';

const buildSteps = [
  {
    number: '01',
    title: '물리 장비 준비',
    description: '라우터·랙·스위치·서버를 설치하고, PXE 부팅과 전원 관리 연결을 준비했습니다.',
    detail: '관리망 · PXE · iDRAC',
  },
  {
    number: '02',
    title: 'MAAS 프로비저닝',
    description: '서버 등록과 Commission을 진행하고, DHCP·태그·브리지 설정을 맞춰 배포했습니다.',
    detail: '등록 → Commission → Ready → Deploy',
  },
  {
    number: '03',
    title: 'Juju 서비스 배치',
    description: 'Juju 유닛으로 OpenStack 서비스를 배치하고, 의존 관계와 서비스 상태를 확인했습니다.',
    detail: 'Nova · Glance · Cinder · Ceph',
  },
];

const buildDecisions = [
  {
    title: '서버가 Commission 단계에서 멈췄을 때',
    problem: '서버 등록 과정에서 iDRAC의 전원 관리 정보를 가져오지 못하거나, 등록된 정보가 실제 설정과 달랐습니다.',
    action: 'PXE 우선순위와 iDRAC 관리 포트 연결을 점검하고, 변경된 전원 관리 정보를 MAAS에 갱신했습니다.',
  },
  {
    title: '여러 용도의 주소 범위를 함께 관리하기',
    problem: 'MAAS가 배포에 사용할 범위와 기존 라우터의 DHCP, OpenStack의 Floating IP 용도를 구분해야 했습니다.',
    action: '예약 범위와 동적 할당 범위를 나누고 DNS도 함께 설정해, 서버 배포와 클라우드 네트워크의 기준을 맞췄습니다.',
  },
  {
    title: 'br-ex와 bond 연결 문제를 추적하기',
    problem: 'br-ex의 bond 인터페이스 오류와 Juju 접속·인스턴스 통신 문제를 함께 확인했습니다.',
    action: 'ovs-vsctl show로 실제 브리지 연결을 확인하고, 본딩 방식을 balance-xor로 조정한 과정을 기록했습니다.',
  },
  {
    title: 'OSD용 디스크가 부족했던 초기 환경',
    problem: '초기 노드의 디스크가 이미 OS용으로 사용돼, Ceph OSD에 할당할 별도 디스크가 없었습니다.',
    action: 'NAS에 LUN을 만들고 각 노드의 블록 장치로 연결해 OSD에 활용했습니다. 재부팅 후 디스크 연결과 OSD 활성화 문제도 다뤘습니다.',
  },
];

const extensions = [
  {
    period: '2024년 후속 기록',
    title: 'Octavia로 LoadBalancer 연동',
    description: 'Kubernetes의 LoadBalancer 서비스를 사용하기 위해 Octavia를 추가했습니다. Amphora 이미지와 인증서, 대시보드를 구성하고 LB 생성 과정의 문제를 해결했습니다.',
    links: [{ to: '/blog/79', label: 'Octavia 구축 기록' }],
  },
  {
    period: '2024년 후속 기록',
    title: 'RKE·Rancher와 OpenStack 연결',
    description: 'OpenStack VM 위에 RKE 클러스터를 구성했습니다. CCM과 Cinder CSI를 연결하고, Rancher 대시보드·Node Driver를 통해 클러스터와 VM을 관리하도록 구성했습니다.',
    links: [{ to: '/blog/80', label: 'RKE·CCM·Cinder CSI' }, { to: '/blog/82', label: 'Rancher 대시보드·Node Driver' }],
  },
  {
    period: '2026.03 후속 기록',
    title: '공유 파일시스템 요구에 Manila 추가',
    description: 'Cinder multiattach만으로는 여러 워커의 파일 공유 요구를 충족하지 못했습니다. Manila·CephFS·NFS와 Manila CSI를 구성해 공유 파일시스템으로 전환했습니다.',
    links: [{ to: '/blog/106', label: 'Cinder의 한계와 Manila 전환' }],
  },
];

const references = [
  { to: '/blog/54', title: 'OpenStack 프라이빗 클라우드 구축', description: '구축 목적, 초기 구조와 배포 화면' },
  { to: '/blog/56', title: 'MAAS·OpenStack 구축 트러블슈팅', description: '장비 등록, DHCP, 브리지와 초기 스토리지 제약' },
  { to: '/blog/93', title: 'OpenStack과 Ceph 스토리지', description: 'Cinder·Glance·Ceph의 역할과 저장소 연결' },
  { to: '/blog/79', title: 'Barbican·Octavia 구축', description: 'Amphora 이미지, 인증서와 LoadBalancer 구성' },
  { to: '/blog/80', title: 'RKE 클러스터와 OpenStack 연동', description: 'VM·CCM·Cinder CSI 구성 과정' },
  { to: '/blog/82', title: 'Rancher 대시보드와 Node Driver', description: '클러스터 관리와 OpenStack VM 프로비저닝' },
  { to: '/blog/106', title: 'Cinder에서 Manila로 전환', description: '다른 워커 노드에서 드러난 파일 공유 문제' },
];

function BuildSection({ id, title, icon, children }) {
  const Icon = icon;
  return (
    <section className="openstack-build-section" aria-labelledby={id}>
      <CommonSection
        title={(
          <Typography component="h2" variant="h5" id={id} className="openstack-build-section-title">
            <Icon color="primary" aria-hidden="true" />{title}
          </Typography>
        )}
        body={children}
        sx={{ mb: 0 }}
      />
    </section>
  );
}

BuildSection.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
};

export default function OpenStackBuild() {
  return (
    <Box component="article" className="openstack-build-page">
      <Box className="openstack-build-frame">
        <header>
          <TitleSection
            title="OpenStack 프라이빗 클라우드 구축"
            subtitle="물리 장비 준비부터 서비스 배포까지"
            description="사내 클라우드 환경을 직접 만들고, 필요한 기능을 단계적으로 확장한 기록입니다."
          />
        </header>

        <BuildSection id="openstack-build-overview" title="구축 목적과 직접 맡은 범위" icon={BuildOutlinedIcon}>
          <Typography component="p" className="openstack-build-copy">
            사내에서 VM과 스토리지를 운영할 수 있는 프라이빗 클라우드 환경이 필요했습니다.
            라우터·서버랙·스위치·물리 서버 설치부터 OpenStack 배포와 유지보수까지 담당했습니다.
          </Typography>
          <Typography component="p" className="openstack-build-copy">
            MAAS로 서버를 프로비저닝하고, Juju 유닛으로 OpenStack 서비스를 배치했습니다.
            네트워크와 Ceph를 연결해 VM과 볼륨을 사용할 기반을 만들고, 이후 Kubernetes 연동까지 확장했습니다.
          </Typography>
          <Box className="openstack-build-scope" aria-label="직접 담당한 범위">
            <Chip label="물리 장비 설치" color="primary" variant="outlined" />
            <Chip label="클라우드 배포·연동" color="secondary" variant="outlined" />
            <Chip label="구축 후 유지보수" color="primary" variant="outlined" />
          </Box>
          <Link component={RouterLink} to="/blog/54" className="openstack-build-inline-link">초기 구조와 구축 기록 보기</Link>
        </BuildSection>

        <OpenStackArchitecture />

        <BuildSection id="openstack-build-process" title="직접 구성한 구축 과정" icon={AccountTreeOutlinedIcon}>
          <figure className="openstack-build-process">
            <figcaption>물리 장비를 클라우드로 준비한 작업 순서</figcaption>
            <ol className="openstack-build-steps" role="list">
              {buildSteps.map((step) => (
                <li key={step.number}>
                  <span className="openstack-build-step-number" aria-hidden="true">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="openstack-build-step-detail">{step.detail}</span>
                </li>
              ))}
            </ol>
          </figure>
          <figure className="openstack-build-photo openstack-build-photo--structure">
            <ZoomableImageModal {...openstackBuildPhotos.structure} />
          </figure>
          <div className="openstack-build-connections">
            <Paper variant="outlined" className="openstack-build-connection">
              <Typography component="h3"><SettingsEthernetOutlinedIcon color="primary" aria-hidden="true" />네트워크 연결</Typography>
              <p>MAAS 단계에서 관리망·DHCP·브리지를 준비했습니다. br-ex와 본딩, 라우팅 문제를 조정하고 OpenStack의 가상 네트워크와 연결했습니다.</p>
              <span>관리망 · br-ex/OVS · Neutron/OVN</span>
            </Paper>
            <Paper variant="outlined" className="openstack-build-connection">
              <Typography component="h3"><StorageOutlinedIcon color="primary" aria-hidden="true" />Ceph 스토리지 연결</Typography>
              <p>초기에는 NAS LUN을 노드의 블록 장치로 연결해 OSD에 활용했습니다. Ceph를 Cinder·Glance와 연동해 볼륨과 이미지를 저장하도록 구성했습니다.</p>
              <span>NAS LUN · Ceph OSD · Cinder · Glance</span>
            </Paper>
          </div>
          <div className="openstack-build-photo-grid" aria-label="당시 구축 화면">
            <figure className="openstack-build-photo">
              <ZoomableImageModal {...openstackBuildPhotos.juju} />
            </figure>
            <figure className="openstack-build-photo">
              <ZoomableImageModal {...openstackBuildPhotos.horizon} />
            </figure>
          </div>
          <dl className="openstack-build-checks">
            <div><dt><code>juju status</code></dt><dd>서비스 유닛의 배치와 상태 확인</dd></div>
            <div><dt><code>ovs-vsctl show</code></dt><dd>br-ex와 인터페이스의 실제 연결 확인</dd></div>
          </dl>
          <p className="openstack-build-note">MAAS·Juju는 장비와 서비스를 배포·관리하는 역할입니다. 위 화살표는 구축 작업의 순서를 나타냅니다.</p>
        </BuildSection>

        <BuildSection id="openstack-build-decisions" title="구축 중 만난 문제와 선택" icon={BuildOutlinedIcon}>
          <div className="openstack-build-decisions">
            {buildDecisions.map((decision) => (
              <Paper key={decision.title} variant="outlined" className="openstack-build-decision">
                <h3>{decision.title}</h3>
                <dl>
                  <div><dt>문제</dt><dd>{decision.problem}</dd></div>
                  <div><dt>작업</dt><dd>{decision.action}</dd></div>
                </dl>
              </Paper>
            ))}
          </div>
          <Link component={RouterLink} to="/blog/56" className="openstack-build-inline-link">당시 로그·설정과 트러블슈팅 기록</Link>
        </BuildSection>

        <BuildSection id="openstack-build-extensions" title="구축 이후 연결한 기능" icon={ExtensionOutlinedIcon}>
          <p className="openstack-build-copy">초기 클라우드를 기반으로, 클러스터 관리·LoadBalancer·공유 스토리지 요구에 맞춰 구성을 추가했습니다.</p>
          <div className="openstack-build-extensions">
            {extensions.map((extension) => (
              <Paper key={extension.title} variant="outlined" className="openstack-build-extension">
                <span className="openstack-build-period">{extension.period}</span>
                <h3>{extension.title}</h3>
                <p>{extension.description}</p>
                <div className="openstack-build-extension-links">
                  {extension.links.map((link) => <Link key={link.to} component={RouterLink} to={link.to}>{link.label}</Link>)}
                </div>
              </Paper>
            ))}
          </div>
          <p className="openstack-build-note">Cinder의 블록 볼륨 연동과 Manila의 공유 파일시스템은 서로 다른 요구를 해결한 구성입니다.</p>
        </BuildSection>

        <BuildSection id="openstack-build-snapshot" title="구축 시점과 이후 규모" icon={HistoryOutlinedIcon}>
          <p className="openstack-build-copy">구축·관리의 시작은 2023.08입니다. 아래는 후속 확장 이후 기록한 규모입니다.</p>
          <Paper variant="outlined" className="openstack-build-snapshot">
            <p>확장 후 기록한 구성</p>
            <dl>
              <div><dt>Compute</dt><dd>11<span>대</span></dd></div>
              <div><dt>VM</dt><dd>102<span>대</span></dd></div>
            </dl>
          </Paper>
          <p className="openstack-build-note">이 수치는 최초 구축 규모와 구분한 시점 기록입니다. 초기 장비·스토리지 제약과 이후 확장 과정을 함께 정리했습니다.</p>
        </BuildSection>

        <BuildSection id="openstack-build-references" title="구성과 작업을 기록한 글" icon={MenuBookOutlinedIcon}>
          <ul className="openstack-build-references">
            {references.map((reference) => (
              <li key={reference.to}>
                <Link component={RouterLink} to={reference.to}>{reference.title}</Link>
                <p>{reference.description}</p>
              </li>
            ))}
          </ul>
        </BuildSection>
      </Box>
    </Box>
  );
}
