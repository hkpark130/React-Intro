import React, { useState } from 'react';
import { login } from '../api/auth';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login({ open, onClose, redirectTo = null }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username, password);
      onClose();
      
      // 로그인 후 리디렉션이 필요한 경우
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        // 현재 페이지 새로고침 (인증 상태 업데이트)
        window.location.reload();
      }
    } catch (err) {
      console.error('로그인 실패:', err);
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? null : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>로그인</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="아이디"
            name="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="비밀번호"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>취소</Button>
        <Button 
          onClick={handleLogin} 
          variant="contained" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? '로그인 중...' : '로그인'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
