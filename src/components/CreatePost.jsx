import React, { useState, useEffect } from 'react';
import { createPost, fetchCategories } from '../api/api';

import { useNavigate } from 'react-router-dom';
import PostComposer from './PostComposer';
import { postSaveErrorMessage } from './postSaveError';
import { usePostDraft } from './usePostDraft';

export default function CreatePost() {
  const [post, setPost] = useState({ title: '', content: '', categoryId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const baseline = { title: '', content: '', categoryId: post.categoryId };
  const { offer, acceptOffer, discardOffer, releaseDraft } = usePostDraft({ mode: 'create', post, baseline, ready: true });
  
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
      releaseDraft();
      navigate('/blog');
    } catch (err) {
      console.error('게시글 저장 실패', err);
      setError(postSaveErrorMessage(err, '게시글을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.'));
    } finally {
      setLoading(false);
    }
  };
  
  const restoreDraft = () => { setPost({ title: offer.title, content: offer.content, categoryId: offer.categoryId ?? post.categoryId }); acceptOffer(); };

  return <PostComposer mode="create" post={post} categories={categories} error={error} loading={loading}
    onChange={handleChange} onContentChange={handleContentChange} onSubmit={handleSubmit}
    onCancel={() => navigate('/blog')} returnTo="/blog"
    draftOffer={offer} onRestoreDraft={restoreDraft} onDiscardDraft={discardOffer} />;
}
