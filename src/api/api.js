import axios from 'axios';

const API_BASE = 'http://localhost:8100';

export const api = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

export const fetchPosts = (offset = 0, limit = 10) => {
    return api.get('/posts', { params: { offset, limit } });
};
  
export const fetchPost = id => api.get(`/posts/${id}`);
export const createPost = postData => api.post('/posts', postData);
export const deletePost = id => api.delete(`/posts/${id}`);

// export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);
// export const fetchComments = postId => api.get(`/posts/${postId}/comments`);
// export const createComment = (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData);
// export const deleteComment = (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`);
// export const updateComment = (postId, commentId, commentData) => api.put(`/posts/${postId}/comments/${commentId}`, commentData);
// export const fetchCategories = () => api.get('/categories');
// export const createCategory = categoryData => api.post('/categories', categoryData);
// export const deleteCategory = id => api.delete(`/categories/${id}`);
// export const updateCategory = (id, categoryData) => api.put(`/categories/${id}`, categoryData);


