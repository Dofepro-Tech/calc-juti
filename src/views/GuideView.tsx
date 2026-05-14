import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const basicExamples = ['2+2', '10/4', '7*8', '2^3'];
const scientificExamples = ['sin(pi/2)', 'cos(0)', 'tan(pi/4)', 'log(100)', 'ln(e)', 'sqrt(16)', 'exp(1)'];

export function GuideView() {
  const navigate = useNavigate();

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/calculator');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-[var(--border)] space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--primary)]">Guía de Uso</h2>
            <p className="mt-2 opacity-70">
              Aquí tienes una referencia rápida para usar la calculadora, entender las funciones científicas y saber cómo funciona el acceso con Google.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            title="Cerrar guía"
            className="shrink-0 rounded-2xl border border-[var(--border)] p-2 text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="space-y-4">
          <h3 className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-2">Cálculo Rápido</h3>
          <div className="flex flex-wrap gap-2">
            {basicExamples.map((example) => (
              <span key={example} className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 font-mono text-sm">
                {example}
              </span>
            ))}
          </div>
          <p className="opacity-70 text-sm">
            Puedes escribir operaciones normales con +, -, *, /, %, ^ y factorial !. El botón = ahora ocupa el espacio a la derecha del punto en la última fila.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-2">Funciones Científicas</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {scientificExamples.map((example) => (
              <div key={example} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                <div className="font-mono text-sm font-semibold text-[var(--primary)]">{example}</div>
              </div>
            ))}
          </div>
          <div className="text-sm opacity-70 space-y-2">
            <p>Las funciones sin, cos, tan, log, ln, sqrt y exp abren paréntesis automáticamente.</p>
            <p>Al calcular, la app cierra los paréntesis pendientes por ti.</p>
            <p>Trigonometría usa radianes. log es base 10. ln es logaritmo natural.</p>
            <p>Puedes usar pi y e como constantes y también mezclar funciones con multiplicación implícita, por ejemplo 2sin(pi/2) o 3(pi).</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-2">Historial</h3>
          <p className="opacity-70 text-sm">
            El historial se puede plegar y desplegar desde la propia calculadora. Al repetir una operación, también puedes recuperar expresiones anteriores desde ese panel.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-2">Acceso y Registro</h3>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-4 text-sm opacity-80 space-y-2">
            <p>El botón Acceder / Registrarse usa Google. Si es la primera vez, Firebase crea la cuenta automáticamente con ese mismo flujo.</p>
            <p>Para que funcione al desplegar, debes agregar localhost y también tu dominio final en Firebase Authentication &gt; Settings &gt; Authorized domains.</p>
            <p>Si el dominio no está autorizado o el navegador bloquea la ventana emergente, la app ahora muestra el motivo en pantalla.</p>
            <p>Notas y favoritos dependen de ese acceso.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-2">Instalar como App</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-4 text-sm opacity-80 space-y-2">
              <p className="font-semibold text-[var(--primary)]">Android o escritorio</p>
              <p>Usa el botón Instalar app de la barra superior cuando aparezca. Si no aparece, abre la app en Chrome o Edge y busca la opción Instalar app en el menú del navegador.</p>
              <p>La app puede abrirse a pantalla completa y quedar como acceso directo sin Play Store.</p>
              <p>Si en Android el icono te sale con el logo de Edge o Chrome, ese acceso es un atajo del navegador: elimínalo y vuelve a instalar la app correctamente.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-4 text-sm opacity-80 space-y-2">
              <p className="font-semibold text-[var(--primary)]">iPhone o iPad</p>
              <p>Abre la app en Safari, toca Compartir y luego Añadir a pantalla de inicio.</p>
              <p>El icono y el nombre ya quedan preparados para instalarla como acceso directo.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-4 text-sm opacity-80 space-y-2">
            <p className="font-semibold text-[var(--primary)]">Descarga e instalación</p>
            <p>La versión actual se instala como PWA desde el navegador. No descarga un archivo APK o EXE independiente.</p>
            <p>El aviso de actualización también funciona en web y escritorio cuando la persona tiene abierta una versión anterior y publicas una nueva.</p>
            <p>Si luego quieres un instalador real para Android o escritorio, hay que empaquetar la app como proyecto nativo por separado.</p>
          </div>
        </section>
      </div>
    </div>
  );
}