import React, { useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const updateCheckIntervalMs = 5 * 60 * 1000;
let updateIntervalId: number | null = null;

export function PwaUpdatePrompt() {
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
      }, updateCheckIntervalMs);
    },
  });

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

  if (!needRefresh && !offlineReady) {
    return null;
  }

  const closePrompt = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
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
              {needRefresh ? 'Nueva version disponible' : 'App lista para usar sin conexion'}
            </div>
            <p className="mt-1 text-sm opacity-75">
              {needRefresh
                ? 'Hay una version nueva de Calc Juti lista para descargar e instalar. Pulsa actualizar para usarla ahora.'
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
            {needRefresh ? 'Despues' : 'Entendido'}
          </button>
          {needRefresh && (
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
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