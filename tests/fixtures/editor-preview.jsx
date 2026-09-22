import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ScopedCssBaseline, ThemeProvider } from '@mui/material';
import PostComposer from '../../src/components/PostComposer';
import { blogTheme } from '../../src/blog/blogTheme';
import { serializeCustomBlock } from '../../src/components/markdown/editor/editorCommands';
import '../../src/blog/blog-scope.css';

const initialContent = [
  '## 작성기 검증용 초안',
  '이 화면은 로컬에서 서식과 입력을 확인하는 예제입니다. 실제 게시 요청은 보내지 않습니다.',
  '**선택한 문구**에 서식을 적용하고, 실행 취소로 되돌려 보세요.',
  '- 관찰한 내용\n- 확인한 결과\n- 남은 작업',
  serializeCustomBlock('alert', { severity: 'info', message: '안내 상자에서도 **강조**와 [링크](https://example.com)를 사용할 수 있습니다.' }),
  serializeCustomBlock('code', { title: '코드 예제', language: 'javascript', codeString: 'const message = "한글 입력";\nconsole.log(message);', defaultExpanded: true }),
].join('\n\n');

export default function EditorPreviewFixture() {
  const [post, setPost] = useState({ title: 'Markdown 작성과 미리보기', categoryId: 1, content: initialContent });
  return <ThemeProvider theme={blogTheme}><ScopedCssBaseline className="blog-application"><MemoryRouter>
    <PostComposer mode="create" post={post} categories={[{ id: 1, name: '로컬 검증' }]} loading={false} onChange={event => setPost(previous => ({ ...previous, [event.target.name]: event.target.value }))} onContentChange={content => setPost(previous => ({ ...previous, content }))} onSubmit={event => event.preventDefault()} onCancel={() => {}} returnTo="/blog" />
  </MemoryRouter></ScopedCssBaseline></ThemeProvider>;
}

document.documentElement.classList.add('blog-document');
document.body.classList.add('blog-document');
createRoot(document.getElementById('root')).render(<EditorPreviewFixture />);
