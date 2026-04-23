import React, { useState, useRef, useEffect } from 'react';
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
import { sendChatMessage } from '../api/api';

// URL을 감지하여 클릭 가능한 링크로 변환
const renderMessageWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <Link
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'var(--accent)',
            fontWeight: 500,
            textDecoration: 'underline',
            '&:hover': {
              color: 'var(--ink)',
            },
          }}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '안녕하세요! 포트폴리오에 대해 궁금한 점이 있으시면 물어보세요 😊',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: response.data.answer },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: '죄송합니다. 잠시 후 다시 시도해주세요.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 채팅 버튼 */}
      <Fab
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 60,
          height: 60,
          bgcolor: 'var(--ink) !important',
          boxShadow: 'var(--shadow-subtle) !important',
          color: 'var(--on-ink) !important',
          '&:hover': {
            bgcolor: 'var(--ink) !important',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {isOpen ? <CloseIcon sx={{ fontSize: 28 }} /> : <ChatIcon sx={{ fontSize: 28 }} />}
      </Fab>

      {/* 채팅창 */}
      <Fade in={isOpen}>
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 360 },
            maxWidth: 360,
            height: 480,
            zIndex: 9998,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-popover)',
          }}
        >
          {/* 헤더 */}
          <Box
            sx={{
              bgcolor: 'var(--bg-subtle)',
              color: 'var(--ink)',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <SmartToyIcon />
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              AI 챗봇
            </Typography>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'var(--ink-muted)' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 메시지 영역 */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'var(--bg-subtle)',
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
                      bgcolor: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 16, color: 'var(--on-ink)' }} />
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
                    bgcolor: msg.type === 'user' ? 'var(--ink)' : 'var(--bg-canvas)',
                    color: msg.type === 'user' ? 'var(--on-ink)' : 'inherit',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    border: msg.type === 'bot' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.type === 'bot' ? renderMessageWithLinks(msg.text) : msg.text}
                  </Typography>
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
                    bgcolor: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 16, color: 'var(--on-ink)' }} />
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '16px 16px 16px 4px',
                    bgcolor: 'var(--bg-canvas)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <CircularProgress size={16} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* 입력 영역 */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid var(--border)',
              bgcolor: 'var(--bg-canvas)',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              inputProps={{ maxLength: 50 }}
              helperText={input.length > 0 ? `${input.length}/50` : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'var(--bg-subtle)',
                },
                '& .MuiFormHelperText-root': {
                  textAlign: 'right',
                  mr: 0,
                  mt: 0.5,
                  fontSize: '0.7rem',
                  minHeight: '18px',
                  lineHeight: 1,
                  color: input.length >= 40 ? '#ef4444' : 'var(--ink-subtle)',
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
                bgcolor: 'var(--ink)',
                color: 'var(--on-ink)',
                '&:hover': {
                  bgcolor: 'var(--ink)',
                  opacity: 0.9,
                },
                '&:disabled': {
                  bgcolor: 'var(--border)',
                  color: 'var(--ink-disabled)',
                },
              }}
              aria-label="send"
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
