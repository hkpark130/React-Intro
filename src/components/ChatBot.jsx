import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import TitleSection from '@/components/section/TitleSection';
import CommonSection from '@/components/section/CommonSection';
import TechStack from '@/components/section/TechStack';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import RagVectorDemo from '@/components/rag/RagVectorDemo';

const techStacks = [
  { category: '화면·검색 서버', labels: [{ label: 'React' }, { label: 'Python' }] },
  { category: '검색 자료 저장', labels: [{ label: 'SQLite' }] },
  { category: '모델 실행', labels: [{ label: 'Ollama' }, { label: 'embeddinggemma:300m' }, { label: 'qwen2.5:0.5b' }] },
];

const measurements = [
  ['검색', '약 0.16초', '임베딩 모델을 메모리에 올린 뒤 호출'],
  ['검색 + 설명 생성', '약 4.2초', '두 모델이 메모리에 올라온 상태의 호출'],
  ['시스템 메모리', '사용 1,493 MiB', 'available 473 MiB · swap 사용 28 MiB'],
];

export default function ChatBot() {
  return (
    <article className="project-document project-document--chat-bot">
      <div className="project-section-slot">
        <TitleSection
          title="RAG 챗봇"
          subtitle="블로그 검색을 연결하고, 2GB 서버에서 실행해 본 챗봇"
          description="React 채팅 화면에 Python 검색 서버와 Ollama를 연결했습니다. 질문에 맞는 블로그 글을 찾아 링크와 본문 일부를 안내합니다."
        />
      </div>
      <div className="project-section-slot"><TechStack techStacks={techStacks} /></div>
      <div className="project-section-slot">
        <CommonSection title="무엇을 연결했나" body={(
          <>
            <Typography component="p">
              “오픈스택 SSH가 느린 문제”처럼 제목을 정확히 몰라도 관련 글을 찾는 것이 목적입니다.
              Ollama가 글과 질문을 비교할 수 있는 숫자 데이터인 임베딩을 만들고, SQLite가 글과 임베딩을 보관합니다.
            </Typography>
            <Typography component="p">
              Python 서버는 키워드와 의미를 함께 비교해 최대 3개 글을 고릅니다.
              React 채팅 화면에서는 글 링크와 본문 일부를 보여줍니다.
              본문을 고르는 소형 모델을 함께 사용할 수 있으며, 서버가 실제 본문에 있는 문구인지 확인해 응답합니다.
            </Typography>
          </>
        )} />
      </div>
      <div className="project-section-slot">
        <CommonSection title="자료 준비와 질문 처리" body={(
          <>
            <ZoomableImageModal
              imageSrc="/architecture/rag-chatbot.svg"
              altText="블로그 본문을 prepare_portfolio.py로 정리해 corpus.json을 만들고, build_index.py가 Ollama 임베딩을 SQLite에 저장한다. 질문이 들어오면 Python이 키워드와 의미로 글을 찾고 React에 출처를 안내한다."
              caption="위쪽은 블로그를 검색 자료로 준비하는 과정, 아래쪽은 질문이 들어왔을 때의 흐름입니다. 벡터는 Ollama가 만들고, SQLite가 저장하며, 검색 계산은 Python이 맡습니다."
            />
            <Typography component="p">
              <code>corpus.json</code>은 정리한 본문 조각과 글 정보를 담은 파일입니다.
              <code>build_index.py</code>가 Ollama로 임베딩을 만든 뒤 <code>blog.sqlite3</code>에 저장합니다.
              글을 수정하면 전체 색인을 다시 만들고 RAG 서버가 새 자료를 읽도록 재시작합니다.
              이 과정에서 모델을 재학습하지는 않습니다.
            </Typography>
          </>
        )} />
      </div>
      <div className="project-section-slot">
        <CommonSection title="벡터 유사도와 추천 예시" body={<RagVectorDemo />} />
      </div>
      <div className="project-section-slot">
        <CommonSection title="2GB OpenStack 인스턴스에서 실행" body={(
          <>
            <Typography component="p">
              2026년 9월 15일, 2 vCPU·RAM 2GB의 단독 OpenStack 테스트 인스턴스에서 검색과 모델 실행을 확인했습니다.
              Ubuntu 24.04의 CPU 실행 환경에 swap 2GB를 두고, 당시 108개 글·378개 조각으로 만든 색인을 사용했습니다.
            </Typography>
            <TableContainer className="project-table" tabIndex={0} role="region" aria-label="2GB OpenStack RAG 실험 결과" sx={{ my: 2 }}>
              <Table size="small" sx={{ minWidth: 580 }}>
                <TableHead>
                  <TableRow>
                    <TableCell scope="col">항목</TableCell>
                    <TableCell scope="col">측정값</TableCell>
                    <TableCell scope="col">조건</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {measurements.map(([label, value, condition]) => (
                    <TableRow key={label}>
                      <TableCell component="th" scope="row">{label}</TableCell>
                      <TableCell>{value}</TableCell>
                      <TableCell>{condition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography component="p">
              약 4.2초는 당시 짧은 설명을 생성한 호출의 측정값입니다.
              현재는 본문 발췌를 고르는 방식이므로 같은 응답 시간으로 해석하지 않습니다.
              다른 서비스와 함께 쓰는 2GB EC2에서도 같은 여유가 있다는 뜻은 아닙니다.
            </Typography>
          </>
        )} />
      </div>
    </article>
  );
}
