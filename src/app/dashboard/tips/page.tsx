'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface Tip {
  id: string;
  titulo: string;
  contenido: string;
  tipo: 'tip' | 'rutina';
  imagen_url?: string;
  video_url?: string;
}

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState<Partial<Tip> | null>(null);

  useEffect(() => {
    fetchTips();
  }, []);

  async function fetchTips() {
    try {
      const { data, error } = await supabase
        .from('tips_rutinas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTip?.titulo || !editingTip?.contenido) return;

    try {
      if (editingTip.id) {
        const { error } = await supabase
          .from('tips_rutinas')
          .update(editingTip)
          .eq('id', editingTip.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tips_rutinas')
          .insert([editingTip]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchTips();
    } catch (error) {
      console.error('Error saving tip:', error);
      alert('Error al guardar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este contenido?')) return;
    try {
      const { error } = await supabase.from('tips_rutinas').delete().eq('id', id);
      if (error) throw error;
      fetchTips();
    } catch (error) {
      console.error('Error deleting tip:', error);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-900">Rutinas y Tips</h1>
          <p className="text-primary-600">Crea contenido educativo para tus pacientes en la PWA.</p>
        </div>
        <button 
          onClick={() => { setEditingTip({ tipo: 'tip' }); setShowModal(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Nuevo Contenido
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 text-primary-300">Cargando contenido...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip) => (
            <div key={tip.id} className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tip.tipo === 'rutina' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                  {tip.tipo}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => { setEditingTip(tip); setShowModal(true); }} className="text-primary-400 hover:text-primary-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button onClick={() => handleDelete(tip.id)} className="text-red-300 hover:text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-primary-900 mb-2">{tip.titulo}</h3>
              <p className="text-primary-700 text-sm line-clamp-3 mb-4">{tip.contenido}</p>
              {tip.imagen_url && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-primary-50">
                  <img src={tip.imagen_url} alt={tip.titulo} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {showModal && (
        <div className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-primary-50 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-primary-900">{editingTip?.id ? 'Editar' : 'Nuevo'} Contenido</h2>
              <button onClick={() => setShowModal(false)} className="text-primary-300 hover:text-primary-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary-900 uppercase">Tipo</label>
                  <select 
                    value={editingTip?.tipo} 
                    onChange={(e) => setEditingTip({ ...editingTip, tipo: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="tip">Tip de Skincare</option>
                    <option value="rutina">Rutina Recomendada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary-900 uppercase">Título</label>
                  <input 
                    type="text" 
                    value={editingTip?.titulo || ''} 
                    onChange={(e) => setEditingTip({ ...editingTip, titulo: e.target.value })}
                    className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Rutina de Mañana"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-900 uppercase">Contenido</label>
                <textarea 
                  rows={4}
                  value={editingTip?.contenido || ''} 
                  onChange={(e) => setEditingTip({ ...editingTip, contenido: e.target.value })}
                  className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe los pasos o el consejo..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary-900 uppercase">URL de Imagen (Opcional)</label>
                  <input 
                    type="text" 
                    value={editingTip?.imagen_url || ''} 
                    onChange={(e) => setEditingTip({ ...editingTip, imagen_url: e.target.value })}
                    className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary-900 uppercase">URL de Video (Opcional)</label>
                  <input 
                    type="text" 
                    value={editingTip?.video_url || ''} 
                    onChange={(e) => setEditingTip({ ...editingTip, video_url: e.target.value })}
                    className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-700 transition">
                  Guardar
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 rounded-2xl border border-primary-100 font-bold text-primary-400 hover:bg-primary-50 transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
