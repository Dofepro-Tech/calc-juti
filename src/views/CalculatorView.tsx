import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { History, Delete, CornerDownLeft, X } from 'lucide-react';
import { cn, triggerHaptic } from '../lib/utils';
import { evaluateExpression, roundExpressionResult } from '../lib/mathEngine';
import { motion, AnimatePresence } from 'motion/react';

const buttons = [
  ['sin', 'cos', 'tan', 'log', 'ln'],
  ['(', ')', '^', 'sqrt', 'exp'],
  ['C', '⌫', '%', '/', 'pi'],
  ['7', '8', '9', '*', 'e'],
  ['4', '5', '6', '-', '!'],
  ['1', '2', '3', '+', 'Ans'],
  ['0', '.', '=']
];

function closePendingParentheses(expression: string) {
  const openCount = (expression.match(/\(/g) ?? []).length;
  const closeCount = (expression.match(/\)/g) ?? []).length;
  const missingClosers = Math.max(0, openCount - closeCount);
  return `${expression}${')'.repeat(missingClosers)}`;
}

function appendFragment(expression: string, fragment: string, kind: 'digit' | 'decimal' | 'function' | 'constant' | 'operator' | 'openParen' | 'closeParen' | 'ans') {
  const trimmed = expression.trim();

  if (kind === 'closeParen') {
    const openCount = (expression.match(/\(/g) ?? []).length;
    const closeCount = (expression.match(/\)/g) ?? []).length;
    return openCount > closeCount ? `${expression})` : expression;
  }

  if (kind === 'decimal') {
    if (!trimmed || /[+\-*/%^(]$/.test(trimmed)) {
      return `${expression}0.`;
    }

    if (/(\)|pi|e|!)$/i.test(trimmed)) {
      return `${expression}*0.`;
    }

    return `${expression}.`;
  }

  const needsMultiplicationBeforeValue = (
    (
      kind === 'function'
      || kind === 'constant'
      || kind === 'openParen'
      || kind === 'ans'
    ) && /(\)|pi|e|!|\d)$/i.test(trimmed)
  ) || (
    kind === 'digit' && /(\)|pi|e|!)$/i.test(trimmed)
  );

  const prefix = needsMultiplicationBeforeValue ? '*' : '';
  return `${expression}${prefix}${fragment}`;
}

function isOperator(val: string) {
  return ['/', '*', '-', '+', '^', '%', '!', 'sqrt', 'exp', 'sin', 'cos', 'tan', 'log', 'ln', 'C', '⌫', 'pi', 'e', 'Ans', '(', ')'].includes(val);
}
function isFunction(val: string) {
  return ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'exp'].includes(val);
}

export function CalculatorView() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const {
    history,
    addHistory,
    clearHistory,
    removeHistoryItem,
    hapticFeedback,
    precision,
    calculatorHistoryOpen,
    setCalculatorHistoryOpen,
  } = useAppStore();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const syncHistoryPanel = () => setCalculatorHistoryOpen(mediaQuery.matches);

    syncHistoryPanel();
    mediaQuery.addEventListener('change', syncHistoryPanel);

    return () => {
      mediaQuery.removeEventListener('change', syncHistoryPanel);
    };
  }, [setCalculatorHistoryOpen]);

  const handlePress = (val: string) => {
    triggerHaptic(hapticFeedback);
    if (val === 'C') {
      setExpression('');
      setResult('');
    } else if (val === '⌫') {
      setExpression(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        const normalizedExpression = closePendingParentheses(expression);
        if (!normalizedExpression.trim()) {
          return;
        }

        const evalResult = evaluateExpression(normalizedExpression);
        const resStr = roundExpressionResult(evalResult, precision);
        setExpression(normalizedExpression);
        setResult(resStr);
        addHistory({ expression: normalizedExpression, result: resStr });
      } catch {
        setResult('Error');
      }
    } else if (val === 'Ans') {
      if (history.length > 0) {
         const ansValue = history[0].result.startsWith('-') ? `(${history[0].result})` : history[0].result;
         setExpression(prev => appendFragment(prev, ansValue, 'ans'));
      }
    } else if (isFunction(val)) {
      setExpression(prev => appendFragment(prev, `${val}(`, 'function'));
    } else if (val === 'pi' || val === 'e') {
      setExpression(prev => appendFragment(prev, val, 'constant'));
    } else if (val === '(') {
      setExpression(prev => appendFragment(prev, val, 'openParen'));
    } else if (val === ')') {
      setExpression(prev => appendFragment(prev, val, 'closeParen'));
    } else if (val === '.') {
      setExpression(prev => appendFragment(prev, val, 'decimal'));
    } else if (/^\d$/.test(val)) {
      setExpression(prev => appendFragment(prev, val, 'digit'));
    } else {
      setExpression(prev => appendFragment(prev, val, 'operator'));
    }
  };

  // Evaluate as you type but don't save to history
  useEffect(() => {
    if (expression) {
      try {
        const evalResult = evaluateExpression(closePendingParentheses(expression));
        const resStr = roundExpressionResult(evalResult, precision);
        if (resStr !== 'undefined' && resStr !== 'function') {
           setResult(resStr);
        }
      } catch {
        // ignore incomplete expressions
      }
    } else {
      setResult('');
    }
  }, [expression, precision]);

  return (
    <div className="relative mx-auto flex h-full max-w-4xl min-h-0 flex-col gap-4 pb-4 md:h-[calc(100vh-8rem)] md:flex-row md:gap-6 md:pb-0">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:p-8">
        <div className="relative mb-4 flex min-h-[132px] flex-none flex-col items-end justify-end overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm cursor-text sm:min-h-[160px] md:mb-6 md:p-8">
          <div className="absolute top-6 left-6 text-xs font-mono text-[var(--primary)] opacity-60 tracking-tighter uppercase">Live Calculator Engine v2.0</div>
          <div className="mb-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-right font-mono text-xl font-light opacity-60 md:text-2xl">
            {expression || '0'}
          </div>
          <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-right text-4xl font-bold tracking-tighter text-[var(--text)] sm:text-5xl md:text-6xl">
            {result || '='}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 md:gap-3 flex-1 auto-rows-fr">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => handlePress(btn)}
              className={cn(
                'flex w-full flex-col items-center justify-center rounded-2xl text-base font-bold transition-all shadow-[0_2px_10px_rgba(0,0,0,0.03)] active:scale-95 active:shadow-none min-h-[3.25rem] sm:min-h-[3.5rem] md:min-h-0 md:text-xl',
                btn === '=' ? "bg-[var(--primary)] text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:opacity-90 col-span-2" :
                btn === '0' ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-hover)] col-span-2" :
                btn === 'C' || btn === '⌫' ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" :
                isOperator(btn) 
                  ? "bg-[var(--accent)] bg-opacity-20 text-[var(--primary)] hover:bg-opacity-30 border border-[var(--accent)] border-opacity-30" 
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {calculatorHistoryOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
              'absolute inset-0 z-20 flex flex-col rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl sm:p-6 md:static md:w-80 md:rounded-none md:border-none md:bg-transparent md:p-0 md:shadow-none'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-[var(--primary)]" />
                Historial
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearHistory}
                  title="Borrar historial"
                  className="p-2 rounded hover:bg-[var(--surface-hover)] text-red-500 transition-colors"
                >
                  <Delete className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCalculatorHistoryOpen(false)}
                  className="p-2 rounded hover:bg-[var(--surface-hover)] transition-colors"
                  title="Plegar historial"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center opacity-50 py-10">
                  <p>No hay historial aún.</p>
                </div>
              ) : (
                history.map((record) => (
                  <div key={record.id} className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] group relative">
                    <div className="text-sm opacity-60 font-mono mb-1 truncate">{record.expression}</div>
                    <div className="text-lg font-bold font-mono text-[var(--primary)] truncate">={record.result}</div>
                    
                    <button 
                      onClick={() => setExpression(record.expression)}
                      className="absolute right-10 top-1/2 -translate-y-1/2 rounded-full p-2 opacity-100 transition-opacity hover:bg-[var(--surface-hover)] md:opacity-0 md:group-hover:opacity-100"
                      title="Copiar expresión"
                    >
                      <CornerDownLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeHistoryItem(record.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-red-500 opacity-100 transition-opacity hover:bg-[var(--surface-hover)] md:opacity-0 md:group-hover:opacity-100"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
