import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const serviceWorkerCheckIntervalMs = 5 * 60 * 1000;
const versionCheckIntervalMs = 60 * 1000;
let updateIntervalId: number | null = null;

interface AppVersionInfo {
  buildId?: string;
  generatedAt?: string;
}

export function PwaUpdatePrompt() {
  const [versionUpdateAvailable, setVersionUpdateAvailable] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration || updateIntervalId !== null || typeof window === 'undefined') {
        return;
      }

      updateIntervalId = window.setInterval(() => {
        if (navigator.onLine) {
          registration.update();
        }
      }, serviceWorkerCheckIntervalMs);
    },
  });

  const checkVersion = useCallback(async () => {
    if (typeof window === 'undefined' || __APP_BUILD_ID__ === 'dev' || !navigator.onLine) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}app-version.json?ts=${Date.now()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const versionInfo = (await response.json()) as AppVersionInfo;
      if (versionInfo.buildId && versionInfo.buildId !== __APP_BUILD_ID__) {
        setVersionUpdateAvailable(true);
      }
    } catch (error) {
      console.error('No se pudo comprobar la nueva version de la app.', error);
    }
  }, []);

  useEffect(() => {
    if (!offlineReady || typeof window === 'undefined') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setOfflineReady(false);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    void checkVersion();

    const intervalId = window.setInterval(() => {
      void checkVersion();
    }, versionCheckIntervalMs);

    const handleFocus = () => {
      void checkVersion();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkVersion();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkVersion]);

  const hasUpdate = needRefresh || versionUpdateAvailable;

  if (!hasUpdate && !offlineReady) {
    return null;
  }

  const closePrompt = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
    setVersionUpdateAvailable(false);
  };

  const handleUpdate = async () => {
    if (needRefresh) {
      await updateServiceWorker(true);
      return;
    }

    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.update();
    window.location.reload();
  };

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex justify-center sm:inset-x-auto sm:right-4 sm:bottom-4">
      <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl shadow-slate-950/20">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-2xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
            <RefreshCcw className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[var(--primary)]">
              {hasUpdate ? 'Nueva version disponible' : 'App lista para usar sin conexion'}
            </div>
            <p className="mt-1 text-sm opacity-75">
              {hasUpdate
                ? 'Hay una version nueva de Calc Juti lista para descargar e instalar. Pulsa actualizar para usarla ahora en web, escritorio o app agregada al inicio.'
                : 'Calc Juti ya puede abrirse como app instalada en este dispositivo.'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={closePrompt}
            className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]"
          >
            {hasUpdate ? 'Despues' : 'Entendido'}
          </button>
          {hasUpdate && (
            <button
              type="button"
              onClick={handleUpdate}
              className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--bg)] transition-opacity hover:opacity-90"
            >
              Actualizar app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}