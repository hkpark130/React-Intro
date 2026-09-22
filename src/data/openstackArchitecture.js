// Public aliases reconstructed from the saved 2026-09-11 configuration.
// No source machine IDs, unit IDs, hostnames, addresses, or internal paths belong here.

export const openstackRoles = [
  { id: 'compute', label: 'VM·스케줄링·이미지', description: 'Nova, Placement, Glance와 서비스별 DB 접점' },
  { id: 'network', label: 'Neutron·OVN', description: '네트워크 API, OVN 제어와 Compute·Octavia의 Chassis' },
  { id: 'storage', label: 'Ceph·볼륨·파일·오브젝트', description: 'Ceph, Cinder, Manila, Swift의 실제 배치' },
  { id: 'identity', label: '인증·비밀 관리', description: 'Keystone, Barbican, Vault' },
  { id: 'loadbalancer', label: 'LoadBalancer', description: 'Octavia와 관련 DB 접점' },
  { id: 'data', label: '공통 DB·메시징', description: 'MySQL InnoDB Cluster, RabbitMQ' },
  { id: 'dashboard', label: '웹 관리 화면', description: 'OpenStack Dashboard와 Manila·Octavia 확장' },
];

function principal(name, label, role, description, placements) {
  return {
    name,
    label,
    role,
    description,
    kind: 'principal',
    units: placements.map(([node, lxd], index) => ({
      id: `${name}-unit-${String(index + 1).padStart(2, '0')}`,
      label: `유닛 ${String(index + 1).padStart(2, '0')}`,
      node,
      container: lxd ? `${node}-LXD-${String(lxd).padStart(2, '0')}` : null,
      containerOrder: lxd || null,
      principal: null,
    })),
  };
}

const computeNodes = 'BCDEFGHIJKL'.split('');

const principalApplications = [
  principal('barbican', 'Barbican', 'identity', '키·인증서 등 비밀 관리 API', [['D', 5]]),
  principal('ceph-fs', 'Ceph FS', 'storage', 'CephFS 파일 서비스', [['C', 6]]),
  principal('ceph-mon', 'Ceph MON', 'storage', 'Ceph 클러스터 맵과 모니터', [['A', 4], ['B', 5], ['C', 5]]),
  principal('ceph-osd', 'Ceph OSD', 'storage', '데이터 저장을 담당하는 OSD 유닛', [['A'], ['B'], ['C'], ['D']]),
  principal('ceph-radosgw', 'RadosGW', 'storage', 'Ceph 오브젝트 API 게이트웨이', [['A', 5]]),
  principal('cinder', 'Cinder', 'storage', '블록 볼륨 관리 API', [['B', 4]]),
  principal('glance', 'Glance', 'compute', 'VM 이미지 관리', [['D', 4]]),
  principal('keystone', 'Keystone', 'identity', '인증·서비스 카탈로그', [['A', 3]]),
  principal('manila-ganesha', 'Manila-Ganesha', 'storage', '공유 파일 스토리지의 NFS 접점', [['B', 6]]),
  principal('manila', 'Manila', 'storage', '공유 파일 스토리지 관리 API', [['A', 6]]),
  principal('mysql-innodb-cluster', 'MySQL Cluster', 'data', 'OpenStack 서비스의 공통 DB', [['A', 1], ['B', 1], ['C', 1]]),
  principal('neutron-api', 'Neutron API', 'network', '가상 네트워크 관리 API', [['B', 3]]),
  principal('nova-cloud-controller', 'Nova Controller', 'compute', 'VM 제어·스케줄링 서비스', [['D', 2]]),
  principal('nova-compute', 'Compute', 'compute', '하이퍼바이저에서 VM 실행', computeNodes.map((node) => [node])),
  principal('octavia', 'Octavia', 'loadbalancer', 'LoadBalancer 관리 서비스', [['B']]),
  principal('openstack-dashboard', 'Dashboard', 'dashboard', 'OpenStack 웹 관리 화면', [['C', 4]]),
  principal('ovn-central', 'OVN Central', 'network', 'OVN 네트워크 제어 데이터베이스', [['A', 2], ['B', 2], ['C', 2]]),
  principal('placement', 'Placement', 'compute', '자원 인벤토리·할당 관리', [['D', 3]]),
  principal('rabbitmq-server', 'RabbitMQ', 'data', '서비스 사이의 메시징', [['C', 3]]),
  principal('swift-proxy', 'Swift proxy', 'storage', 'Swift 오브젝트 API 접점', [['D', 6]]),
  principal('swift-storage-zone1', 'Swift storage', 'storage', 'Swift 저장 유닛 — 공개 구역 1', [['A']]),
  principal('swift-storage-zone2', 'Swift storage', 'storage', 'Swift 저장 유닛 — 공개 구역 2', [['B']]),
  principal('swift-storage-zone3', 'Swift storage', 'storage', 'Swift 저장 유닛 — 공개 구역 3', [['C']]),
  principal('vault', 'Vault', 'identity', '비밀·TLS 관련 서비스', [['D', 1]]),
];

function subordinate(name, label, parentNames, description) {
  const parents = parentNames.map((name) => principalApplications.find((app) => app.name === name));
  const attached = parents.flatMap((app) => app.units.map((unit) => ({ app, unit })));
  return {
    name,
    label,
    role: parents[0].role,
    description,
    kind: 'subordinate',
    units: attached.map(({ app, unit }, index) => ({
      id: `${name}-unit-${String(index + 1).padStart(2, '0')}`,
      label: `유닛 ${String(index + 1).padStart(2, '0')}`,
      node: unit.node,
      container: unit.container,
      containerOrder: unit.containerOrder,
      principal: { app: app.name, unit: unit.id, label: `${app.label} ${unit.label}` },
    })),
  };
}

const mysqlRouterParents = [
  ['barbican-mysql-router', 'barbican'],
  ['cinder-mysql-router', 'cinder'],
  ['dashboard-mysql-router', 'openstack-dashboard'],
  ['glance-mysql-router', 'glance'],
  ['keystone-mysql-router', 'keystone'],
  ['manila-ganesha-mysql-router', 'manila-ganesha'],
  ['manila-mysql-router', 'manila'],
  ['ncc-mysql-router', 'nova-cloud-controller'],
  ['neutron-api-mysql-router', 'neutron-api'],
  ['octavia-mysql-router', 'octavia'],
  ['placement-mysql-router', 'placement'],
  ['vault-mysql-router', 'vault'],
];

const subordinateApplications = [
  ...mysqlRouterParents.map(([name, parent]) => subordinate(name, 'MySQL Router', [parent], '같은 머신의 서비스와 MySQL 사이의 DB 접점')),
  subordinate('barbican-vault', 'Barbican–Vault', ['barbican'], 'Barbican의 Vault 연동'),
  subordinate('cinder-ceph', 'Cinder–Ceph', ['cinder'], 'Cinder의 Ceph 백엔드 연동'),
  subordinate('neutron-api-plugin-ovn', 'Neutron OVN plugin', ['neutron-api'], 'Neutron API의 OVN 연동'),
  subordinate('manila-dashboard', 'Manila dashboard', ['openstack-dashboard'], 'Manila 웹 관리 확장'),
  subordinate('octavia-dashboard', 'Octavia dashboard', ['openstack-dashboard'], 'Octavia 웹 관리 확장'),
  {
    ...subordinate('ovn-chassis', 'OVN Chassis', ['nova-compute', 'octavia'], 'Compute·Octavia와 같은 머신에 배치되는 OVN 구성요소'),
    role: 'network',
  },
];

export const openstackApplications = [
  ...principalApplications,
  ...subordinateApplications,
  {
    name: 'octavia-diskimage-retrofit',
    label: 'Octavia diskimage retrofit',
    role: 'loadbalancer',
    description: '스냅샷에 application은 있으나 배치된 unit은 없음',
    kind: 'unplaced',
    units: [],
  },
];

export const openstackNodes = 'ABCDEFGHIJKL'.split('').map((id) => {
  const placements = principalApplications.flatMap((app) => app.units
    .filter((unit) => unit.node === id)
    .map((unit) => ({ ...unit, app: app.name, label: app.label, role: app.role, unitLabel: unit.label })));
  return {
    id,
    label: `노드 ${id}`,
    hasCompute: placements.some((unit) => unit.app === 'nova-compute'),
    direct: placements.filter((unit) => !unit.container),
    containers: placements.filter((unit) => unit.container).sort((a, b) => a.containerOrder - b.containerOrder),
  };
});

export const openstackSnapshot = {
  date: '2026-09-11',
  nodes: openstackNodes.length,
  lxdContainers: openstackNodes.reduce((sum, node) => sum + node.containers.length, 0),
  computeNodes: computeNodes.length,
  runningVms: 102,
  cephOsdUnits: 4,
  cephOsdDaemons: 15,
  ovnChassisUnits: 12,
  ovnChassisHosts: 11,
  applications: openstackApplications.length,
  applicationsWithUnits: openstackApplications.filter((app) => app.units.length).length,
  principalUnits: principalApplications.reduce((sum, app) => sum + app.units.length, 0),
  subordinateUnits: subordinateApplications.reduce((sum, app) => sum + app.units.length, 0),
  units: openstackApplications.reduce((sum, app) => sum + app.units.length, 0),
  mysqlRouterApplications: mysqlRouterParents.length,
  mysqlRouterUnits: subordinateApplications
    .filter((app) => mysqlRouterParents.some(([name]) => name === app.name))
    .reduce((sum, app) => sum + app.units.length, 0),
};

export const openstackArchitectureReferences = [
  { label: 'OpenStack 직접 구축', href: '/blog/54' },
  { label: 'MAAS·Juju 구축 중 해결한 문제', href: '/blog/56' },
  { label: 'Ceph 스토리지 구성', href: '/blog/93' },
];
