import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, Menu, User } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useAuthUser } from '../hooks/useAuthUser';
import { useAppStore } from '../store/useAppStore';

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
  const host = typeof window === 'undefined' ? 'este dominio' : window.location.hostname;

  if (code.includes('api-key-not-valid')) {
    return 'La API key de Firebase no es valida. Abre Project settings > General > Your apps > SDK setup and configuration y copia otra vez la config web exacta.';
  }

  switch (code) {
    case 'auth/unauthorized-domain':
      return `El dominio ${host} no está autorizado en Firebase. Agrégalo en Authentication > Settings > Authorized domains. Cuando quede autorizado, Google servirá también para registrarse la primera vez.`;
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes para este sitio e inténtalo otra vez.';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de Google antes de completar el acceso.';
    case 'auth/cancelled-popup-request':
      return 'Ya hay un acceso con Google en curso. Espera a que termine antes de intentarlo de nuevo.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Este navegador o contenedor no permite la ventana de acceso de Google. Abre la app en un navegador normal.';
    default:
      return 'No se pudo iniciar sesión con Google en este momento.';
  }
}

export function Topbar() {
  const { user, loading, error, clearError } = useAuthUser();
  const { toggleMobileSidebar } = useAppStore();
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!error) {
      return;
    }

    setAuthMessage(getAuthErrorMessage(error));
    setIsAuthenticating(false);
  }, [error]);

  useEffect(() => {
    if (!user) {
      return;
    }

    clearError();
    setAuthMessage(null);
    setIsAuthenticating(false);
  }, [clearError, user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    setAuthMessage(null);
    setIsAuthenticating(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      setAuthMessage(getAuthErrorMessage(e));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthMessage(null);
    } catch (e) {
      console.error(e);
      setAuthMessage('No se pudo cerrar la sesión en este momento.');
    }
  };

  return (
    <header className="relative flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3 transition-colors duration-300 sm:px-4 md:px-8">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          title="Abrir menú"
          className="rounded-xl border border-[var(--border)] p-2 text-[var(--text)] hover:bg-[var(--surface-hover)] md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex gap-6 text-sm font-medium text-[var(--text)] opacity-60">
        <span className="hidden md:block hover:opacity-100 cursor-pointer">Dashboard</span>
        <span className="hidden md:block hover:opacity-100 cursor-pointer">Mercados</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs opacity-50">Actualizado</div>
          <div className="text-sm font-semibold">Reciente</div>
        </div>
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {user.photoURL ? (
                 <img src={user.photoURL} referrerPolicy="no-referrer" alt="Avatar" className="w-8 h-8 rounded-full border border-[var(--border)]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <span className="hidden max-w-[11rem] truncate text-sm font-medium md:block">{user.displayName || user.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-[var(--surface-hover)]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:block">Salir</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            disabled={isAuthenticating || loading}
            className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 sm:px-4"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Verificando...' : isAuthenticating ? 'Abriendo...' : 'Acceder / Registrarse'}
          </button>
        )}
      </div>
      {authMessage && (
        <div className="absolute left-3 right-3 top-full z-20 mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs shadow-lg md:left-auto md:right-4 md:max-w-sm">
          <div className="font-semibold text-[var(--primary)]">No se pudo acceder o registrar</div>
          <div className="mt-1 opacity-75">{authMessage}</div>
        </div>
      )}
    </header>
  );
}
