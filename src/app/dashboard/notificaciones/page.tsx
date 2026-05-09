'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  enlace: string;
  created_at: string;
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones();

    // Suscripción en tiempo real a nuevas notificaciones
    const channel = supabase
      .channel('notificaciones_cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificaciones' }, payload => {
        fetchNotificaciones();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchNotificaciones() {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotificaciones(data as Notificacion[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLeida(id: string) {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', id);
        
      if (error) throw error;
      // Actualizar estado local optimísticamente
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error('Error actualizando notificación:', error);
    }
  }

  async function marcarTodasLeidas() {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('leida', false);
        
      if (error) throw error;
      setNotificaciones(prev => 
        prev.map(n => ({ ...n, leida: true }))
      );
    } catch (error) {
      console.error('Error actualizando todas las notificaciones:', error);
    }
  }

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'cita': return '📅';
      case 'pedido': return '🛍️';
      case 'paciente': return '👤';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header Mobile First */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-100">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary-900 flex items-center gap-2">
            Notificaciones
            {noLeidas > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {noLeidas} nuevas
              </span>
            )}
          </h1>
          <p className="text-sm text-primary-500 mt-1">Mantente al tanto de lo que sucede en el consultorio</p>
        </div>
        
        {noLeidas > 0 && (
          <button 
            onClick={marcarTodasLeidas}
            className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors"
          >
            Marcar todas leídas
          </button>
        )}
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {notificaciones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-primary-200">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-primary-600 font-medium">No tienes notificaciones en este momento.</p>
          </div>
        ) : (
          notificaciones.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                notif.leida 
                  ? 'bg-white border-stone-100 opacity-70' 
                  : 'bg-primary-50 border-primary-200 shadow-sm relative'
              }`}
            >
              {!notif.leida && (
                <div className="absolute top-5 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
              
              <div className="flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                  notif.leida ? 'bg-stone-100' : 'bg-white shadow-sm'
                }`}>
                  {getIconForType(notif.tipo)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1 pr-4">
                    <h3 className={`font-bold ${notif.leida ? 'text-primary-800' : 'text-primary-900'}`}>
                      {notif.titulo}
                    </h3>
                  </div>
                  <p className="text-sm text-primary-600 mb-3">{notif.mensaje}</p>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary-400">
                      {new Date(notif.created_at).toLocaleString('es-ES', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                    
                    {notif.enlace && (
                      <Link 
                        href={notif.enlace}
                        onClick={() => !notif.leida && marcarComoLeida(notif.id)}
                        className="text-[11px] font-bold text-primary-600 bg-white border border-primary-100 px-3 py-1 rounded-md hover:bg-primary-50 transition-colors ml-auto"
                      >
                        Ver detalles
                      </Link>
                    )}
                    
                    {!notif.leida && !notif.enlace && (
                      <button 
                        onClick={() => marcarComoLeida(notif.id)}
                        className="text-[11px] font-bold text-primary-500 hover:text-primary-700 ml-auto"
                      >
                        Marcar leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
