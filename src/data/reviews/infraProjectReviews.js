export const infraProjectReviews = {
  "/openstack": {
    "reviewedOn": "2026-09-14",
    "summary": "서비스 장애에 대한 대비와 저장소 분리, Ceph 버전 경고를 보완할 필요가 있습니다.",
    "items": [
      {
        "id": "openstack-service-availability",
        "priority": "high",
        "title": "한 서비스의 장애가 전체 제어를 막지 않게 하기",
        "observation": "2026-09-11 구성에서 Keystone·Neutron API·Nova Cloud Controller·RabbitMQ는 각각 1유닛입니다. 여러 서비스가 같은 상위 머신에 함께 있습니다.",
        "impact": "일부 저장소가 정상이어도 인증이나 새 VM 생성이 멈출 수 있습니다.",
        "proposal": "영향이 큰 인증·메시징·컴퓨트 API부터 추가 유닛과 장비 분산을 검토할 필요가 있습니다.",
        "verification": "시험 환경에서 서비스와 상위 머신 장애를 나눠 기존 VM 통신·인증·VM 생성의 영향을 확인해야 합니다.",
        "references": [
          {
            "label": "구축 기록",
            "href": "/blog/54"
          },
          {
            "label": "OpenStack 서비스 HA 설계",
            "href": "https://docs.openstack.org/charm-guide/latest/admin/ha.html"
          }
        ]
      },
      {
        "id": "openstack-storage-failure-domains",
        "priority": "high",
        "title": "복제본이 같은 장비 장애에 함께 묶이지 않게 하기",
        "observation": "초기 구축에서는 디스크 부족을 NAS LUN으로 보완했고, Compute와 Ceph OSD를 함께 쓰는 노드도 있습니다.",
        "impact": "서로 다른 서버의 복제본도 같은 NAS나 전원에 의존하면 함께 영향을 받을 수 있습니다. VM과 스토리지 작업이 자원을 경쟁할 수도 있습니다.",
        "proposal": "OSD와 실제 디스크·NAS·전원 연결을 대조해 복제본을 나눌 필요가 있습니다. 겸용 노드의 자원 여유도 정할 부분입니다.",
        "verification": "시험 환경에서 장치 하나의 장애가 어느 복제본에 영향을 주는지와 VM·복제 작업의 동시 부하를 확인해야 합니다.",
        "references": [
          {
            "label": "초기 디스크 제약과 NAS 활용",
            "href": "/blog/56"
          },
          {
            "label": "Ceph 저장소 연동",
            "href": "/blog/93"
          },
          {
            "label": "Ceph CRUSH 장애 영역",
            "href": "https://docs.ceph.com/en/reef/rados/operations/crush-map/"
          }
        ]
      },
      {
        "id": "openstack-ceph-version-warning",
        "priority": "high",
        "title": "Ceph의 오래된 버전 경고 정리하기",
        "observation": "2026-09-11에는 OSD가 up/in이고 PG가 active+clean이지만, 오래된 데몬 버전으로 HEALTH_WARN이 표시됩니다.",
        "impact": "유닛의 active 표시만 보면 남아 있는 버전 경고를 놓칠 수 있습니다.",
        "proposal": "경고 대상의 실제 버전과 목표 버전을 대조하고, 순서대로 갱신할 절차를 준비할 필요가 있습니다.",
        "verification": "시험 환경에서 단계별 경고 해소, 복제 상태와 클라이언트 읽기·쓰기를 확인해야 합니다.",
        "references": [
          {
            "label": "Ceph 유닛과 저장소 설명",
            "href": "/blog/93"
          },
          {
            "label": "Ceph health check 설명",
            "href": "https://docs.ceph.com/en/reef/rados/operations/health-checks/#daemon-old-version"
          }
        ]
      }
    ]
  },
  "/kredis": {
    "reviewedOn": "2026-09-14",
    "summary": "접속 인증과 데이터 보존을 우선하고, 슬롯 이동 재시도와 복제본 배치를 보완할 필요가 있습니다.",
    "items": [
      {
        "id": "kredis-data-authentication",
        "priority": "high",
        "title": "Redis에 접속할 수 있는 주체 제한하기",
        "observation": "Redis 접속 인증이 없고, 상태 확인·관리 Job·exporter에 인증 정보를 전달하는 경로도 없습니다.",
        "impact": "클러스터 내부에 있다는 이유만으로 다른 프로그램의 접근을 막을 수는 없습니다.",
        "proposal": "Secret을 통한 인증과 통신 허용 범위를 정하고, 관리 작업과 상태 확인에도 같은 설정을 연결할 필요가 있습니다.",
        "verification": "인증 없는 접속은 막히고, 인증 정보 교체 뒤에도 상태 확인과 슬롯 이동이 동작하는지 확인해야 합니다.",
        "references": [
          {
            "label": "Redis 설정 소스",
            "href": "https://github.com/hkpark130/kredis-operator/blob/7ceee18e5fff5f8e6af59438a150924475c4f60c/docker/redis/redis.conf"
          },
          {
            "label": "Pod 생성 소스",
            "href": "https://github.com/hkpark130/kredis-operator/blob/7ceee18e5fff5f8e6af59438a150924475c4f60c/controllers/resource/pod.go"
          },
          {
            "label": "Redis 인증·ACL·TLS",
            "href": "https://redis.io/docs/latest/operate/oss_and_stack/management/security/"
          }
        ]
      },
      {
        "id": "kredis-finalizer-retention",
        "priority": "high",
        "title": "삭제 실패와 데이터 보존 처리하기",
        "observation": "리소스 정리에 실패해도 삭제 완료를 막는 finalizer를 제거하며, PVC도 삭제 대상으로 처리합니다.",
        "impact": "일부 리소스만 남거나 보존하려던 데이터까지 삭제될 수 있습니다.",
        "proposal": "PVC 보존 여부를 사용자가 정하게 하고, 정리에 실패하면 재시도하며 정리가 끝난 뒤 finalizer를 해제하도록 보완할 필요가 있습니다.",
        "verification": "삭제 권한 오류와 PVC 삭제 지연을 재현해 CR이 남아 재시도되고, 보존 대상 데이터가 유지되는지 확인해야 합니다.",
        "references": [
          {
            "label": "삭제·정리 경로",
            "href": "https://github.com/hkpark130/kredis-operator/blob/7ceee18e5fff5f8e6af59438a150924475c4f60c/controllers/kredis_controller.go"
          },
          {
            "label": "Kubernetes finalizer 동작",
            "href": "https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/"
          }
        ]
      },
      {
        "id": "kredis-job-retry-identity",
        "priority": "high",
        "title": "슬롯 이동 재시도가 겹치지 않게 하기",
        "observation": "Job의 실패 Pod 하나를 전체 실패로 판단하며, 작업을 요청한 CR 변경 버전도 구분하지 않습니다.",
        "impact": "재시도 중인 작업을 실패로 보거나 이전 작업 결과를 새 요청의 결과로 사용할 수 있습니다.",
        "proposal": "Job의 최종 상태와 실제 Redis 슬롯 상태를 확인한 뒤 재시도하고, 작업에 요청 버전을 연결할 필요가 있습니다.",
        "verification": "첫 실행 실패 후 재시도, 컨트롤러 재시작과 설정 변경에서 슬롯 이동이 중복되지 않고 키가 유지되는지 확인해야 합니다.",
        "references": [
          {
            "label": "Job 상태·이름 관리",
            "href": "https://github.com/hkpark130/kredis-operator/blob/7ceee18e5fff5f8e6af59438a150924475c4f60c/controllers/cluster/job.go"
          },
          {
            "label": "Job 재시도 설정",
            "href": "https://github.com/hkpark130/kredis-operator/blob/7ceee18e5fff5f8e6af59438a150924475c4f60c/controllers/resource/job.go"
          },
          {
            "label": "Kubernetes Job 종료 조건",
            "href": "https://kubernetes.io/docs/concepts/workloads/controllers/job/"
          }
        ]
      },
      {
        "id": "kredis-readiness-and-placement",
        "priority": "high",
        "title": "복제본 분산과 서비스 가능 상태 확인하기",
        "observation": "기동 시 PING 검사는 있지만 지속적인 readinessProbe와 master·replica의 노드 분산 설정은 없습니다.",
        "impact": "프로세스가 떠 있어도 슬롯이나 복제가 불완전할 수 있고, 한 노드 장애로 복제본까지 함께 멈출 수 있습니다.",
        "proposal": "초기 기동과 서비스 가능 상태를 나누어 검사하고, 같은 shard의 복제본을 다른 노드에 배치할 필요가 있습니다.",
        "verification": "시험 클러스터에서 슬롯 불완전·복제 단절·노드 장애를 재현해 Ready 표시와 실제 읽기·쓰기를 비교해야 합니다.",
        "references": [
          {
            "label": "Pod probe·배치 소스",
            "href": "https://github.com/hkpark130/kredis-operator/blob/7ceee18e5fff5f8e6af59438a150924475c4f60c/controllers/resource/pod.go"
          },
          {
            "label": "Kubernetes probe 역할",
            "href": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"
          }
        ]
      }
    ]
  },
  "/opensearch": {
    "reviewedOn": "2026-09-14",
    "summary": "인증·암호화, 자원 사용과 로그 보관 한도, 실제 수집 경로를 정리할 필요가 있습니다.",
    "items": [
      {
        "id": "opensearch-transport-auth",
        "priority": "high",
        "title": "검색과 수집에 인증·암호화 적용하기",
        "observation": "security 플러그인을 제거하고 HTTP로 연결하며, Packetbeat의 호스트 접근·수집 범위도 넓습니다.",
        "impact": "외부에서 접근할 수 있는 구성이라면 데이터를 읽거나 바꾸는 주체를 구분하기 어렵고, 필요 없는 정보까지 수집할 수 있습니다.",
        "proposal": "security 플러그인과 TLS를 사용하고 수집·조회 계정의 권한을 나눌 필요가 있습니다. 수집 권한과 저장 필드도 필요한 범위로 줄일 부분입니다.",
        "verification": "무인증·잘못된 인증서·권한 밖 요청을 거절하고, 민감한 필드가 저장되지 않는지 확인해야 합니다.",
        "references": [
          {
            "label": "보안 플러그인 제거 소스",
            "href": "https://github.com/hkpark130/opensearch/blob/3b19c2b7296099f02b33523ccbc29aea01923ec4/opensearch/Dockerfile"
          },
          {
            "label": "OpenSearch TLS 설정",
            "href": "https://docs.opensearch.org/latest/security/configuration/tls/"
          },
          {
            "label": "수집기 배치 설정",
            "href": "https://github.com/hkpark130/opensearch/blob/3b19c2b7296099f02b33523ccbc29aea01923ec4/docker-compose.yml"
          },
          {
            "label": "Packetbeat HTTP 필드 마스킹",
            "href": "https://www.elastic.co/docs/reference/beats/packetbeat/packetbeat-http-options"
          },
          {
            "label": "Packetbeat TLS 관찰 범위",
            "href": "https://www.elastic.co/docs/reference/beats/packetbeat/configuration-tls"
          }
        ]
      },
      {
        "id": "opensearch-memory-budget",
        "priority": "high",
        "title": "메모리와 로그 보관량에 한도 두기",
        "observation": "작은 EC2에서 자원 부족을 겪었으며, OpenSearch·Logstash의 컨테이너 메모리 상한과 인덱스 보관 정책이 없습니다.",
        "impact": "수집량이 늘면 메모리와 디스크가 부족해 수집·조회가 중단될 수 있습니다.",
        "proposal": "필요한 서비스의 전체 메모리 사용량을 측정해 한도를 정하고, 인덱스 보관 기간과 삭제 정책을 추가할 필요가 있습니다.",
        "verification": "시험 환경에서 수집·검색 부하와 보관 기간 경과를 재현해 메모리·디스크·수집 지연을 확인해야 합니다.",
        "references": [
          {
            "label": "컨테이너 자원 설정",
            "href": "https://github.com/hkpark130/opensearch/blob/3b19c2b7296099f02b33523ccbc29aea01923ec4/docker-compose.yml"
          },
          {
            "label": "OpenSearch 메모리 요구 사항",
            "href": "https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/"
          },
          {
            "label": "인덱스 템플릿 설정",
            "href": "https://github.com/hkpark130/opensearch/blob/3b19c2b7296099f02b33523ccbc29aea01923ec4/packetbeat/packetbeat.yml"
          },
          {
            "label": "OpenSearch ISM",
            "href": "https://docs.opensearch.org/latest/im-plugin/ism/index/"
          }
        ]
      },
      {
        "id": "opensearch-actual-ingestion-path",
        "priority": "medium",
        "title": "실제 수집 경로와 구성도 맞추기",
        "observation": "README는 Logstash 경유를 설명하지만, Packetbeat 설정은 OpenSearch로 직접 보냅니다.",
        "impact": "Logstash에서 필터를 바꿔도 실제 수집 데이터에는 적용되지 않을 수 있습니다.",
        "proposal": "직접 전송과 Logstash 경유 중 필요한 경로를 정하고 설정·구성도를 맞출 필요가 있습니다.",
        "verification": "표시를 넣은 시험 요청이 정한 경로로 들어오고 필터가 적용되는지 확인해야 합니다.",
        "references": [
          {
            "label": "Packetbeat 출력 설정",
            "href": "https://github.com/hkpark130/opensearch/blob/3b19c2b7296099f02b33523ccbc29aea01923ec4/packetbeat/packetbeat.yml"
          },
          {
            "label": "Logstash 파이프라인",
            "href": "https://github.com/hkpark130/opensearch/blob/3b19c2b7296099f02b33523ccbc29aea01923ec4/logstash/pipeline/logstash.conf"
          },
          {
            "label": "OpenSearch 클라이언트 호환성",
            "href": "https://docs.opensearch.org/latest/tools/"
          }
        ]
      }
    ]
  },
  "/terraform": {
    "reviewedOn": "2026-09-14",
    "summary": "상태 충돌 방지, 검토한 계획의 적용, 배포 권한 제한이 핵심 과제입니다.",
    "items": [
      {
        "id": "terraform-state-locking",
        "priority": "high",
        "title": "같은 상태를 동시에 바꾸지 않게 하기",
        "observation": "S3에 상태를 저장하지만 잠금 설정과 같은 상태를 쓰는 CI 실행의 순서 제어가 없습니다.",
        "impact": "두 실행이 겹치면 리소스 변경과 상태 기록이 충돌할 수 있습니다.",
        "proposal": "잠금을 지원하는 Terraform 버전을 정하고, 상태 파일별 잠금과 CI 실행 순서 제어를 추가할 필요가 있습니다.",
        "verification": "시험용 상태에 두 실행을 겹쳐 두 번째가 기다리고 종료 후 잠금이 풀리는지 확인해야 합니다.",
        "references": [
          {
            "label": "S3 backend 선언",
            "href": "https://github.com/hkpark130/terraform/blob/444bc05d7aa0f8c7b0dcaf0dcaea4ad60b8e1410/terraform/common/dev/services/_aws.tf"
          },
          {
            "label": "S3 state locking",
            "href": "https://developer.hashicorp.com/terraform/language/backend/s3"
          }
        ]
      },
      {
        "id": "terraform-plan-apply-provenance",
        "priority": "high",
        "title": "검토한 계획만 적용하고 실패를 드러내기",
        "observation": "PR과 적용 작업이 다른 계획을 만들며, 적용 단계에는 실패를 허용하는 설정이 있습니다. 서비스 배포 대상도 같은 EC2를 공유합니다.",
        "impact": "검토와 다른 변경이 적용되거나 적용 실패를 놓칠 수 있고, 공용 호스트 변경은 다른 서비스에도 영향을 줍니다.",
        "proposal": "검토한 커밋·계획 파일을 적용 단계에 연결하고 실패를 작업 결과에 반영할 필요가 있습니다. 공용 호스트·네트워크의 삭제와 교체도 계획 검토에서 막아야 합니다.",
        "verification": "시험용 계획에 다른 커밋·적용 실패·공용 호스트 교체를 넣어 잘못된 적용이 차단되는지 확인해야 합니다.",
        "references": [
          {
            "label": "PR 계획 workflow",
            "href": "https://github.com/hkpark130/terraform/blob/444bc05d7aa0f8c7b0dcaf0dcaea4ad60b8e1410/.github/workflows/common-dev-plan.yml"
          },
          {
            "label": "적용 workflow",
            "href": "https://github.com/hkpark130/terraform/blob/444bc05d7aa0f8c7b0dcaf0dcaea4ad60b8e1410/.github/workflows/common-dev-apply.yml"
          },
          {
            "label": "Terraform 자동화와 계획 전달",
            "href": "https://developer.hashicorp.com/terraform/tutorials/automation/automate-terraform"
          },
          {
            "label": "공통 EC2·네트워크 선언",
            "href": "https://github.com/hkpark130/terraform/blob/444bc05d7aa0f8c7b0dcaf0dcaea4ad60b8e1410/terraform/common/dev/services/ec2.tf"
          },
          {
            "label": "서비스 배포 대상",
            "href": "https://github.com/hkpark130/terraform/blob/444bc05d7aa0f8c7b0dcaf0dcaea4ad60b8e1410/terraform/react-intro/modules/services/codedeploy.tf"
          }
        ]
      },
      {
        "id": "terraform-ci-identity",
        "priority": "high",
        "title": "배포용 AWS 키의 수명과 권한 줄이기",
        "observation": "CI는 GitHub Secrets의 고정 AWS 키를 사용하며, 계획과 적용의 역할을 나누지 않습니다.",
        "impact": "키를 오래 사용할수록 유출 시 회수 부담이 커지고, 계획 조회에도 변경 권한을 줄 수 있습니다.",
        "proposal": "GitHub OIDC로 짧게 유효한 자격을 발급받고, 계획용·적용용 권한을 분리할 필요가 있습니다.",
        "verification": "시험 계정에서 다른 저장소의 인증과 계획 역할의 변경 요청이 거절되는지 확인해야 합니다.",
        "references": [
          {
            "label": "CI 자격 구성",
            "href": "https://github.com/hkpark130/terraform/blob/444bc05d7aa0f8c7b0dcaf0dcaea4ad60b8e1410/.github/workflows/common-dev-plan.yml"
          },
          {
            "label": "GitHub Actions의 AWS OIDC",
            "href": "https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws"
          }
        ]
      }
    ]
  },
  "/redmine": {
    "reviewedOn": "2026-09-14",
    "summary": "다시 사용할 때는 작은 서버의 메모리 안에서 유지할 수 있는지 먼저 확인할 필요가 있습니다.",
    "items": [
      {
        "id": "redmine-runtime-budget",
        "priority": "medium",
        "title": "다시 사용할 때 메모리부터 확인하기",
        "observation": "EC2의 메모리 제약으로 Redmine 사용을 중단했습니다.",
        "impact": "같은 구성으로 다시 띄우면 자원 부족이 반복될 수 있습니다.",
        "proposal": "앱·웹 서버·DB의 전체 메모리를 측정해 재사용 여부를 정할 필요가 있습니다. 사용 빈도가 낮다면 읽기용 기록 보존도 대안입니다.",
        "verification": "별도 시험 환경에서 로그인·이슈 조회·검색을 반복하며 메모리와 응답 시간을 확인해야 합니다.",
        "references": [
          {
            "label": "기존 사용·중단 기록",
            "href": "https://github.com/hkpark130/React-Intro/blob/a6a472118ee15b937c140d8f25c0d3d7de80703f/src/components/Redmine.jsx"
          },
          {
            "label": "Redmine 실행 환경 요구 사항",
            "href": "https://www.redmine.org/projects/redmine/wiki/RedmineInstall"
          }
        ]
      }
    ]
  }
};
