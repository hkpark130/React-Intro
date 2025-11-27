import React, { useState } from 'react';
import { login } from '../api/auth';
import { register } from '../api/api'; // 회원가입 API 추가
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress, Box,
  Typography, Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login({ open, onClose, redirectTo = null }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인 필드
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); // 회원가입 모드 상태
  const [successMessage, setSuccessMessage] = useState(''); // 성공 메시지
  const navigate = useNavigate();

  // 폼 초기화 함수
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  };

  // 모달이 닫힐 때 폼 초기화
  const handleClose = () => {
    resetForm();
    setIsRegisterMode(false);
    onClose();
  };

  // 로그인 처리
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
      handleClose();
      
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

  // 회원가입 처리
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!username || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 회원가입 API 호출 - 이메일 제외
      await register({
        username,
        password
      });
      
      // 회원가입 성공 후 로그인 모드로 전환
      setSuccessMessage('회원가입이 성공적으로 완료되었습니다. 로그인해주세요.');
      setIsRegisterMode(false);
      resetForm();
    } catch (err) {
      console.error('회원가입 실패:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 409) {
        setError('이미 존재하는 사용자명입니다.');
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 모드 전환 핸들러
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
  };

  return (
    <Dialog open={open} onClose={loading ? null : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {isRegisterMode ? '회원가입' : '로그인'}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        
        <Box component="form" id="login-form" onSubmit={isRegisterMode ? handleRegister : handleLogin} sx={{ mt: 1 }}>
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
          
          {isRegisterMode && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="비밀번호 확인"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          <Typography variant="body2">
            <Link 
              component="button"
              variant="body2"
              onClick={toggleMode}
              underline="hover"
            >
              {isRegisterMode ? '로그인' : '회원가입'}
            </Link>
          </Typography>
        </Box>
        <Box>
          <Button onClick={handleClose} disabled={loading} sx={{ mr: 1 }}>
            취소
          </Button>
          <Button 
            type="submit"
            form="login-form"
            variant="contained" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? (isRegisterMode ? '처리 중...' : '로그인 중...') : (isRegisterMode ? '회원가입' : '로그인')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
