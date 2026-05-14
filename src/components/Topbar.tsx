import React, { useEffect, useState } from 'react';
import { Download, LogIn, LogOut, Menu, User, X } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useAuthUser } from '../hooks/useAuthUser';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useAppStore } from '../store/useAppStore';

interface TopbarNotice {
  title: string;
  message: string;
}

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
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const { toggleMobileSidebar } = useAppStore();
  const [notice, setNotice] = useState<TopbarNotice | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const closeNotice = () => {
    setNotice(null);
  };

  useEffect(() => {
    if (!error) {
      return;
    }

    setNotice({
      title: 'No se pudo acceder o registrar',
      message: getAuthErrorMessage(error),
    });
    setIsAuthenticating(false);
  }, [error]);

  useEffect(() => {
    if (!user) {
      return;
    }

    clearError();
    setNotice(null);
    setIsAuthenticating(false);
  }, [clearError, user]);

  const getInstallHelpMessage = () => {
    if (typeof navigator === 'undefined') {
      return 'Abre la app en Chrome, Edge o Safari para instalarla.';
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes('android');
    const isIos = /iphone|ipad|ipod/.test(userAgent);

    if (isIos) {
      return 'En iPhone o iPad abre la app en Safari, toca Compartir y luego Añadir a pantalla de inicio.';
    }

    if (isAndroid) {
      return 'En Android abre la app en Chrome o Edge. Si no ves la opción automática, usa el botón Instalar app cuando aparezca o abre el menú del navegador y elige Instalar app o Agregar a pantalla principal.';
    }

    return 'En escritorio abre la app en Chrome o Edge y usa el icono de instalación o el menú del navegador para instalarla.';
  };

  const handleInstall = async () => {
    if (!canInstall) {
      setNotice({
        title: 'Instalar app',
        message: getInstallHelpMessage(),
      });
      return;
    }

    setNotice(null);
    const outcome = await promptInstall();

    if (outcome === 'dismissed') {
      setNotice({
        title: 'Instalar app',
        message: 'Se cerró la instalación antes de completarse. Puedes intentarlo otra vez desde este botón.',
      });
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    setNotice(null);
    setIsAuthenticating(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      setNotice({
        title: 'No se pudo acceder o registrar',
        message: getAuthErrorMessage(e),
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setNotice(null);
    } catch (e) {
      console.error(e);
      setNotice({
        title: 'No se pudo cerrar la sesión',
        message: 'No se pudo cerrar la sesión en este momento.',
      });
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
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstall}
            className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] sm:px-4"
            title={canInstall ? 'Instalar app' : 'Ver cómo instalar la app'}
          >
            <Download className="w-4 h-4" />
            <span>{canInstall ? 'Instalar app' : 'Como instalar'}</span>
          </button>
        )}
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
      {notice && (
        <div className="absolute left-3 right-3 top-full z-20 mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs shadow-lg md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[var(--primary)]">{notice.title}</div>
              <div className="mt-1 opacity-75">{notice.message}</div>
            </div>
            <button
              type="button"
              onClick={closeNotice}
              title="Cerrar aviso"
              className="shrink-0 rounded-xl p-1 text-[var(--text)] opacity-70 transition-colors hover:bg-[var(--surface-hover)] hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
