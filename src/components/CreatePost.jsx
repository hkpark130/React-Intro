import React, { useState, useEffect } from 'react';
import { createPost, fetchCategories } from '../api/api';
import { 
  Typography, Container, Box, Button,
  Paper, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MarkdownEditor from './markdown/MarkdownEditor';

export default function CreatePost() {
  const [post, setPost] = useState({ title: '', content: '', categoryId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  
  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response.data || []);
        
        // 카테고리가 있으면 첫번째 카테고리를 기본값으로 설정
        if (response.data && response.data.length > 0) {
          setPost(prev => ({ ...prev, categoryId: response.data[0].id }));
        }
      } catch (error) {
        console.error('카테고리를 불러오는 중 오류 발생:', error);
        setError('카테고리 정보를 불러올 수 없습니다.');
      }
    };
    
    loadCategories();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prevPost => ({ ...prevPost, [name]: value }));
  };

  // 마크다운 에디터 콘텐츠 변경 핸들러
  const handleContentChange = (newContent) => {
    setPost(prev => ({ ...prev, content: newContent }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!post.title.trim() || !post.content.trim() || !post.categoryId) {
      setError('제목, 내용, 카테고리를 모두 입력해주세요.');
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
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              제목
            </Typography>
            <input
              type="text"
              name="title"
              value={post.title}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1.2rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none'
              }}
              required
              placeholder="제목을 입력하세요"
            />
          </Box>
          
          {/* 카테고리 선택 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              카테고리
            </Typography>
            <FormControl fullWidth required>
              <Select
                name="categoryId"
                value={post.categoryId}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>카테고리를 선택하세요</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* 마크다운 에디터 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              내용
            </Typography>
            <MarkdownEditor value={post.content} onChange={handleContentChange} />
          </Box>
          
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
