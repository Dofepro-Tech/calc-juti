import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, Timestamp, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { X, Plus, Edit2, Check } from 'lucide-react';
import { useAuthUser } from '../hooks/useAuthUser';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

function formatFirestoreDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date().toISOString();
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuthUser();

  useEffect(() => {
    if (user) {
      loadNotes();
    } else {
      setNotes([]);
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, `users/${user.uid}/notes`),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const nts = snapshot.docs.map((item) => {
        const data = item.data();

        return {
          id: item.id,
          title: String(data.title ?? ''),
          content: String(data.content ?? ''),
          updatedAt: formatFirestoreDate(data.updatedAt),
        };
      });
      setNotes(nts);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/notes`);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!user) {
      alert("Inicia sesión para guardar notas");
      return;
    }
    if (!title.trim() || !content.trim()) return;

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
      };

      if (editingId) {
        await updateDoc(doc(db, `users/${user.uid}/notes`, editingId), {
           ...payload,
           updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, `users/${user.uid}/notes`), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setTitle('');
      setContent('');
      setEditingId(null);
      loadNotes();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/notes`);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, id));
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/notes/${id}`);
    }
  };

  const editNote = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Editor Panel */}
      <div className="md:w-1/2 flex flex-col space-y-4 bg-[var(--surface)] p-6 rounded-3xl shadow-sm border border-[var(--border)] relative">
        {authLoading ? (
          <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
            <h3 className="font-serif font-bold text-xl mb-2 text-[var(--primary)]">Verificando acceso</h3>
            <p className="opacity-70">Esperando la respuesta de tu sesión de Google...</p>
          </div>
        ) : !user && (
          <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
            <h3 className="font-serif font-bold text-xl mb-2 text-[var(--primary)]">Acceso Requerido</h3>
            <p className="opacity-70">Inicia sesión en la parte superior para crear y sincronizar tus notas.</p>
          </div>
        )}
        
        <h2 className="text-2xl font-serif font-bold text-[var(--primary)]">
          {editingId ? 'Editar Nota' : 'Nueva Nota'}
        </h2>
        
        <input 
          type="text"
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="bg-[var(--bg)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium"
        />
        
        <textarea 
          placeholder="Contenido de la nota..."
          value={content}
          onChange={e => setContent(e.target.value)}
          className="flex-1 bg-[var(--bg)] border border-[var(--border)] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
        />
        
        <div className="flex gap-2 justify-end">
          {editingId && (
            <button 
              onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
              className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors"
            >
              Cancelar
            </button>
          )}
          <button 
            onClick={saveNote}
            disabled={!title.trim() || !content.trim()}
            className="px-6 py-2 rounded-xl text-[var(--bg)] bg-[var(--primary)] text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? 'Guardar Cambios' : 'Añadir Nota'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="md:w-1/2 flex flex-col bg-[var(--bg)] border border-[var(--border)] rounded-3xl p-6 overflow-hidden">
        <h3 className="font-serif font-bold text-lg mb-4 text-[var(--primary)]">Tus Notas</h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
           {loading ? (
             <div className="text-center py-10 opacity-50">Cargando...</div>
           ) : notes.length === 0 ? (
             <div className="text-center py-10 opacity-50">No tienes notas guardadas.</div>
           ) : (
             notes.map(note => (
               <div key={note.id} className="group relative bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                  <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" title="Editar nota" onClick={() => editNote(note)} className="p-1.5 text-gray-500 hover:text-[var(--primary)] rounded-full hover:bg-[var(--surface-hover)]"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" title="Eliminar nota" onClick={() => deleteNote(note.id)} className="p-1.5 text-red-500 rounded-full hover:bg-[var(--surface-hover)]"><X className="w-4 h-4" /></button>
                  </div>
                  <h4 className="font-bold mb-1 pr-10 truncate font-serif">{note.title}</h4>
                  <p className="text-sm opacity-70 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-3 text-xs opacity-40 font-mono">
                     {new Date(note.updatedAt).toLocaleString()}
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
