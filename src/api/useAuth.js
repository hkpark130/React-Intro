import { useEffect, useState } from 'react';
import { getAccessTokenExpiration, getCurrentUser, subscribeAuthChanges } from './auth';

export function useAuth() {
  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => {
    let expirationTimer = null;

    const sync = () => {
      setUser(getCurrentUser());
      if (expirationTimer) clearTimeout(expirationTimer);
      const expiresAt = getAccessTokenExpiration();
      if (expiresAt) {
        expirationTimer = setTimeout(sync, Math.max(0, expiresAt - Date.now() + 1));
      }
    };

    const unsubscribe = subscribeAuthChanges(sync);
    sync();
    return () => {
      unsubscribe();
      if (expirationTimer) clearTimeout(expirationTimer);
    };
  }, []);

  return user;
}
