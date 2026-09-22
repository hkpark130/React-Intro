import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Container } from '@mui/material';
import { fetchPost, updatePost, fetchCategories } from '../api/api';
import PostComposer from './PostComposer';
import { postSaveErrorMessage } from './postSaveError';
import { usePostDraft } from './usePostDraft';

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
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(null);
  // 불러온 서버 내용이 기준선이다. 이것과 같으면 남길 초안이 없다.
  const [baseline, setBaseline] = useState(null);
  const { offer, acceptOffer, discardOffer, releaseDraft } = usePostDraft({ mode: 'edit', id, post, baseline, ready: Boolean(baseline) });
  
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
        setExpectedUpdatedAt(postData.updatedAt || null);
        
        // 현재 게시글의 카테고리 ID 찾기
        const categoryObj = categoriesResponse.data.find(cat => cat.name === postData.category);
        const categoryId = categoryObj ? categoryObj.id : null;
        
        // 게시글 정보 세팅 (카테고리 ID 포함)
        const loaded = {
          title: postData.title || '',
          content: postData.content || '',
          categoryId: categoryId // 카테고리 ID 설정
        };
        setPost(loaded);
        setBaseline(loaded);
        
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
      await updatePost(id, { ...post, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) });
      releaseDraft();
      
      // URL 쿼리 파라미터 유지하여 상세 페이지로 리다이렉트
      const queryParams = new URLSearchParams(location.search).toString();
      const redirectPath = queryParams ? `/blog/${id}?${queryParams}` : `/blog/${id}`;
      navigate(redirectPath);
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      setError(err.response?.status === 409
        ? '다른 창에서 이 글이 먼저 수정되었습니다. 현재 작성 내용은 유지했습니다. 내용을 복사해 둔 뒤 최신 글을 새로 불러와 변경 내용을 합쳐 주세요.'
        : postSaveErrorMessage(err, '게시글을 수정하는 중 오류가 발생했습니다. 다시 시도해주세요.'));
    } finally {
      setLoading(false);
    }
  };
  
  const restoreDraft = () => { setPost({ title: offer.title, content: offer.content, categoryId: offer.categoryId ?? post.categoryId }); acceptOffer(); };

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
  
  return <PostComposer mode="edit" post={post} categories={categories} error={error} loading={loading}
    onChange={handleChange} onContentChange={handleContentChange} onSubmit={handleSubmit}
    onCancel={handleCancel} draftOffer={offer} onRestoreDraft={restoreDraft} onDiscardDraft={discardOffer} returnTo={'/blog/' + id + location.search} />;
}
