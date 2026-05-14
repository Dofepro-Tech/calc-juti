import { useCallback, useEffect, useState } from 'react';
import { getRedirectResult, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthUserState {
  user: User | null;
  loading: boolean;
  error: unknown | null;
  clearError: () => void;
}

interface SharedAuthState {
  user: User | null;
  loading: boolean;
  error: unknown | null;
}

const sharedAuthState: SharedAuthState = {
  user: auth.currentUser,
  loading: true,
  error: null,
};

const subscribers = new Set<() => void>();
let authObserverStarted = false;

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber());
}

function clearSharedError() {
  if (sharedAuthState.error === null) {
    return;
  }

  sharedAuthState.error = null;
  notifySubscribers();
}

function startAuthObserver() {
  if (authObserverStarted) {
    return;
  }

  authObserverStarted = true;

  let authResolved = false;
  let redirectResolved = false;

  const finishLoading = () => {
    if (authResolved && redirectResolved && sharedAuthState.loading) {
      sharedAuthState.loading = false;
      notifySubscribers();
    }
  };

  onAuthStateChanged(auth, (nextUser) => {
    sharedAuthState.user = nextUser;
    authResolved = true;
    notifySubscribers();
    finishLoading();
  });

  getRedirectResult(auth)
    .catch((nextError) => {
      sharedAuthState.error = nextError;
      notifySubscribers();
    })
    .finally(() => {
      redirectResolved = true;
      finishLoading();
    });
}

export function useAuthUser() {
  const [state, setState] = useState<SharedAuthState>(() => ({ ...sharedAuthState }));

  const clearError = useCallback(() => {
    clearSharedError();
  }, []);

  useEffect(() => {
    startAuthObserver();

    const syncState = () => {
      setState({ ...sharedAuthState });
    };

    subscribers.add(syncState);
    syncState();

    return () => {
      subscribers.delete(syncState);
    };
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    clearError,
  } satisfies AuthUserState;
}