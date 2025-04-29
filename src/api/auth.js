import { api } from "./api";
import { jwtDecode } from "jwt-decode";

let timeoutRef = null;

export const login = async (username, password) => {
    const res = await api.post("/users/login", { username, password });
    localStorage.setItem("accessToken", res.data.accessToken);
    scheduleTokenRefresh(res.data.accessToken);
};

export const refreshAccessToken = async () => {
    const res = await api.post("/users/refresh");
    const accessToken = res.data.accessToken;
    console.log("토큰 갱신함");
    localStorage.setItem("accessToken", accessToken);
  
    scheduleTokenRefresh(accessToken);
};

export const logout = async () => {
  const token = localStorage.getItem("accessToken");
  await api.post(
    "/users/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (timeoutRef) {
    clearTimeout(timeoutRef);
    timeoutRef = null;
  }
  localStorage.removeItem("accessToken");
};

// 사용자 인증 상태 확인 함수 추가
export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  
  try {
    const payload = jwtDecode(token);
    return Date.now() < payload.exp * 1000;
  } catch (err) {
    return false;
  }
};

// 현재 사용자 정보 가져오기 함수
export const getCurrentUser = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    
    // 토큰에서 권한 정보 확인하는 부분 수정
    // 역할/권한 정보는 아래 중 하나의 형태일 수 있음
    const isAdmin = 
      // 일반 역할 확인
      decoded.role === 'ADMIN' || 
      // Spring Security 기본 형식 확인
      decoded.authorities?.includes('ROLE_ADMIN') ||
      // 다른 가능한 형식 확인
      decoded.roles?.includes('ADMIN') || 
      decoded.scopes?.includes('ADMIN') ||
      // JWT 내 권한 맵 형태 확인
      decoded.auth === 'ADMIN';
    
    return {
      username: decoded.sub || decoded.username,
      isAdmin: isAdmin
    };
  } catch (error) {
    console.error("토큰 디코딩 오류:", error);
    localStorage.removeItem("accessToken");
    return null;
  }
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
        console.warn("이미 토큰 만료임 (refresh 시도 안 함)");
      }
    } catch (error) {
      console.error("토큰 디코딩 중 오류 발생:", error.message);
      // 유효하지 않은 토큰이면 localStorage에서 제거
      localStorage.removeItem("accessToken");
    }
}
