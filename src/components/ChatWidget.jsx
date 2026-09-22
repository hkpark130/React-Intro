import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Paper,
  IconButton,
  TextField,
  Typography,
  Fade,
  CircularProgress,
  Link,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { Link as RouterLink } from 'react-router-dom';
import { sendChatMessage } from '../api/api';
import { projectNavigation } from '../layout/projectNavigation';

const MAX_QUESTION = 500;
const MAX_MESSAGES = 40;
const PAGE_LINKS = new Map([
  ['/profile', '소개 페이지에서 자세히 보기'],
  ...projectNavigation.map(project => [project.path, `${project.title || project.label} 프로젝트 보기`]),
]);

function pageLinks(links) {
  if (!Array.isArray(links)) return [];
  return [...new Set(links.map(link => link?.url))]
    .filter(url => PAGE_LINKS.has(url)).slice(0, 3)
    .map(url => ({ url, title: PAGE_LINKS.get(url) }));
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '프로젝트나 궁금한 기술을 알려 주세요. 프로젝트 페이지와 관련 블로그 글을 안내합니다. 예: RAG 챗봇 링크 어딨어?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const input = inputRef.current;
    // 로그인 등 다른 모달이 가린 화면에서 답변 완료가 초점을 빼앗지 않게 한다.
    if (isOpen && !input?.closest('[aria-hidden="true"], [inert]')) input?.focus();
  }, [isOpen, isLoading]);

  useEffect(() => () => requestRef.current?.abort(), []);

  const closeChat = () => {
    setIsOpen(false);
    launcherRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || requestRef.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }].slice(-MAX_MESSAGES));
    setIsLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await sendChatMessage(userMessage, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (typeof response.data?.answer !== 'string') throw new Error('Invalid chat response');
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: response.data.answer, degraded: response.data.degraded,
          pageLinks: pageLinks(response.data.links),
          sources: (Array.isArray(response.data.sources) ? response.data.sources : [])
            .filter(source => Number.isSafeInteger(source.post_id) && source.post_id > 0 && typeof source.title === 'string').slice(0, 3) },
      ].slice(-MAX_MESSAGES));
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error.response?.status === 404
        ? '현재 연결된 환경에서는 챗봇을 사용할 수 없습니다.'
        : error.response?.status === 429
        ? '다른 질문을 처리 중입니다. 잠시 후 다시 시도해 주세요.'
        : error.code === 'ECONNABORTED'
        ? '응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'
        : '죄송합니다. 잠시 후 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: message },
      ].slice(-MAX_MESSAGES));
    } finally {
      requestRef.current = null;
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 채팅 버튼 */}
      <Fab
        ref={launcherRef}
        aria-label={isOpen ? 'AI 챗봇 닫기' : 'AI 챗봇 열기'}
        aria-expanded={isOpen}
        aria-controls="portfolio-chat"
        onClick={() => isOpen ? closeChat() : setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1100,
          width: 48,
          height: 48,
          bgcolor: 'primary.main',
          boxShadow: '0 3px 12px #192d2e24',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark',
            boxShadow: '0 3px 12px #192d2e24',
          },
        }}
      >
        {isOpen ? <CloseIcon sx={{ fontSize: 23 }} /> : <ChatIcon sx={{ fontSize: 23 }} />}
      </Fab>

      {/* 채팅창 */}
      <Fade in={isOpen}>
        <Paper
          id="portfolio-chat"
          role="dialog"
          aria-labelledby="portfolio-chat-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              closeChat();
            }
          }}
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: { xs: 'calc(100vw - 40px)', sm: 360 },
            maxWidth: 360,
            height: 'min(480px, calc(100dvh - 160px))',
            zIndex: 1101,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 48px #192d2e24',
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* 헤더 */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SmartToyIcon />
            <Typography id="portfolio-chat-title" variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              포트폴리오 챗봇
            </Typography>
            <IconButton
              size="small"
              onClick={closeChat}
              aria-label="AI 챗봇 닫기"
              sx={{ color: 'text.secondary', width: 40, height: 40 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 메시지 영역 */}
          <Box
            role="log"
            aria-live="polite"
            aria-busy={isLoading}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'background.default',
              minHeight: 0,
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 1,
                }}
              >
                {msg.type === 'bot' && (
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: '75%',
                    borderRadius: msg.type === 'user' 
                      ? '16px 16px 4px 16px' 
                      : '16px 16px 16px 4px',
                    bgcolor: msg.type === 'user' ? 'primary.main' : 'background.paper',
                    color: msg.type === 'user' ? 'white' : 'inherit',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.text}
                  </Typography>
                  {msg.sources?.length > 0 && <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                    {msg.sources.map(source => <Box component="li" key={source.post_id} sx={{ mt: 0.75 }}>
                      <Link component={RouterLink} to={`/blog/${source.post_id}`} onClick={closeChat} sx={{ fontSize: '0.875rem' }}>
                        {source.title}
                      </Link>
                    </Box>)}
                  </Box>}
                  {msg.pageLinks?.map(link => <Box key={link.url} sx={{ mt: 1 }}>
                    <Link component={RouterLink} to={link.url} onClick={closeChat} sx={{ fontSize: '0.875rem' }}>
                      {link.title}
                    </Link>
                  </Box>)}
                  {msg.degraded && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    의미 검색을 사용할 수 없어 입력한 키워드로 찾았습니다.
                  </Typography>}
                </Paper>
                {msg.type === 'user' && (
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                  </Box>
                )}
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 16, color: 'white' }} />
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '16px 16px 16px 4px',
                    bgcolor: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <CircularProgress size={16} aria-label="관련 글 검색과 답변 준비 중" />
                  <Typography variant="caption" sx={{ ml: 1 }}>관련 글을 찾아 답변을 준비하고 있습니다.</Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* 입력 영역 */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid #e0e0e0',
              bgcolor: 'white',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="찾고 싶은 글이나 문제 상황을 입력하세요"
              value={input}
              inputRef={inputRef}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              inputProps={{ maxLength: MAX_QUESTION, 'aria-label': '챗봇 메시지' }}
              helperText={input.length > 0 ? `${input.length}/${MAX_QUESTION}` : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f5f5f5',
                },
                '& .MuiFormHelperText-root': {
                  textAlign: 'right',
                  mr: 0,
                  mt: 0.5,
                  fontSize: '0.7rem',
                  minHeight: '18px',
                  lineHeight: 1,
                  color: input.length >= MAX_QUESTION - 50 ? '#f44336' : '#999',
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              sx={{
                width: 44,
                height: 44,
                minWidth: 'auto',
                p: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#999',
                },
              }}
              aria-label="메시지 전송"
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
