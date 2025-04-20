import React, { useState } from 'react';
import { createPost } from '../api/api';
import { 
  Typography, Container, Box, TextField, Button,
  Paper, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TitleSection from './section/TitleSection';

export default function CreatePost() {
  const [post, setPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prevPost => ({ ...prevPost, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!post.title.trim() || !post.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      await createPost(post);
      navigate('/blog');
    } catch (err) {
      console.error('게시글 저장 실패', err);
      setError('게시글을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <TitleSection 
        title="새 게시글 작성" 
        subtitle="블로그에 새 글을 작성합니다"
      />
      
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            name="title"
            label="제목"
            variant="outlined"
            fullWidth
            value={post.title}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          
          <TextField
            name="content"
            label="내용"
            variant="outlined"
            fullWidth
            multiline
            rows={15}
            value={post.content}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/blog')}
              disabled={loading}
            >
              취소
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? '저장 중...' : '게시하기'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
