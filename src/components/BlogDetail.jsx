import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, Container, Paper, Box, Button, Stack, Divider, 
  TextField, CircularProgress, Chip, Avatar, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Pagination, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  fetchPost, deletePost, updatePost, fetchComments, createComment, 
  updateGuestComment, updateUserComment, deleteGuestComment, deleteUserComment,
  fetchCategories
} from '../api/api';
import { isAuthenticated, getCurrentUser } from '../api/auth';
import Login from './Login';
import MarkdownRenderer from './markdown/MarkdownRenderer';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPost, setEditedPost] = useState({ title: '', content: '', categoryId: '' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // 카테고리 관련 상태
  const [categories, setCategories] = useState([]);
  
  // 댓글 상태 관리
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [commentToDeleteId, setCommentToDeleteId] = useState(null); 
  const [deletePassword, setDeletePassword] = useState('');
  
  // 댓글 페이지네이션을 위한 상태 변수
  const [commentPage, setCommentPage] = useState(1);
  const [commentsPerPage] = useState(5); // 페이지당 표시할 댓글 수
  
  // 현재 로그인한 사용자 정보
  const currentUser = getCurrentUser();
  
  // 인증 상태 확인 함수
  const isAuth = () => {
    return isAuthenticated();
  };

  useEffect(() => {
    loadPostDetails();
  }, [id]);
  
  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('카테고리를 불러오는 중 오류 발생:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  // 게시글 및 댓글 불러오기
  const loadPostDetails = async () => {
    try {
      setLoading(true);
      const postResponse = await fetchPost(id);
      setPost(postResponse.data);
      
      // 댓글 불러오기
      const commentsResponse = await fetchComments(id);
      const commentsData = commentsResponse.data.comments || [];
      
      setComments(commentsData);
      // 댓글 개수가 변경되었을 때 마지막 페이지로 이동 여부 결정
      const totalPages = Math.ceil(commentsData.length / commentsPerPage);
      if (commentPage > totalPages && totalPages > 0) {
        setCommentPage(totalPages);
      }
      setError(null);
    } catch (error) {
      console.error('게시글 또는 댓글을 불러오는 중 오류 발생:', error);
      setError('게시글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 게시글 삭제
  const handleDeletePost = async () => {
    try {
      setLoading(true);
      await deletePost(id);
      navigate('/blog');
    } catch (error) {
      console.error('게시글 삭제 중 오류 발생:', error);
      setError('게시글을 삭제할 수 없습니다.');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // 게시글 수정
  const handleUpdatePost = async () => {
    if (!editedPost.title || !editedPost.content) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await updatePost(id, editedPost);
      setPost(response.data);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('게시글 수정 중 오류 발생:', error);
      setError('게시글을 수정할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }
    
    try {
      let commentData = { content: newComment };
      
      // 비로그인 상태라면 게스트 댓글로 처리
      if (!isAuth()) {
        commentData = {
          ...commentData,
          guestName: guestName || '익명' // 이름이 없으면 '익명'으로 설정
        };
        
        // 비밀번호는 선택 사항 - 입력된 경우에만 추가
        if (commentPassword) {
          commentData.password = commentPassword;
        }
      }
      
      await createComment(id, commentData);
      setNewComment('');
      setGuestName('');
      setCommentPassword('');
      
      // 댓글을 다시 불러옵니다
      await loadPostDetails();
      
      // 새 댓글이 추가된 후 마지막 페이지로 이동
      const updatedComments = await fetchComments(id);
      const commentsData = updatedComments.data.comments || [];
      const totalPages = Math.ceil(commentsData.length / commentsPerPage);
      setCommentPage(totalPages);
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
      setError('댓글을 작성할 수 없습니다.');
    }
  };
  
  const handleEditClick = () => {
    // URL 쿼리 파라미터를 유지하면서 수정 페이지로 이동
    const queryParams = new URLSearchParams(location.search).toString();
    const editPath = queryParams ? `/blog/edit/${id}?${queryParams}` : `/blog/edit/${id}`;
    navigate(editPath);
  };
  
  // 목록으로 돌아가기
  const handleBackToList = () => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page') || '1';
    const searchParam = params.get('fromSearch') || params.get('search');
    const categoryIdParam = params.get('categoryId');
    
    const returnParams = new URLSearchParams();
    returnParams.set('page', pageParam);
    
    if (searchParam) {
      returnParams.set('search', searchParam);
    }
    
    // 카테고리 정보 유지
    if (categoryIdParam) {
      returnParams.set('categoryId', categoryIdParam);
    }
    
    navigate(`/blog?${returnParams.toString()}`);
  };
  
  // 댓글 수정 시작 함수
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentContent(comment.content);
    setEditPassword(''); // 비밀번호 초기화
  };

  // 게스트 댓글 수정 완료 함수
  const handleUpdateGuestComment = async (commentId) => {
    if (!editedCommentContent.trim()) return;
    
    try {
      // 관리자인 경우 isAdmin 플래그 추가
      const isAdmin = currentUser?.isAdmin || false;
      
      await updateGuestComment(id, commentId, { 
        content: editedCommentContent,
        password: editPassword,
        isAdmin: isAdmin
      });
      
      // 댓글 목록 다시 로드
      setEditingCommentId(null);
      setEditPassword('');
      await loadPostDetails();
    } catch (error) {
      console.error('게스트 댓글 수정 중 오류 발생:', error);
      setError('비밀번호가 일치하지 않거나 댓글을 수정할 수 없습니다.');
    }
  };
  
  // 로그인 사용자 댓글 수정 완료 함수
  const handleUpdateUserComment = async (commentId) => {
    if (!editedCommentContent.trim()) return;
    
    try {
      await updateUserComment(id, commentId, { 
        content: editedCommentContent
      });
      
      // 댓글 목록 다시 로드
      setEditingCommentId(null);
      await loadPostDetails();
    } catch (error) {
      console.error('댓글 수정 중 오류 발생:', error);
      setError('댓글을 수정할 수 없습니다.');
    }
  };

  // 댓글 삭제 시작 함수
  const handleDeleteClick = (comment) => {
    setCommentToDeleteId(comment.id);
    setDeletePassword('');
  };

  // 게스트 댓글 삭제 함수
  const handleDeleteGuestComment = async (commentId) => {
    try {
      // CommentRequestDto 형식으로 변경
      const isAdmin = currentUser?.isAdmin || false;
      
      await deleteGuestComment(id, commentId, {
        password: deletePassword,
        isAdmin: isAdmin
      });
      
      // 댓글 목록 다시 로드
      setCommentToDeleteId(null);
      setDeletePassword('');
      await loadPostDetails();
    } catch (error) {
      console.error('게스트 댓글 삭제 중 오류 발생:', error);
      setError('비밀번호가 일치하지 않거나 댓글을 삭제할 수 없습니다.');
    }
  };
  
  // 로그인 사용자 댓글 삭제 함수
  const handleDeleteUserComment = async (commentId) => {
    try {
      await deleteUserComment(id, commentId);
      
      // 댓글 목록 다시 로드
      setCommentToDeleteId(null);
      await loadPostDetails();
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
      setError('댓글을 삭제할 수 없습니다.');
    }
  };

  // 로딩 중 표시
  if (loading && !post) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // 에러 표시
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button variant="contained" onClick={loadPostDetails} sx={{ mt: 2 }}>다시 시도</Button>
        <Button variant="outlined" onClick={handleBackToList} sx={{ ml: 2, mt: 2 }}>목록으로</Button>
      </Container>
    );
  }
  
  // 게시글 없음
  if (!post) {
    return (
      <Container>
        <Typography>게시글이 존재하지 않습니다.</Typography>
        <Button variant="outlined" onClick={handleBackToList}>목록으로</Button>
      </Container>
    );
  }
  
  // 메인 렌더링
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackToList}
            variant="outlined"
          >
            목록으로
          </Button>
          
          {/* 관리자이거나 작성자인 경우 수정/삭제 버튼 표시 */}
          {currentUser && (currentUser.isAdmin || (post.author === currentUser.username)) && (
            <Stack direction="row" spacing={1}>
              <Button 
                startIcon={<EditIcon />} 
                variant="outlined" 
                color="primary"
                onClick={handleEditClick}
              >
                수정
              </Button>
              <Button 
                startIcon={<DeleteIcon />} 
                variant="outlined" 
                color="error"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                삭제
              </Button>
            </Stack>
          )}
        </Box>
        
        {/* 게시글 본문 */}
        <Paper
          elevation={3}
          sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}
        >
          <Typography variant="h4" gutterBottom>
            {post.title}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                avatar={<Avatar>{post.author?.substring(0, 1) || 'U'}</Avatar>}
                label={post.author || '익명'}
                variant="outlined"
              />
              {post.category && (
                <Chip
                  label={post.category}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* 마크다운으로 렌더링된 게시글 내용 */}
          <Box sx={{ 
            mb: 1,
            overflow: 'hidden',   // 내용이 넘치면 숨김
            width: '100%',        // 너비 100%
            '& img': {            // 이미지에 대한 스타일
              maxWidth: '100%',   // 이미지가 부모보다 크지 않도록
              height: 'auto'      // 이미지 비율 유지
            },
            '& pre, & code': {    // 코드 블록 스타일
              whiteSpace: 'pre-wrap', // 긴 코드 줄 바꿈
              wordBreak: 'break-word', // 단어 중간에서도 줄 바꿈 가능
              overflowX: 'auto'    // 가로 스크롤만 필요할 때 표시
            },
            '& table': {          // 표 스타일
              width: '100%',
              maxWidth: '100%',
              overflowX: 'auto',
              display: 'block'
            },
            '& *': {              // 모든 요소에 적용
              maxWidth: '100%',   // 최대 너비 제한
              boxSizing: 'border-box' // 패딩과 테두리를 너비에 포함
            },
            wordWrap: 'break-word',
          }}>
            <MarkdownRenderer content={post.content} />
          </Box>
        </Paper>
        
        {/* 댓글 섹션 */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            댓글 {comments.length}개
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {/* 댓글 작성 영역 */}
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 1, 
            bgcolor: '#f5f7fa' 
          }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              댓글 작성
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="댓글을 작성해주세요."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            {/* 비로그인 상태일 때 이름과 비밀번호 입력 필드 표시 */}
            {!isAuth() && (
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  label="이름"
                  placeholder="익명"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  type="password"
                  label="비밀번호"
                  placeholder="비밀번호"
                  value={commentPassword}
                  onChange={(e) => setCommentPassword(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}
            
            <Button 
              variant="contained" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              댓글 작성
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* 댓글 목록 부분 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              댓글 {comments.length}개
            </Typography>
            
            {comments.length > 0 ? (
              comments
                .slice((commentPage - 1) * commentsPerPage, commentPage * commentsPerPage) // 페이지네이션 적용
                .map((comment) => (
                  <Box key={comment.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                    {/* 댓글 헤더 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          size="small"
                          avatar={<Avatar sx={{ width: 24, height: 24 }}>{comment.author?.substring(0, 1) || 'U'}</Avatar>}
                          label={comment.author || '익명'}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      
                      {/* 댓글 수정/삭제 버튼 조건 */}
                      {(
                        comment.guest || // 게스트 댓글은 모든 사용자에게 수정/삭제 버튼 표시
                        (currentUser && (currentUser.username === comment.author || currentUser.isAdmin)) // 로그인 사용자의 댓글은 작성자와 관리자만 표시
                      ) && (
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditComment(comment)}
                            title={comment.guest ? "비밀번호 필요" : "댓글 수정"}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(comment)}
                            title={comment.guest ? "비밀번호 필요" : "댓글 삭제"}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    
                    {/* 댓글 수정 모드 */}
                    {editingCommentId === comment.id ? (
                      <Box sx={{ mt: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          size="small"
                          value={editedCommentContent}
                          onChange={(e) => setEditedCommentContent(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        
                        {/* 게스트 댓글인 경우 비밀번호 입력란 표시 (다이얼로그 없이 직접 입력) */}
                        {comment.guest && !currentUser?.isAdmin && (
                          <TextField
                            type="password"
                            label="비밀번호"
                            size="small"
                            fullWidth
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            sx={{ mb: 1 }}
                            placeholder="댓글 작성 시 입력한 비밀번호"
                          />
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditPassword('');
                            }}
                          >
                            취소
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained"
                            onClick={() => comment.guest 
                              ? handleUpdateGuestComment(comment.id) 
                              : handleUpdateUserComment(comment.id)
                            }
                          >
                            수정완료
                          </Button>
                        </Box>
                      </Box>
                    ) : commentToDeleteId === comment.id ? (
                      // 댓글 삭제 UI (다이얼로그 없이 인라인 표시)
                      <Box sx={{ mt: 1, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                        <Typography variant="body2" gutterBottom>
                          이 댓글을 정말 삭제하시겠습니까?
                        </Typography>
                        
                        {/* 게스트 댓글인 경우 비밀번호 입력란 표시 */}
                        {comment.guest && !currentUser?.isAdmin && (
                          <TextField
                            type="password"
                            label="비밀번호"
                            size="small"
                            fullWidth
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            sx={{ my: 1 }}
                            placeholder="댓글 작성 시 입력한 비밀번호"
                          />
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                          <Button 
                            size="small"
                            onClick={() => {
                              setCommentToDeleteId(null);
                              setDeletePassword('');
                            }}
                          >
                            취소
                          </Button>
                          <Button 
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => comment.guest 
                              ? handleDeleteGuestComment(comment.id) 
                              : handleDeleteUserComment(comment.id)
                            }
                          >
                            삭제
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      // 일반 댓글 내용 표시
                      <Typography variant="body2">{comment.content}</Typography>
                    )}
                  </Box>
                ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </Typography>
            )}
          </Box>
          
          {/* 페이지네이션 컴포넌트 */}
          {comments.length > commentsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={Math.ceil(comments.length / commentsPerPage)} 
                page={commentPage} 
                onChange={(event, value) => setCommentPage(value)} 
                color="primary"
                siblingCount={1}
                size="medium"
              />
            </Box>
          )}
        </Paper>
      </motion.div>
      
      {/* 게시글 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>게시글 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="제목"
            fullWidth
            variant="outlined"
            value={editedPost.title}
            onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="내용"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
            value={editedPost.content}
            onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={editedPost.category}
              onChange={(e) => setEditedPost({ ...editedPost, category: e.target.value })}
              label="카테고리"
            >
              {/* 카테고리 목록을 불러와서 선택할 수 있도록 합니다 */}
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>취소</Button>
          <Button onClick={handleUpdatePost} variant="contained" color="primary">수정하기</Button>
        </DialogActions>
      </Dialog>
      
      {/* 게시글 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>게시글 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 게시글을 정말 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeletePost} variant="contained" color="error">삭제</Button>
        </DialogActions>
      </Dialog>

      {/* 로그인 다이얼로그 */}
      <Login 
        open={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </Container>
  );
}