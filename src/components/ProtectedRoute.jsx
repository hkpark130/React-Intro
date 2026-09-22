import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../api/useAuth';
import Login from './Login';

export default function ProtectedRoute({ children }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const currentUser = useAuth();

  useEffect(() => {
    const auth = currentUser !== null;
    setIsAuth(auth);
    setIsAuthChecked(true);
    
    if (!auth) {
      setShowLogin(true);
    }
  }, [currentUser]);

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
