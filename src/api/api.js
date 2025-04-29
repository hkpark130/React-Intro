import axios from 'axios';

// const API_BASE = 'http://backend-spring-app:8100';
const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // 비로그인 상태에서는 헤더 제거
      delete config.headers.Authorization;  
    }
    return config;
}, error => Promise.reject(error));

// 회원가입 함수 추가
export const register = async (userData) => {
  return await api.post('/users/register', userData);
};

// 게시글 목록 가져오기 함수 수정 (검색 기능, 카테고리 필터링 추가)
export const fetchPosts = async (offset = 0, limit = 10, searchTerm = '', categoryId = '') => {
  let url = `/posts?offset=${offset}&limit=${limit}`;
  
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  
  if (categoryId) {
    url += `&categoryId=${categoryId}`;
  }
  
  return await api.get(url);
};

export const fetchPost = id => api.get(`/posts/${id}`);
export const createPost = postData => api.post('/posts', postData);
export const deletePost = id => api.delete(`/posts/${id}`);

export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);
export const fetchComments = postId => api.get(`/posts/${postId}/comments`);
export const createComment = (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData);

export const updateGuestComment = async (postId, commentId, data) => {
  return await api.put(`/posts/${postId}/comments/${commentId}/guest`, data);
};

export const updateUserComment = async (postId, commentId, data) => {
  return await api.put(`/posts/${postId}/comments/${commentId}`, data);
};

export const deleteGuestComment = async (postId, commentId, data) => {
  return await api.delete(`/posts/${postId}/comments/${commentId}/guest`, {data: data});
};

export const deleteUserComment = async (postId, commentId) => {
  return await api.delete(`/posts/${postId}/comments/${commentId}`);
};

// 댓글 비밀번호 확인
export const verifyCommentPassword = async (postId, commentId, password) => {
  return await api.post(`/posts/${postId}/comments/${commentId}/verify`, {
    password
  });
};

export const fetchCategories = () => api.get('/categories');
export const createCategory = categoryData => api.post('/categories', categoryData);
export const deleteCategory = id => api.delete(`/categories/${id}`);
export const updateCategory = (id, categoryData) => api.put(`/categories/${id}`, categoryData);

export const notionConvert = (data) => api.post('/notion/convert', data);
