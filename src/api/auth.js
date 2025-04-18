import { api } from "./axios";
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

export function scheduleTokenRefresh(token) {
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
}
