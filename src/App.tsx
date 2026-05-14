import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

const CalculatorView = lazy(() => import('./views/CalculatorView').then((module) => ({ default: module.CalculatorView })));
const CurrencyView = lazy(() => import('./views/CurrencyView').then((module) => ({ default: module.CurrencyView })));
const UnitConverterView = lazy(() => import('./views/UnitConverterView').then((module) => ({ default: module.UnitConverterView })));
const ChartsView = lazy(() => import('./views/ChartsView').then((module) => ({ default: module.ChartsView })));
const NotesView = lazy(() => import('./views/NotesView').then((module) => ({ default: module.NotesView })));
const SettingsView = lazy(() => import('./views/SettingsView').then((module) => ({ default: module.SettingsView })));
const GuideView = lazy(() => import('./views/GuideView').then((module) => ({ default: module.GuideView })));

const useHashRouter = import.meta.env.VITE_ROUTER_MODE === 'hash';

export default function App() {
  const { theme, customThemeColors } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-custom');
    
    if (theme === 'dark') {
      root.classList.add('theme-dark');
    } else if (theme === 'custom') {
      root.classList.add('theme-custom');
      root.style.setProperty('--custom-bg', customThemeColors.bg);
      root.style.setProperty('--custom-text', customThemeColors.text);
      root.style.setProperty('--custom-primary', customThemeColors.primary);
      root.style.setProperty('--custom-accent', customThemeColors.accent);
      root.style.setProperty('--custom-surface', customThemeColors.surface);
      root.style.setProperty('--custom-surface-hover', customThemeColors.surface + 'dd');
      root.style.setProperty('--custom-border', customThemeColors.primary + '55');
    } else {
      root.removeAttribute('style');
    }
  }, [theme, customThemeColors]);

  const appShell = (
      <div className="flex min-h-dvh overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 md:h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <Suspense fallback={<div className="flex h-full min-h-[16rem] items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium opacity-70">Cargando vista...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/calculator" replace />} />
                <Route path="/calculator" element={<CalculatorView />} />
                <Route path="/currency" element={<CurrencyView />} />
                <Route path="/units" element={<UnitConverterView />} />
                <Route path="/charts" element={<ChartsView />} />
                <Route path="/notes" element={<NotesView />} />
                <Route path="/guide" element={<GuideView />} />
                <Route path="/settings" element={<SettingsView />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
  );

  return useHashRouter ? <HashRouter>{appShell}</HashRouter> : <BrowserRouter basename={import.meta.env.BASE_URL}>{appShell}</BrowserRouter>;
}
