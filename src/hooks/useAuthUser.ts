import { useCallback, useEffect, useState } from 'react';
import { getRedirectResult, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthUserState {
  user: User | null;
  loading: boolean;
  error: unknown | null;
  clearError: () => void;
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let authResolved = false;
    let redirectResolved = false;

    const finishLoading = () => {
      if (isMounted && authResolved && redirectResolved) {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!isMounted) {
        return;
      }

      setUser(nextUser);
      authResolved = true;
      finishLoading();
    });

    getRedirectResult(auth)
      .catch((nextError) => {
        if (isMounted) {
          setError(nextError);
        }
      })
      .finally(() => {
        redirectResolved = true;
        finishLoading();
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    clearError,
  } satisfies AuthUserState;
}