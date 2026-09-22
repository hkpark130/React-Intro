export const editorTools = [
  { id: 'paragraph', label: '본문', group: '서식', icon: 'paragraph', description: '제목을 일반 문단으로 바꾸기', keywords: 'paragraph text' },
  { id: 'heading2', label: '큰 제목', group: '서식', icon: 'heading2', description: '본문의 큰 단락을 나누는 제목', keywords: 'h2 heading 제목 2' },
  { id: 'heading3', label: '중간 제목', group: '서식', icon: 'heading3', description: '단락 안의 소제목', keywords: 'h3 heading 제목 3' },
  { id: 'heading4', label: '작은 제목', group: '서식', icon: 'heading4', description: '더 세부적인 내용을 묶는 제목', keywords: 'h4 heading 제목 4' },
  { id: 'bold', label: '굵게', group: '서식', icon: 'bold', description: '선택한 문구를 굵게 강조', shortcut: 'Ctrl/⌘ + B', keywords: 'bold' },
  { id: 'italic', label: '기울임', group: '서식', icon: 'italic', description: '선택한 문구를 기울이기', shortcut: 'Ctrl/⌘ + I', keywords: 'italic' },
  { id: 'strikethrough', label: '취소선', group: '서식', icon: 'strikethrough', description: '선택한 문구에 취소선 표시', keywords: 'strike delete 삭제' },
  { id: 'inlineCode', label: '인라인 코드', group: '서식', icon: 'inlineCode', description: '문장 안의 명령어나 변수 표시', keywords: 'inline code' },
  { id: 'color', label: '색상', group: '서식', icon: 'color', description: '선택한 문구의 글자색과 배경색', keywords: 'color text background highlight 글자색 배경색 형광펜' },
  { id: 'unorderedList', label: '목록', group: '문단', icon: 'unorderedList', description: '글머리 기호가 있는 목록', keywords: 'bullet list' },
  { id: 'orderedList', label: '번호 목록', group: '문단', icon: 'orderedList', description: '작업 순서를 번호로 표현', keywords: 'number ordered list' },
  { id: 'taskList', label: '체크리스트', group: '문단', icon: 'taskList', description: '완료 여부를 표시하는 할 일 목록', keywords: 'todo task checkbox 할일' },
  { id: 'quote', label: '인용', group: '문단', icon: 'quote', description: '인용한 문장을 구분해서 표시', keywords: 'quote' },
  { id: 'divider', label: '구분선', group: '문단', icon: 'divider', description: '문단 사이에 가로 구분선 삽입', keywords: 'divider horizontal rule' },
  { id: 'fence', label: '코드 블록', group: '삽입', icon: 'fence', description: '언어를 지정한 일반 코드 블록', keywords: 'code fence 코드' },
  { id: 'code', label: '접는 코드', group: '삽입', icon: 'code', description: '제목·줄 번호가 있는 접이식 코드', keywords: 'code accordion 코드' },
  { id: 'image', label: '확대 이미지', group: '삽입', icon: 'image', description: '확대해서 볼 수 있는 이미지와 캡션', keywords: 'image zoom 사진 그림' },
  { id: 'table', label: '표', group: '삽입', icon: 'table', description: '행과 열 수를 정해 표 삽입', keywords: 'table' },
  { id: 'link', label: '링크', group: '삽입', icon: 'link', description: '선택한 문구에 주소 연결', shortcut: 'Ctrl/⌘ + K', keywords: 'link url' },
  { id: 'bookmark', label: '링크 카드', group: '삽입', icon: 'bookmark', description: '참고 링크를 제목·설명과 함께 표시', keywords: 'bookmark 북마크' },
  { id: 'alert', label: '안내 상자', group: '삽입', icon: 'alert', description: '안내·완료·주의·오류 메시지', keywords: 'callout alert 콜아웃 알림' },
  { id: 'edit', label: '블록 수정', group: '관리', icon: 'edit', description: '커서가 있는 커스텀 블록 수정', keywords: 'edit 수정' },
  { id: 'notion', label: 'Notion', group: '관리', icon: 'notion', description: 'Notion 페이지·데이터베이스에서 가져오기', keywords: 'import 노션' },
];

export function filterEditorTools(query) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return editorTools.filter(tool => terms.every(term => `${tool.label} ${tool.description} ${tool.keywords}`.toLocaleLowerCase().includes(term)));
}
