import { api } from "./api";
import { jwtDecode } from "jwt-decode";

let timeoutRef = null;
const AUTH_CHANGE_EVENT = 'blog-auth-change';

const emitAuthChange = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const storeAccessToken = token => {
  localStorage.setItem('accessToken', token);
  emitAuthChange();
};

const clearLocalAuth = () => {
  if (timeoutRef) {
    clearTimeout(timeoutRef);
    timeoutRef = null;
  }
  localStorage.removeItem('accessToken');
  emitAuthChange();
};

const readAuthState = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return { user: null, expiresAt: null };

  try {
    const decoded = jwtDecode(token);
    const expiresAt = Number(decoded.exp) * 1000;
    const username = decoded.sub || decoded.username;
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt || !username) {
      return { user: null, expiresAt: null };
    }

    const isAdmin =
      decoded.role === 'ADMIN' ||
      decoded.authorities?.includes('ROLE_ADMIN') ||
      decoded.roles?.includes('ADMIN') ||
      decoded.scopes?.includes('ADMIN') ||
      decoded.auth === 'ADMIN';

    return { user: { username, isAdmin }, expiresAt };
  } catch {
    return { user: null, expiresAt: null };
  }
};

export const login = async (username, password) => {
    const res = await api.post("/users/login", { username, password });
    storeAccessToken(res.data.accessToken);
    scheduleTokenRefresh(res.data.accessToken);
};

export const refreshAccessToken = async () => {
    const res = await api.post("/users/refresh");
    const accessToken = res.data.accessToken;
    storeAccessToken(accessToken);

    scheduleTokenRefresh(accessToken);
    return accessToken;
};

/**
 * 화면에 다시 들어왔을 때 세션을 잇는다.
 * access token은 30분이지만 refresh 쿠키는 7일이다. 탭을 닫거나 절전에 들어가면
 * 갱신 타이머가 돌지 못해 access token만 만료되므로, 그때도 쿠키로 한 번 시도한다.
 * @returns {Promise<boolean>} 사용 가능한 세션이 남아 있으면 true
 */
export const restoreSession = async () => {
    const token = localStorage.getItem('accessToken');
    if (readAuthState().user) {
        scheduleTokenRefresh(token);
        return true;
    }

    // 로그인한 적이 있어야 refresh 쿠키도 있다. 흔적이 없으면 서버를 부르지 않는다.
    if (!token) return false;

    try {
        await refreshAccessToken();
        return true;
    } catch {
        // 쿠키까지 만료됐거나 서버가 거부한 경우다. 다시 로그인해야 한다.
        clearLocalAuth();
        return false;
    }
};

export const logout = async () => {
  const token = localStorage.getItem("accessToken");
  try {
    await api.post(
      "/users/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } finally {
    clearLocalAuth();
  }
};

export const isAuthenticated = () => getCurrentUser() !== null;

// 현재 사용자 정보 가져오기 함수
export const getCurrentUser = () => readAuthState().user;

export const getAccessTokenExpiration = () => readAuthState().expiresAt;

export const subscribeAuthChanges = listener => {
  const onStorage = event => {
    if (event.key === 'accessToken') listener();
  };
  window.addEventListener(AUTH_CHANGE_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
};

export function scheduleTokenRefresh(token) {
    // 토큰이 null, undefined 또는 문자열이 아닐 경우의 예외 처리
    if (!token || typeof token !== 'string') {
      console.error("유효하지 않은 토큰 형식입니다.");
      return;
    }
    
    try {
      const payload = jwtDecode(token);
      const exp = payload.exp * 1000;
      const now = Date.now();
      const timeToRefresh = exp - now - 60 * 1000; // 1분 전
    
      if (timeoutRef) {
        clearTimeout(timeoutRef);  // 기존 타이머 제거
      }
    
      if (timeToRefresh > 0) {
        timeoutRef = setTimeout(() => {
          refreshAccessToken().catch(() => {
            console.error("자동 토큰 갱신 실패");
          });
        }, timeToRefresh);
      } else {
        // 이미 만료된 토큰이다. 타이머 대신 restoreSession이 쿠키로 복구한다.
        refreshAccessToken().catch(() => clearLocalAuth());
      }
    } catch (error) {
      console.error("토큰 디코딩 중 오류 발생:", error.message);
      clearLocalAuth();
    }
}
