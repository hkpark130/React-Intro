import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';
import Login from './Login';

export default function ProtectedRoute({ children }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const auth = isAuthenticated();
    setIsAuth(auth);
    setIsAuthChecked(true);
    
    if (!auth) {
      setShowLogin(true);
    }
  }, []);

  if (!isAuthChecked) {
    return null; // 인증 확인 중
  }

  if (isAuth) {
    return children;
  }

  return (
    <>
      <Login 
        open={showLogin} 
        onClose={() => setShowLogin(false)} 
        redirectTo={location.pathname}
      />
      <Navigate to="/blog" replace />
    </>
  );
}
