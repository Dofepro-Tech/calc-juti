import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, DollarSign, ArrowLeftRight, LineChart, StickyNote, Settings, PanelLeftClose, PanelLeft, BookOpenText, History, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { path: '/calculator', icon: Calculator, label: 'Calculadora' },
  { path: '/currency', icon: DollarSign, label: 'Divisas' },
  { path: '/units', icon: ArrowLeftRight, label: 'Unidades' },
  { path: '/charts', icon: LineChart, label: 'Gráficos' },
  { path: '/notes', icon: StickyNote, label: 'Notas' },
  { path: '/guide', icon: BookOpenText, label: 'Guía de uso' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
];

const authorName = 'Dofepro-tech';
const authorEmail = 'elsonidistaadnj@example.com';

export function Sidebar() {
  const location = useLocation();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    calculatorHistoryOpen,
    toggleCalculatorHistory,
  } = useAppStore();
  const currentYear = new Date().getFullYear();
  const isCalculatorRoute = location.pathname.startsWith('/calculator');

  const widthClass = sidebarCollapsed ? "md:w-20" : "md:w-64";
  const logoSizeClass = sidebarCollapsed ? 'w-11 h-11' : 'w-14 h-14';

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú móvil"
        onClick={() => setMobileSidebarOpen(false)}
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/35 transition-opacity md:hidden',
          mobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[18rem] max-w-[86vw] flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300 md:static md:z-auto md:w-16 md:max-w-none md:translate-x-0 md:shrink-0',
          widthClass,
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:shadow-none'
        )}
      >
        <div className="flex h-20 items-center justify-between gap-4 overflow-hidden border-b border-[var(--border)] px-6 shrink-0 md:justify-start">
          <div className={cn('relative shrink-0 flex items-center justify-center group transition-all duration-300', logoSizeClass)}>
            <div className="absolute inset-[-3px] rounded-xl bg-[conic-gradient(from_0deg,#4285F4,#34A853,#FBBC05,#EA4335,#4285F4)] animate-[spin_3s_linear_infinite] blur-[3px] opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-[-2px] rounded-xl bg-[conic-gradient(from_0deg,#4285F4,#34A853,#FBBC05,#EA4335,#4285F4)] animate-[spin_3s_linear_infinite]"></div>

            <div className="relative z-10 w-full h-full bg-[var(--surface)] rounded-[10px] flex items-center justify-center overflow-hidden">
              <img src="/brand-icon.svg" alt="Calc Juti" className="w-full h-full object-cover" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                (e.target as HTMLImageElement).nextElementSibling?.classList.add('flex');
              }} />
              <div className="hidden bg-[var(--surface)] text-[var(--primary)] items-center justify-center font-bold font-serif w-full h-full">
                D
              </div>
            </div>
          </div>
          <div className={cn('min-w-0 transition-all', sidebarCollapsed && 'md:hidden')}>
            <div className="truncate text-xl font-bold tracking-tight text-[var(--text)]">
              Calc <span className="text-[var(--primary)]">Juti</span>
            </div>
            <div className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text)] opacity-55">
              Calcula y convierte
            </div>
          </div>
          <button
            type="button"
            title="Cerrar menú"
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto rounded-xl p-2 text-[var(--text)] opacity-70 hover:bg-[var(--surface-hover)] hover:opacity-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex h-12 items-center justify-start rounded-xl px-4 transition-colors group md:px-3',
                  sidebarCollapsed ? 'md:justify-center' : 'md:justify-start',
                  isActive
                    ? 'text-[var(--primary)] font-bold'
                    : 'text-[var(--text)] font-medium opacity-70 hover:opacity-100 hover:bg-[var(--surface-hover)]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[var(--bg)] shadow-sm border border-[var(--border)] rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 z-10 shrink-0" />
                <span className={cn('ml-3 z-10 whitespace-nowrap', sidebarCollapsed && 'md:hidden')}>{item.label}</span>
              </Link>
            );
          })}

          {isCalculatorRoute && (
            <button
              onClick={() => {
                toggleCalculatorHistory();
                setMobileSidebarOpen(false);
              }}
              title={calculatorHistoryOpen ? 'Ocultar historial' : 'Mostrar historial'}
              className={cn(
                'relative flex h-12 w-full items-center justify-start rounded-xl px-4 transition-colors group md:px-3',
                sidebarCollapsed ? 'md:justify-center' : 'md:justify-start',
                calculatorHistoryOpen
                  ? 'bg-[var(--bg)] border border-[var(--border)] text-[var(--primary)] font-bold'
                  : 'text-[var(--text)] font-medium opacity-70 hover:opacity-100 hover:bg-[var(--surface-hover)]'
              )}
            >
              <History className="w-5 h-5 z-10 shrink-0" />
              <span className={cn('ml-3 z-10 whitespace-nowrap', sidebarCollapsed && 'md:hidden')}>
                {calculatorHistoryOpen ? 'Ocultar historial' : 'Mostrar historial'}
              </span>
            </button>
          )}
        </nav>

        <div className="mt-auto border-t border-[var(--border)]">
          <div className={cn('px-4 pt-4 text-[11px] leading-4 opacity-60', sidebarCollapsed && 'md:hidden')}>
            <div>Copyright {currentYear} {authorName}</div>
            <a href={`mailto:${authorEmail}`} className="mt-1 block truncate hover:opacity-100">
              {authorEmail}
            </a>
          </div>
          <div className="hidden p-4 md:flex justify-end">
            <button onClick={toggleSidebar} className="p-2 text-[var(--text)] opacity-60 hover:opacity-100 hover:bg-[var(--surface-hover)] rounded-xl transition-all" title={sidebarCollapsed ? 'Expandir' : 'Contraer'}>
              {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
