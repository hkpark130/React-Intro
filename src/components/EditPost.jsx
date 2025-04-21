import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Typography, Container, Box, Button,
  Paper, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { fetchPost, updatePost, fetchCategories } from '../api/api';
import TitleSection from './section/TitleSection';
import MarkdownEditor from './markdown/MarkdownEditor';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [post, setPost] = useState({ 
    title: '', 
    content: '', 
    categoryId: null // ID를 명시적으로 null로 초기화
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 카테고리 목록 로드 및 게시글 내용 가져오기
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        
        // 카테고리 목록 가져오기
        const categoriesResponse = await fetchCategories();
        setCategories(categoriesResponse.data || []);
        
        // 게시글 내용 가져오기
        const postResponse = await fetchPost(id);
        const postData = postResponse.data;
        
        // 현재 게시글의 카테고리 ID 찾기
        const categoryObj = categoriesResponse.data.find(cat => cat.name === postData.category);
        const categoryId = categoryObj ? categoryObj.id : null;
        
        // 게시글 정보 세팅 (카테고리 ID 포함)
        setPost({ 
          title: postData.title || '',
          content: postData.content || '',
          categoryId: categoryId // 카테고리 ID 설정
        });
        
        setError(null);
      } catch (err) {
        console.error('게시글 정보를 불러오는 중 오류 발생:', err);
        setError('게시글을 불러올 수 없습니다.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };
  
  // 콘텐츠 변경 핸들러 (마크다운 에디터용)
  const handleContentChange = (newContent) => {
    setPost(prev => ({ ...prev, content: newContent }));
  };
  
  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!post.title.trim() || !post.content.trim() || !post.categoryId) {
      setError('제목, 내용, 카테고리를 모두 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      await updatePost(id, post);
      
      // URL 쿼리 파라미터 유지하여 상세 페이지로 리다이렉트
      const queryParams = new URLSearchParams(location.search).toString();
      const redirectPath = queryParams ? `/blog/${id}?${queryParams}` : `/blog/${id}`;
      navigate(redirectPath);
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      setError('게시글을 수정하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  // 취소 핸들러
  const handleCancel = () => {
    // URL 쿼리 파라미터 유지하여 상세 페이지로 리다이렉트
    const queryParams = new URLSearchParams(location.search).toString();
    const redirectPath = queryParams ? `/blog/${id}?${queryParams}` : `/blog/${id}`;
    navigate(redirectPath);
  };
  
  if (initialLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }
  
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
                value={post.categoryId || ''}
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
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined"
              onClick={handleCancel}
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
              {loading ? '수정 중...' : '수정완료'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}