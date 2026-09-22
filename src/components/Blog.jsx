import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, CircularProgress, Pagination, PaginationItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { fetchPosts, fetchCategories } from '../api/api';
import { logout } from '../api/auth';
import { useAuth } from '../api/useAuth';
import Login from './Login';
import './blog.css';

const POSTS_PER_PAGE = 10;
const categoryLabel = name => name === 'Work Experience' ? '실무 경험' : name === 'ALL' ? '전체 글' : name;
const formatDate = value => value && !Number.isNaN(new Date(value).valueOf())
  ? new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

// 목록 미리보기만 추출한다. 본문은 원문과 기존 MarkdownRenderer를 그대로 사용한다.
function introduction(content = '') {
  const paragraph = content.split(/\n\s*\n/).find(part => part.trim() && !/^(?:#|<|!\[|```)/.test(part.trim())) || '';
  return paragraph.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '').replace(/^[>\s]+/gm, '').replace(/[*_`]/g, '').trim();
}

export default function Blog() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const search = params.get('search') || '';
  const categoryId = params.get('categoryId') || '';
  const [searchDraft, setSearchDraft] = useState(search);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const user = useAuth();

  useEffect(() => { setSearchDraft(search); }, [search]);
  useEffect(() => {
    let active = true;
    fetchCategories().then(response => {
      if (!active) return;
      setCategories([...(response.data || [])].filter(category => category.name !== 'ALL').sort((a, b) => {
        if (a.name === 'Work Experience') return -1;
        if (b.name === 'Work Experience') return 1;
        return a.name.localeCompare(b.name);
      }));
    }).catch(() => { /* 글 목록과 검색은 카테고리 조회 실패 시에도 사용할 수 있다. */ });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchPosts((page - 1) * POSTS_PER_PAGE, POSTS_PER_PAGE, search, categoryId)
      .then(response => {
        if (!active) return;
        setPosts(response.data.posts || []);
        setTotal(response.data.total || 0);
      })
      .catch(() => { if (active) setError('게시글을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, search, categoryId, retry]);

  const listUrl = (nextPage = 1, nextSearch = search, nextCategory = categoryId) => {
    const query = new URLSearchParams({ page: String(nextPage) });
    if (nextSearch) query.set('search', nextSearch);
    if (nextCategory) query.set('categoryId', nextCategory);
    return `/blog?${query}`;
  };
  const articleUrl = postId => {
    const query = new URLSearchParams({ page: String(page) });
    if (search) query.set('fromSearch', search);
    if (categoryId) query.set('categoryId', categoryId);
    return `/blog/${postId}?${query}`;
  };
  const handleLogout = async () => {
    try { await logout(); }
    catch { setError('로그아웃하지 못했습니다. 다시 시도해 주세요.'); }
  };
  const currentCategory = categories.find(category => String(category.id) === categoryId);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="blog-index">
      <header className="blog-heading">
        <div>
          <h1>기술 기록</h1>
          <p className="blog-heading-intro">클라우드를 운영하고, 문제를 추적하고, 더 나은 방법을 찾은 과정.</p>
        </div>
        <div className="blog-account">
          {user && <span className="blog-account-name">{user.username}{user.isAdmin ? ' (관리자)' : ''}</span>}
          <div className="blog-account-actions"><Button component={Link} to="/blog/create" disabled={!user} startIcon={<EditOutlinedIcon />} variant="outlined">글 작성</Button><Button onClick={user ? handleLogout : () => setIsLoginOpen(true)}>{user ? '로그아웃' : '로그인'}</Button></div>
        </div>
      </header>
      <div className="blog-browse">
        <aside className="blog-topics" aria-label="글 주제 선택">
          <h2>분야</h2>
          <div className="blog-topic-options"><button type="button" aria-pressed={!categoryId} onClick={() => navigate(listUrl(1, search, ''))}>전체 글</button>{categories.map(category => <button key={category.id} type="button" aria-pressed={categoryId === String(category.id)} onClick={() => navigate(listUrl(1, search, String(category.id)))}>{categoryLabel(category.name)}</button>)}</div>
          <div className="blog-topic-note"><Link to="/">프로젝트도 살펴보기</Link><p>글에 담긴 경험을 작업별로 모았습니다.</p></div>
        </aside>
        <section className="blog-entries" aria-labelledby="blog-results-title">
          <form className="blog-search" role="search" onSubmit={event => { event.preventDefault(); navigate(listUrl(1, searchDraft.trim())); }}>
            <SearchIcon aria-hidden="true" /><input type="search" aria-label="게시글 제목 또는 내용 검색" placeholder="제목이나 내용으로 검색" value={searchDraft} onChange={event => setSearchDraft(event.target.value)} />
            {searchDraft && <button className="blog-search-clear" type="button" aria-label="검색어 지우기" onClick={() => { setSearchDraft(''); navigate(listUrl(1, '')); }}><CloseIcon fontSize="small" /></button>}
            <button className="blog-search-submit" type="submit">검색</button>
          </form>
          <div className="blog-results-heading">
            <h2 id="blog-results-title">{search ? `“${search}” 검색 결과` : categoryLabel(currentCategory?.name) || '전체 글'}<span>{!loading && !error ? `${total}편` : ''}</span></h2>
            {(search || categoryId) ? <button type="button" className="blog-filter-reset" onClick={() => navigate('/blog')}>필터 초기화</button> : <span className="blog-sort-label">최근 작성순</span>}
          </div>
          {loading ? <div className="blog-status" role="status"><CircularProgress size={26} /><p>기록을 불러오는 중입니다.</p></div>
            : error ? <div className="blog-status"><Alert severity="error">{error}</Alert><Button variant="outlined" onClick={() => setRetry(value => value + 1)}>다시 시도</Button></div>
              : posts.length ? <div className="blog-post-list">
                {posts.map(post => (
                  <article key={post.id} className="blog-entry">
                    <div className="blog-entry-content">
                      <div className="blog-meta"><span className="blog-topic">{categoryLabel(post.category) || '기술 기록'}</span><time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>{post.commentCount > 0 && <span>댓글 {post.commentCount}</span>}</div>
                      <Link to={articleUrl(post.id)} className="blog-post-link" aria-labelledby={`post-title-${post.id}`}>
                        <h3 id={`post-title-${post.id}`}>{post.title}</h3>
                        <p>{introduction(post.content)}</p>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
                : <div className="blog-status"><h3>조건에 맞는 글이 없습니다.</h3><p>다른 검색어를 입력하거나 전체 글을 살펴보세요.</p><Button onClick={() => navigate('/blog')}>전체 글 보기</Button></div>}
          {!loading && !error && totalPages > 1 && <Pagination className="blog-pagination" count={totalPages} page={page} color="primary" siblingCount={1} showFirstButton showLastButton renderItem={item => <PaginationItem component={Link} to={listUrl(item.page || 1)} {...item} />} />}
        </section>
      </div>
      <Login open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
