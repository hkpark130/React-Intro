import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, Container, Paper, Box, Button, Stack, Divider, 
  TextField, CircularProgress, Chip, Avatar, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchPost, deletePost, updatePost, fetchComments, createComment, updateComment, deleteComment, verifyCommentPassword } from '../api/api';
import { isAuthenticated, getCurrentUser } from '../api/auth';
import Login from './Login';

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
  const [editedPost, setEditedPost] = useState({ title: '', content: '' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');
  const [commentToDelete, setCommentToDelete] = useState(null);
  
  // 상태 변수 추가
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [editPasswordDialogOpen, setEditPasswordDialogOpen] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  
  // 현재 로그인한 사용자 정보 (실제 인증 상태에서 가져옴)
  const currentUser = getCurrentUser();
  console.log(currentUser, comments); // 확인용
  
  // 인증 상태 확인 함수
  const isAuth = () => {
    return isAuthenticated();
  };

  useEffect(() => {
    loadPostDetails();
  }, [id]);
  
  // loadPostDetails 함수 수정
const loadPostDetails = async () => {
  try {
    setLoading(true);
    const postResponse = await fetchPost(id);
    setPost(postResponse.data);
    
    // 댓글 불러오기
    const commentsResponse = await fetchComments(id);
    const commentsData = commentsResponse.data.comments || [];
    
    // 디버깅: 댓글 데이터 구조 확인
    console.log('댓글 데이터:', commentsData);
    
    setComments(commentsData);
    setError(null);
  } catch (error) {
    console.error('게시글 또는 댓글을 불러오는 중 오류 발생:', error);
    setError('게시글을 불러올 수 없습니다.');
  } finally {
    setLoading(false);
  }
};
  
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
  
  // handleAddComment 함수 수정
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
      // 비밀번호가 없어도 게스트 댓글 작성 가능
    }
    
    await createComment(id, commentData);
    setNewComment('');
    setGuestName('');
    setCommentPassword('');
    
    // 댓글을 다시 불러옵니다
    const commentsResponse = await fetchComments(id);
    setComments(commentsResponse.data.comments || []);
    setError(null);
  } catch (error) {
    console.error('댓글 작성 중 오류 발생:', error);
    setError('댓글을 작성할 수 없습니다.');
  }
};
  
  const openEditDialog = () => {
    setEditedPost({ title: post.title, content: post.content });
    setIsEditDialogOpen(true);
  };
  
  // 페이지 유지하며 목록으로 돌아가기
  const handleBackToList = () => {
    // URL에서 이전 페이지 정보 추출
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page') || '1';
    const searchParam = params.get('fromSearch');
    
    // 검색 상태를 유지하여 목록으로 이동
    const returnParams = new URLSearchParams();
    returnParams.set('page', pageParam);
    
    if (searchParam) {
      returnParams.set('search', searchParam);
    }
    
    navigate(`/blog?${returnParams.toString()}`);
  };
  
  // 댓글 수정 시작 함수
const handleEditComment = (commentId) => {
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return;
  
  // 게스트 댓글은 비밀번호 확인 필요
  if (comment.isGuest) {
    setCommentToEdit({ id: commentId, content: comment.content });
    setEditPassword('');
    setEditPasswordDialogOpen(true);
  } 
  // 로그인한 사용자의 댓글이거나 관리자는 즉시 수정 가능
  else if (currentUser && (
    currentUser.username === comment.author || 
    currentUser.isAdmin
  )) {
    setEditingCommentId(commentId);
    setEditedCommentContent(comment.content);
  }
};

  const handleUpdateComment = async (commentId) => {
    if (!editedCommentContent.trim()) return;
  
    try {
      await updateComment(id, commentId, { 
        content: editedCommentContent 
      });
      
      // 댓글 목록 다시 로드
      const commentsResponse = await fetchComments(id);
      setComments(commentsResponse.data.comments || []);
      setEditingCommentId(null);
      setError(null);
    } catch (error) {
      console.error('댓글 수정 중 오류 발생:', error);
      setError('댓글을 수정할 수 없습니다.');
    }
  };

// 댓글 삭제 함수
const handleDeleteComment = (commentId) => {
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return;
  
  // 게스트 댓글은 비밀번호 확인 필요
  if (comment.isGuest) {
    setCommentToDelete(comment);
    setCommentPassword('');
  } 
  // 로그인한 사용자의 댓글이거나 관리자는 즉시 삭제 가능
  else if (currentUser && (
    currentUser.username === comment.author || 
    currentUser.isAdmin
  )) {
    // 삭제 확인 다이얼로그 추가
    setCommentToDelete(comment);
  }
};

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
  
    try {
      const commentId = commentToDelete.id;
      if (commentToDelete.isGuest && !commentPassword) {
        setError('비밀번호를 입력해주세요.');
        return;
      }

      await deleteComment(id, commentId, commentToDelete.isGuest ? commentPassword : null);
      
      // 댓글 목록 다시 로드
      const commentsResponse = await fetchComments(id);
      setComments(commentsResponse.data.comments || []);
      setCommentToDelete(null);
      setCommentPassword('');
      setError(null);
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
      setError('댓글을 삭제할 수 없습니다.');
    }
  };

  // 비밀번호 확인 후 수정 모드로 전환
  const handleConfirmEditPassword = async () => {
    try {
      // 백엔드에서 비밀번호 확인 API 호출
      await verifyCommentPassword(id, commentToEdit.id, editPassword);
      
      // 비밀번호 확인 성공하면 수정 모드로
      setEditingCommentId(commentToEdit.id);
      setEditedCommentContent(commentToEdit.content);
      setEditPasswordDialogOpen(false);
      setEditPassword('');
    } catch (error) {
      console.error('댓글 비밀번호 확인 실패:', error);
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  if (loading && !post) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button variant="contained" onClick={loadPostDetails} sx={{ mt: 2 }}>다시 시도</Button>
        <Button variant="outlined" onClick={handleBackToList} sx={{ ml: 2, mt: 2 }}>목록으로</Button>
      </Container>
    );
  }
  
  if (!post) {
    return (
      <Container>
        <Typography>게시글이 존재하지 않습니다.</Typography>
        <Button variant="outlined" onClick={handleBackToList}>목록으로</Button>
      </Container>
    );
  }
  
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
                onClick={openEditDialog}
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
        
        <Paper
          elevation={3}
          sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}
        >
          <Typography variant="h4" gutterBottom>
            {post.title}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Chip 
              avatar={<Avatar>{post.author?.substring(0, 1) || 'U'}</Avatar>}
              label={post.author || '익명'}
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
            {post.content}
          </Typography>
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
              comments.map((comment) => (
                <Box key={comment.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
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
                          onClick={() => handleEditComment(comment.id)}
                          title={comment.isGuest ? "비밀번호 필요" : "댓글 수정"}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteComment(comment.id)}
                          title={comment.isGuest ? "비밀번호 필요" : "댓글 삭제"}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  
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
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          onClick={() => setEditingCommentId(null)}
                        >
                          취소
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => handleUpdateComment(comment.id)}
                        >
                          수정완료
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2">{comment.content}</Typography>
                  )}
                  
                  {/* 게스트 댓글 삭제 시 비밀번호 입력 다이얼로그 */}
                  <Dialog open={!!commentToDelete && commentToDelete.isGuest} onClose={() => setCommentToDelete(null)}>
                    <DialogTitle>댓글 삭제</DialogTitle>
                    <DialogContent>
                      <TextField 
                        type="password"
                        label="비밀번호"
                        fullWidth
                        margin="dense"
                        value={commentPassword}
                        onChange={(e) => setCommentPassword(e.target.value)}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setCommentToDelete(null)}>취소</Button>
                      <Button 
                        color="error"
                        variant="contained"
                        onClick={handleConfirmDeleteComment}
                      >
                        삭제
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </Typography>
            )}
          </Box>
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
          />
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

      {/* 게스트 댓글 수정 시 비밀번호 확인 다이얼로그 */}
      <Dialog open={editPasswordDialogOpen} onClose={() => setEditPasswordDialogOpen(false)}>
        <DialogTitle>댓글 수정</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            게스트 댓글을 수정하려면 작성 시 입력한 비밀번호가 필요합니다.
          </Typography>
          <TextField 
            type="password"
            label="비밀번호"
            fullWidth
            margin="dense"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPasswordDialogOpen(false)}>취소</Button>
          <Button 
            color="primary"
            variant="contained"
            onClick={handleConfirmEditPassword}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
