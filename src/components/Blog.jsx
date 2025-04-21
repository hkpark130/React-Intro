import React, { useEffect, useState } from 'react';
import { fetchPosts, fetchCategories } from '../api/api';
import { isAuthenticated, getCurrentUser, logout } from '../api/auth';
import { 
  Typography, Container, Button, CircularProgress, Pagination, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Stack, TextField, InputAdornment, IconButton,
  Menu, MenuItem, ListItemText, FormControl, Select, Tooltip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Login from './Login';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AddIcon from '@mui/icons-material/Add';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // 카테고리 관련 상태
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const postsPerPage = 10; // 테이블에서는 페이지당 10개가 더 적합
  
  // 사용자 인증 상태 확인
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    } else {
      setUser(null);
    }
  }, []);
  
  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        let categoriesData = response.data || [];
        
        // 카테고리 우선순위 설정: "ALL"이 첫 번째, "Work"가 두 번째로 오도록 정렬
        categoriesData = categoriesData.sort((a, b) => {
          if (a.name === "ALL") return -1;
          if (b.name === "ALL") return 1;
          if (a.name === "Work Experience") return -1;
          if (b.name === "Work Experience") return 1;
          return a.name.localeCompare(b.name); // 나머지는 알파벳 순
        });
        
        setCategories(categoriesData);
      } catch (error) {
        console.error('카테고리를 불러오는 중 오류 발생:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  // URL에서 페이지 정보와 검색어 가져오기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // 페이지 정보 가져오기
    const pageParam = parseInt(params.get('page'));
    const currentPage = pageParam && !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
    setPage(currentPage);
    
    // 검색어 가져오기
    const searchParam = params.get('search');
    const isSearchActive = !!searchParam;
    setSearchTerm(searchParam || "");
    setIsSearching(isSearchActive);
    
    // 카테고리 정보 가져오기
    const categoryParam = params.get('categoryId');
    if (categoryParam) {
      setSelectedCategoryId(categoryParam);
    } else {
      setSelectedCategoryId("");
    }
    
    // URL 파라미터 기반으로 즉시 게시글 로드
    const loadInitialPosts = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * postsPerPage;
        let response;
        
        if (searchParam && categoryParam) {
          response = await fetchPosts(offset, postsPerPage, searchParam, categoryParam);
        } else if (searchParam) {
          response = await fetchPosts(offset, postsPerPage, searchParam);
        } else if (categoryParam) {
          response = await fetchPosts(offset, postsPerPage, null, categoryParam);
        } else {
          response = await fetchPosts(offset, postsPerPage);
        }
        
        setPosts(response.data.posts || []);
        setTotalPages(Math.ceil((response.data.total || 0) / postsPerPage));
      } catch (error) {
        console.error('게시글을 불러오는 중 오류 발생:', error);
        setError('게시글을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialPosts();
  }, [location.search, postsPerPage]);
  
  useEffect(() => {
    if (searchTerm) {
      setPage(1);
    }
  }, [searchTerm]);
  
  const loadPosts = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * postsPerPage;
      let response;
      
      if (searchTerm && isSearching && selectedCategoryId) {
        response = await fetchPosts(offset, postsPerPage, searchTerm, selectedCategoryId);
      } else if (searchTerm && isSearching) {
        response = await fetchPosts(offset, postsPerPage, searchTerm);
      } else if (selectedCategoryId) {
        response = await fetchPosts(offset, postsPerPage, null, selectedCategoryId);
      } else {
        response = await fetchPosts(offset, postsPerPage);
      }
      
      setPosts(response.data.posts || []);
      setTotalPages(Math.ceil((response.data.total || 0) / postsPerPage));
    } catch (error) {
      console.error('게시글을 불러오는 중 오류 발생:', error);
      setError('게시글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePostClick = async (postId) => {
    try {
      setLoading(true);
      
      // URL 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.set('page', page.toString());
      
      // 검색 중이면 검색어도 함께 전달
      if (searchTerm && isSearching) {
        params.set('fromSearch', searchTerm);
      }
      
      // 카테고리 필터가 있으면 URL에 유지
      if (selectedCategoryId) {
        params.set('categoryId', selectedCategoryId);
      }
      
      navigate(`/blog/${postId}?${params.toString()}`);
    } catch (error) {
      console.error('게시글 상세 정보를 불러오는 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 페이지 변경 함수 수정
  const handlePageChange = (event, value) => {
    const params = new URLSearchParams();
    params.set('page', value);
    
    // 검색 중이면 검색어도 URL에 유지
    if (searchTerm && isSearching) {
      params.set('search', searchTerm);
    }
    
    // 카테고리 필터가 있으면 URL에 유지
    if (selectedCategoryId) {
      params.set('categoryId', selectedCategoryId);
    }
    
    navigate(`/blog?${params.toString()}`);
    setPage(value);
  };
  
  // 카테고리 변경 핸들러
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId);
    
    // 페이지를 1로 리셋하고 새로운 URL 구성
    const params = new URLSearchParams();
    params.set('page', '1');
    
    // 검색어가 있으면 유지
    if (searchTerm && isSearching) {
      params.set('search', searchTerm);
    }
    
    // 선택한 카테고리가 있으면 URL에 추가
    if (categoryId) {
      params.set('categoryId', categoryId);
    }
    
    navigate(`/blog?${params.toString()}`);
  };
  
  const handleCreatePost = () => {
    navigate('/blog/create');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      // 현재 페이지로 리다이렉트 (로그아웃 상태 반영)
      window.location.reload();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 검색 함수 수정
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    // 검색어와 현재 페이지를 URL에 반영
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    params.set('page', '1'); // 검색 시 첫 페이지로 이동
    
    // 카테고리 필터가 있으면 URL에 유지
    if (selectedCategoryId) {
      params.set('categoryId', selectedCategoryId);
    }
    
    navigate(`/blog?${params.toString()}`);
  };
  
  // 검색 취소 함수 수정
  const handleSearchClear = () => {
    setSearchTerm("");
    setIsSearching(false);
    
    // 검색 취소 시 검색어 파라미터 제거하고 현재 페이지 유지
    const params = new URLSearchParams();
    params.set('page', '1');
    
    // 카테고리 필터가 있으면 URL에 유지
    if (selectedCategoryId) {
      params.set('categoryId', selectedCategoryId);
    }
    
    navigate(`/blog?${params.toString()}`);
  };

  // 모든 필터 초기화 함수
  const handleResetAllFilters = () => {
    setSearchTerm("");
    setIsSearching(false);
    setSelectedCategoryId("");
    
    // 모든 필터와 페이지를 초기 상태로 리셋
    navigate('/blog');
  };

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="contained" onClick={loadPosts}>다시 시도</Button>
      </Container>
    );
  }
  
  if (loading && posts.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1">
          블로그
        </Typography>
        
        {/* 로그인 사용자 정보 표시 (로그인한 경우만) */}
        {user && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'primary.light', 
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1
          }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              {user.username}{user.isAdmin ? ' (관리자)' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            size="small"
            placeholder="게시글 제목 또는 내용 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small"
                    onClick={handleSearchClear}
                    aria-label="검색어 지우기"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: 'primary.main' },
              }
            }}
          />
        </form>
      </Box>

      {/* 카테고리 드롭다운 메뉴 */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <Select
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            displayEmpty
            IconComponent={ArrowDropDownIcon}
          >
            <MenuItem value="">
              <ListItemText primary="ALL" />
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                <ListItemText primary={category.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          mb: 3, 
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Tooltip title="필터 초기화">
          <Button 
            onClick={handleResetAllFilters}
            startIcon={<RestartAltIcon />}
          >
            필터 초기화
          </Button>
        </Tooltip>
        <Button 
          variant="contained" 
          onClick={handleCreatePost}
          disabled={!user}
          title={user ? "새 게시글 작성" : "로그인이 필요합니다"}
          startIcon={<AddIcon />}
        >
          새 게시글 작성
        </Button>
        
        {user ? (
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        ) : (
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<LoginIcon />}
            onClick={() => setIsLoginOpen(true)}
          >
            로그인
          </Button>
        )}
      </Stack>

      {isSearching && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <Button 
            size="small" 
            onClick={handleSearchClear}
            startIcon={<CloseIcon fontSize="small" />}
          >
            검색 취소
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="게시글 목록">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width="70">번호</TableCell>
              <TableCell>제목</TableCell>
              <TableCell width="80" align="center">댓글</TableCell>
              <TableCell width="150">작성자</TableCell>
              <TableCell width="180">작성일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <TableRow 
                  key={post.id}
                  hover
                  onClick={() => handlePostClick(post.id)}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{post.id}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell align="center">
                    <Box component="span" sx={{ 
                      display: 'inline-block',
                      minWidth: '24px',
                      bgcolor: post.commentCount > 0 ? 'primary.main' : 'grey.300',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {post.commentCount || 0}
                    </Box>
                  </TableCell>
                  <TableCell>{post.author || '익명'}</TableCell>
                  <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  게시글이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}

      <Login 
        open={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </Container>
  );
}
