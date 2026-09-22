import { Link } from 'react-router-dom';
import ZoomableImageModal from '../section/ZoomableImageModal';
import './neutron-architecture.css';

const diagrams = [
  {
    id: 'north-south',
    title: '외부 통신: OVN에서 물리 uplink까지',
    src: '/architecture/openstack-neutron.svg',
    height: 1448,
    alt: '점선으로 표시한 Neutron과 OVN 제어 관계, 실선으로 표시한 tenant 논리망과 gateway chassis를 거치는 외부 경로. 아래 물리 경로는 Compute br-int, Geneve, 기존 chassis의 gateway 역할, br-ex, bond, 물리 스위치와 상위 라우터로 이어집니다.',
    caption: '2026년 3월 경로 분석과 7월 개별 Floating IP 조사에서 확인한 중앙집중형 외부 경로입니다. gateway는 기존 chassis가 맡는 역할이며, 물리 장비 박스는 연결 역할을 나타냅니다.',
  },
  {
    id: 'east-west',
    title: 'VM 간 통신: 같은 호스트와 다른 호스트',
    src: '/architecture/openstack-neutron-east-west.svg',
    height: 910,
    alt: '같은 서브넷의 VM은 같은 호스트에서 tap과 br-int로 통신하고, 다른 호스트에서는 양쪽 br-int 사이의 Geneve 터널로 통신합니다.',
    caption: '같은 서브넷은 L2로 전달합니다. 다른 서브넷의 내부 통신은 Logical Router의 분산 라우팅을 거치며, 외부 통신용 gateway를 일괄 경유하지 않습니다.',
  },
];

export default function NeutronArchitecture() {
  return (
    <div className="neutron-architecture">
      <h3 className="neutron-architecture-title">가상 네트워크를 물리망에 연결한 구조</h3>
      <p className="neutron-architecture-intro">
        MAAS에서 Open vSwitch 브리지와 bond uplink를 준비하고, Juju로 Neutron과 OVN을 배치했습니다.
        내부망은 Geneve로 연결하고, 외부망은 provider 브리지를 통해 물리 네트워크와 연결했습니다.
      </p>
      <p className="neutron-architecture-snapshot">
        당시 네트워크 구성
        <span>Geneve 내부망 10개 · Flat 외부망 1개</span>
      </p>
      <ul className="neutron-architecture-legend" aria-label="구성도 범례">
        <li><span className="neutron-legend-line neutron-legend-control" aria-hidden="true" />설정·제어</li>
        <li><span className="neutron-legend-line neutron-legend-packet" aria-hidden="true" />패킷 전달</li>
        <li><span className="neutron-legend-host" aria-hidden="true" />호스트·역할 경계</li>
      </ul>
      <p className="neutron-architecture-scroll-hint">그림을 누르면 확대됩니다. 좁은 화면에서는 그림을 좌우로 이동할 수 있습니다.</p>

      {diagrams.map(diagram => (
        <figure className="neutron-diagram" key={diagram.id} aria-labelledby={`${diagram.id}-heading`}>
          <div className="neutron-diagram-heading">
            <h4 id={`${diagram.id}-heading`}>{diagram.title}</h4>
          </div>
          <div className="neutron-diagram-scroll" role="region" aria-label={`${diagram.title} 그림 영역, 가로 스크롤 가능`} tabIndex={0}>
            <ZoomableImageModal
              imageSrc={diagram.src}
              altText={diagram.alt}
              sx={{ display: 'block', width: '100%', maxWidth: 'none', m: 0, border: 0, borderRadius: 0 }}
            />
          </div>
          <figcaption>{diagram.caption}</figcaption>
        </figure>
      ))}

      <div className="neutron-architecture-reading">
        <h4>구성에서 확인한 선택</h4>
        <dl>
          <div>
            <dt>br-int와 br-ex</dt>
            <dd>VM의 tap은 br-int에 연결됩니다. 외부 provider망은 physnet 매핑과 patch 쌍을 통해 br-ex에 연결되고, bond uplink로 물리망에 닿습니다.</dd>
          </div>
          <div>
            <dt>Floating IP와 SNAT</dt>
            <dd>조사한 Floating IP는 gateway chassis를 거치는 중앙집중형입니다. 외부 송신의 SNAT와 Floating IP 수신의 DNAT를 논리 라우터 정책으로 처리합니다. External은 Neutron의 망 역할이며, Floating IP가 반드시 인터넷 공인 주소인 것은 아닙니다.</dd>
          </div>
          <div>
            <dt>시점과 물리 장비</dt>
            <dd>목록 수치는 9월 11일, bridge·bond와 개별 gateway 경로는 3월·7월 기록입니다. 물리 장비는 역할 단위로 단순화했으며 스위치 대수·LAG·HA의 현행 상태는 미확인입니다.</dd>
          </div>
        </dl>
      </div>

      <div className="neutron-architecture-sources">
        <span>구축·분석 기록</span>
        <Link to="/blog/56">MAAS·Juju 구축</Link>
        <Link to="/blog/108">OVN 통신 경로</Link>
        <Link to="/blog/111">물리망 장애 분석</Link>
        <a href="https://docs.openstack.org/neutron/2023.2/admin/ovn/routing.html" target="_blank" rel="noopener noreferrer">공식 Neutron Routing</a>
        <a href="https://www.ovn.org/support/dist-docs/ovn-architecture.7.html" target="_blank" rel="noopener noreferrer">공식 OVN 구조</a>
      </div>

    </div>
  );
}
