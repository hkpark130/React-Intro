import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Link, Tab, Tabs, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ZoomableImageModal from '../section/ZoomableImageModal';
import NeutronArchitecture from './NeutronArchitecture';
import {
  openstackApplications,
  openstackArchitectureReferences,
  openstackRoles,
  openstackSnapshot,
} from '../../data/openstackArchitecture';
import './openstack-architecture.css';

const diagramSource = '/architecture/openstack-deployment.svg';
const diagramDescription = '당시 실행한 OpenStack 구성. 공유 서비스·스토리지 노드 4대 안에 LXD가 각각 6개 있고 이 중 3대는 Compute를 겸했습니다. 추가 Compute 8대를 합한 Compute는 11대였으며 VM 102개를 실행했습니다. MAAS·Juju 관리 서비스의 호스트 수는 별도로 합산하지 않았습니다.';

const tabs = [
  { id: 'deployment', label: '노드·서비스 배치' },
  { id: 'network', label: 'Neutron 네트워크' },
  { id: 'units', label: 'Juju 유닛' },
];

function DeploymentDiagram() {
  return (
    <>
      <div className="os-architecture__deployment-intro">
        <Typography component="h3" className="os-architecture__subtitle">
          4대의 공유 노드와 추가 Compute 8대
        </Typography>
        <p>
          제어 서비스와 Ceph를 둔 4대 중 3대는 Compute도 함께 실행합니다.
          LXD와 Juju 유닛은 이 노드 안의 배치 단위입니다.
        </p>
      </div>

      <dl className="os-architecture__facts" aria-label="확장 후 기록한 구성 규모">
        <div><dt>상위 노드</dt><dd>{openstackSnapshot.nodes}<span>대</span></dd></div>
        <div><dt>Compute</dt><dd>{openstackSnapshot.computeNodes}<span>대</span></dd></div>
        <div><dt>내부 LXD</dt><dd>{openstackSnapshot.lxdContainers}<span>개</span></dd></div>
        <div><dt>실행 VM</dt><dd>{openstackSnapshot.runningVms}<span>대</span></dd></div>
      </dl>

      <figure className="os-architecture__figure">
        <div className="os-architecture__diagram-scroll" role="region" aria-label="OpenStack 배치 구성도" tabIndex={0}>
          <ZoomableImageModal
            imageSrc={diagramSource}
            altText={diagramDescription}
            sx={{ display: 'block', width: '100%', maxWidth: 'none', m: 0, border: 0, borderRadius: 0 }}
          />
        </div>
        <figcaption>
          실선 영역은 노드와 그 안의 서비스 배치, 점선 화살표는 관리 역할을 나타냅니다.
          노드·LXD 번호는 공개용 별칭입니다. 좁은 영역에서는 그림을 옆으로 이동하거나 확대할 수 있습니다.
        </figcaption>
      </figure>

      <div className="os-architecture__reading-notes">
        <div>
          <strong>OVN Chassis 12유닛은 11대에 배치</strong>
          <p>Compute에 11개, Octavia에 1개가 붙습니다. Octavia는 Compute가 있는 같은 노드에 배치되어 있습니다.</p>
        </div>
        <div>
          <strong>Ceph는 유닛 수와 데몬 수를 구분</strong>
          <p>4개 노드에 Ceph OSD 유닛이 하나씩 있고, 스냅샷의 OSD 데몬은 총 15개입니다.</p>
        </div>
      </div>
      <p className="os-architecture__scope-note">
        MAAS 클라우드의 OpenStack 모델 기준입니다. MAAS·Juju controller 관리 호스트의 위치와 수는 이 스냅샷에 포함되지 않습니다.
      </p>

    </>
  );
}

function ApplicationUnits({ app }) {
  return (
    <section className="os-architecture__application" aria-labelledby={`openstack-app-${app.name}`}>
      <div className="os-architecture__app-heading">
        <h4 id={`openstack-app-${app.name}`}>{app.name}</h4>
        <span className={`os-architecture__kind os-architecture__kind--${app.kind}`}>
          {app.kind === 'principal' ? 'principal' : app.kind === 'subordinate' ? 'subordinate' : '배치 없음'}
          {' · '}{app.units.length}유닛
        </span>
      </div>
      <p className="os-architecture__app-description">{app.description}</p>
      {app.units.length ? (
        <ul className="os-architecture__unit-list">
          {app.units.map((unit) => (
            <li key={unit.id}>
              <div className="os-architecture__unit-location">
                <span className="os-architecture__unit-alias">{unit.label}</span>
                <strong>노드 {unit.node}</strong>
                <span>{unit.container || '상위 머신에 직접 배치'}</span>
              </div>
              {unit.principal && <p>{unit.principal.label}와 같은 머신</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="os-architecture__empty-unit">기준일의 Scale은 0입니다. 실행 유닛과 노드 수에 포함하지 않았습니다.</p>
      )}
    </section>
  );
}

ApplicationUnits.propTypes = {
  app: PropTypes.shape({
    name: PropTypes.string.isRequired,
    kind: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    units: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      node: PropTypes.string.isRequired,
      container: PropTypes.string,
      principal: PropTypes.shape({ label: PropTypes.string.isRequired }),
    })).isRequired,
  }).isRequired,
};

function UnitInventory() {
  return (
    <div className="os-architecture__inventory">
      <Typography component="h3" className="os-architecture__subtitle">Juju에서 확인한 서비스와 배치</Typography>
      <p className="os-architecture__inventory-summary">
        application <strong>{openstackSnapshot.applications}개</strong> 중 {openstackSnapshot.applicationsWithUnits}개에
        {' '}unit이 있습니다. 고유 unit은 <strong>{openstackSnapshot.units}개</strong>로,
        {' '}principal {openstackSnapshot.principalUnits}개와 subordinate {openstackSnapshot.subordinateUnits}개입니다.
      </p>
      <div className="os-architecture__unit-explanation">
        <p><strong>principal</strong>은 직접 배치하는 서비스, <strong>subordinate</strong>는 principal과 같은 머신을 사용하는 보조 유닛입니다.</p>
        <p>아래 유닛·노드·LXD 번호는 공개용 별칭입니다. 같은 별칭은 같은 배치 위치를 가리키며 서버 수에 중복 합산하지 않습니다.</p>
      </div>
      <p className="os-architecture__router-count">서비스별 MySQL Router는 {openstackSnapshot.mysqlRouterApplications}앱·{openstackSnapshot.mysqlRouterUnits}유닛입니다.</p>

      <div className="os-architecture__role-list">
        {openstackRoles.map((role) => {
          const apps = openstackApplications.filter((app) => app.role === role.id);
          const unitCount = apps.reduce((sum, app) => sum + app.units.length, 0);
          return (
            <details className="os-architecture__role" key={role.id} open={role.id === 'compute'}>
              <summary>
                <span><strong>{role.label}</strong><span className="os-architecture__role-description">{role.description}</span></span>
                <span className="os-architecture__role-count">{apps.length}앱 · {unitCount}유닛</span>
              </summary>
              <div className="os-architecture__role-body">
                {apps.map((app) => <ApplicationUnits key={app.name} app={app} />)}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

export default function OpenStackArchitecture() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box component="section" className="os-architecture" aria-labelledby="openstack-architecture-title">
      <div className="os-architecture__heading">
        <Typography component="h2" id="openstack-architecture-title">구축한 환경의 실제 구성</Typography>
        <span className="os-architecture__date">확장 후 기록한 구성</span>
      </div>
      <p className="os-architecture__lead">노드 안의 서비스 배치, Neutron 통신 경로, Juju 유닛을 나누어 살펴볼 수 있습니다.</p>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="OpenStack 아키텍처 보기"
        className="os-architecture__tabs"
      >
        {tabs.map((tab) => (
          <Tab key={tab.id} id={`openstack-arch-tab-${tab.id}`} aria-controls={`openstack-arch-panel-${tab.id}`} label={tab.label} />
        ))}
      </Tabs>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          id={`openstack-arch-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`openstack-arch-tab-${tab.id}`}
          hidden={activeTab !== index}
          tabIndex={0}
          className="os-architecture__panel"
        >
          {activeTab === index && (
            index === 0 ? <DeploymentDiagram /> : index === 1 ? <NeutronArchitecture /> : <UnitInventory />
          )}
        </div>
      ))}

      <div className="os-architecture__references">
        <strong>구축 기록과 출처</strong>
        <div>
          {openstackArchitectureReferences.map((reference) => (
            <Link key={reference.href} component={RouterLink} to={reference.href}>{reference.label}</Link>
          ))}
        </div>
        <p>확장 후 기록한 수량이며, 초기 구축 기록의 수량과 구분했습니다.</p>
      </div>
    </Box>
  );
}
