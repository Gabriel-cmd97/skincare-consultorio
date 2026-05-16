'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { X, Phone, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface Cita {
  id: string;
  paciente_nombre: string;
  paciente_email: string;
  paciente_telefono: string;
  fecha_hora: string;
  tipo_tratamiento: string;
  estado: string;
  es_primera_vez?: boolean;
  notas_adicionales?: string;
}

function daysFromNow(n: number, hours = 10, mins = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
}

const CITAS_FICTICIAS: Cita[] = [
  { id: 'c1', paciente_nombre: 'Ana García Ruiz', paciente_email: 'ana@email.com', paciente_telefono: '555-0101', fecha_hora: daysFromNow(0, 9, 0), tipo_tratamiento: 'Limpieza Profunda', estado: 'confirmada' },
  { id: 'c2', paciente_nombre: 'Lucía Fernández Sosa', paciente_email: 'lucia@email.com', paciente_telefono: '555-0202', fecha_hora: daysFromNow(0, 11, 30), tipo_tratamiento: 'Valoración Inicial', estado: 'pendiente' },
  { id: 'c3', paciente_nombre: 'María Torres Vega', paciente_email: 'maria@email.com', paciente_telefono: '555-0303', fecha_hora: daysFromNow(0, 16, 0), tipo_tratamiento: 'Seguimiento', estado: 'pendiente' },
  { id: 'c4', paciente_nombre: 'Mariana Pérez Cano', paciente_email: 'mariana@email.com', paciente_telefono: '555-0404', fecha_hora: daysFromNow(1, 10, 0), tipo_tratamiento: 'Peeling Químico', estado: 'confirmada' },
  { id: 'c5', paciente_nombre: 'Carlos Martínez', paciente_email: 'carlos@email.com', paciente_telefono: '555-0505', fecha_hora: daysFromNow(2, 9, 30), tipo_tratamiento: 'Dermapen', estado: 'pendiente' },
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  confirmada: { label: 'Confirmada', bg: 'bg-green-100', text: 'text-green-700' },
  pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
  cancelada: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-600' },
};

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'confirmada' | 'pendiente' | 'cancelada'>('todas');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [mesActual, setMesActual] = useState<Date>(new Date());

  // Modal de edición/detalle
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    fetchCitas();
  }, []);

  async function fetchCitas() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('citas')
        .select('*')
        .order('fecha_hora', { ascending: true });
      if (error) throw error;
      setCitas(data && data.length > 0 ? data : CITAS_FICTICIAS);
    } catch {
      setCitas(CITAS_FICTICIAS);
    } finally {
      setLoading(false);
    }
  }

  async function handleCambiarEstado(id: string, nuevoEstado: string) {
    setCambiandoEstado(true);
    try {
      const { error } = await supabase.from('citas').update({ estado: nuevoEstado }).eq('id', id);
      if (error) throw error;
      // Actualizar estado local sin recargar todo
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
      if (citaSeleccionada?.id === id) {
        setCitaSeleccionada(prev => prev ? { ...prev, estado: nuevoEstado } : null);
      }
    } catch {
      alert('Error al cambiar el estado.');
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return;
    try {
      const { error } = await supabase.from('citas').delete().eq('id', id);
      if (error) throw error;
      setCitas(prev => prev.filter(c => c.id !== id));
      setCitaSeleccionada(null);
    } catch {
      alert('Error al eliminar la cita.');
    }
  }

  const getDiasSemana = () => {
    const dias = [];
    const inicioSemana = new Date(mesActual);
    const diff = inicioSemana.getDate() - inicioSemana.getDay() + (inicioSemana.getDay() === 0 ? -6 : 1);
    inicioSemana.setDate(diff);
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana);
      d.setDate(inicioSemana.getDate() + i);
      dias.push(d);
    }
    return dias;
  };

  const cambiarSemana = (offset: number) => {
    const nuevaFecha = new Date(mesActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + (offset * 7));
    setMesActual(nuevaFecha);
  };

  const citasFiltradas = citas.filter((c) => {
    const fechaCita = new Date(c.fecha_hora);
    const mismoDia = fechaCita.toDateString() === fechaSeleccionada.toDateString();
    const estadoOk = filtroEstado === 'todas' || c.estado === filtroEstado;
    return mismoDia && estadoOk;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary-900">Tu Agenda</h1>
          <p className="text-primary-500 mt-1 capitalize">
            {fechaSeleccionada.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <a
          href="/#citas"
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Nueva Cita
        </a>
      </header>

      {/* Navegador de Calendario */}
      <div className="bg-white rounded-[32px] border border-primary-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif font-bold text-primary-900 text-2xl">
            {MESES[mesActual.getMonth()]} <span className="text-primary-300 font-sans font-medium text-lg">{mesActual.getFullYear()}</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={() => cambiarSemana(-1)} className="p-3 rounded-2xl border border-primary-100 text-primary-600 hover:bg-primary-50 transition shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => { setMesActual(new Date()); setFechaSeleccionada(new Date()); }} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-500 hover:text-primary-900 transition">
              Hoy
            </button>
            <button onClick={() => cambiarSemana(1)} className="p-3 rounded-2xl border border-primary-100 text-primary-600 hover:bg-primary-50 transition shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 sm:gap-4">
          {getDiasSemana().map((dia) => {
            const tieneCitas = citas.some(c => new Date(c.fecha_hora).toDateString() === dia.toDateString());
            const esHoy = dia.toDateString() === new Date().toDateString();
            const esSeleccionado = dia.toDateString() === fechaSeleccionada.toDateString();
            return (
              <button
                key={dia.toISOString()}
                onClick={() => setFechaSeleccionada(dia)}
                className={`group flex flex-col items-center gap-2 py-4 rounded-[24px] transition-all duration-300 relative ${
                  esSeleccionado
                    ? 'bg-primary-600 text-white shadow-xl scale-105 z-10'
                    : esHoy
                      ? 'bg-primary-50 text-primary-900'
                      : 'hover:bg-primary-50 text-primary-900'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-widest ${esSeleccionado ? 'text-primary-100' : 'text-primary-400'}`}>
                  {DIAS_SEMANA[dia.getDay()]}
                </span>
                <span className="text-xl font-serif font-bold">{dia.getDate()}</span>
                {tieneCitas && (
                  <div className={`w-1.5 h-1.5 rounded-full absolute bottom-3 ${esSeleccionado ? 'bg-white' : 'bg-primary-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros de Estado */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {(['todas', 'confirmada', 'pendiente', 'cancelada'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              filtroEstado === f
                ? 'bg-primary-900 text-white shadow-lg'
                : 'bg-white text-primary-400 border border-primary-100 hover:bg-primary-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista de Citas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            <p className="text-primary-400 mt-4 font-medium italic">Sincronizando agenda...</p>
          </div>
        ) : citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => {
            const fecha = new Date(cita.fecha_hora);
            const cfg = ESTADO_CONFIG[cita.estado] || ESTADO_CONFIG.pendiente;
            return (
              <div
                key={cita.id}
                className="bg-white rounded-[32px] border border-primary-50 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col sm:flex-row items-center gap-6 group"
              >
                {/* Hora */}
                <div className="w-20 h-16 bg-primary-900 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-xl font-serif font-bold tracking-tighter">
                    {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-primary-900">{cita.paciente_nombre}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-1">
                    <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">{cita.tipo_tratamiento}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    {cita.es_primera_vez && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-blue-100 text-blue-600">
                        1ª vez
                      </span>
                    )}
                  </div>
                  {cita.paciente_telefono && (
                    <p className="text-xs text-primary-300 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                      <Phone className="w-3 h-3" /> {cita.paciente_telefono}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {/* Confirmar rápido */}
                  {cita.estado === 'pendiente' && (
                    <button
                      onClick={() => handleCambiarEstado(cita.id, 'confirmada')}
                      disabled={cambiandoEstado}
                      title="Confirmar cita"
                      className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {/* Cancelar rápido */}
                  {cita.estado !== 'cancelada' && (
                    <button
                      onClick={() => handleCambiarEstado(cita.id, 'cancelada')}
                      disabled={cambiandoEstado}
                      title="Cancelar cita"
                      className="p-3 bg-amber-50 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                  {/* Ver detalles */}
                  <button
                    onClick={() => setCitaSeleccionada(cita)}
                    title="Ver detalles"
                    className="p-3 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(cita.id)}
                    title="Eliminar cita"
                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-primary-50/50 rounded-[40px] border-2 border-dashed border-primary-100 py-24 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-10 h-10 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-primary-900">No hay citas para este día</h3>
            <p className="text-primary-400 max-w-xs mx-auto mt-2 text-sm">Disfruta de tu tiempo libre o aprovecha para adelantar tareas administrativas.</p>
          </div>
        )}
      </div>

      {/* Modal de detalles de cita */}
      {citaSeleccionada && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" onClick={() => setCitaSeleccionada(null)} />
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            {/* Header del modal */}
            <div className="p-6 border-b border-primary-50 flex justify-between items-center bg-primary-50/50">
              <div>
                <h2 className="text-xl font-serif font-bold text-primary-900">Detalle de Cita</h2>
                <p className="text-xs text-primary-400 mt-0.5">
                  {new Date(citaSeleccionada.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} — {new Date(citaSeleccionada.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })} hrs
                </p>
              </div>
              <button onClick={() => setCitaSeleccionada(null)} className="text-primary-300 hover:text-primary-600 transition p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Datos del paciente */}
              <div className="space-y-3">
                {[
                  { label: 'Paciente', value: citaSeleccionada.paciente_nombre },
                  { label: 'Teléfono', value: citaSeleccionada.paciente_telefono || '—' },
                  { label: 'Tratamiento', value: citaSeleccionada.tipo_tratamiento },
                  { label: '¿Primera vez?', value: citaSeleccionada.es_primera_vez ? 'Sí' : 'No' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center bg-primary-50 rounded-2xl px-4 py-3">
                    <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">{item.label}</span>
                    <span className="font-bold text-primary-900 text-sm">{item.value}</span>
                  </div>
                ))}
                {citaSeleccionada.notas_adicionales && (
                  <div className="bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Notas / Alergias</p>
                    <p className="text-sm text-amber-900">{citaSeleccionada.notas_adicionales}</p>
                  </div>
                )}
              </div>

              {/* Cambio de estado */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary-400 uppercase tracking-wider">Cambiar Estado</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['confirmada', 'pendiente', 'cancelada'] as const).map((estado) => {
                    const cfg = ESTADO_CONFIG[estado];
                    const esActual = citaSeleccionada.estado === estado;
                    return (
                      <button
                        key={estado}
                        onClick={() => handleCambiarEstado(citaSeleccionada.id, estado)}
                        disabled={cambiandoEstado || esActual}
                        className={`py-3 px-2 rounded-2xl text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                          esActual
                            ? `${cfg.bg} ${cfg.text} ring-2 ring-offset-1 ring-current`
                            : 'bg-primary-50 text-primary-400 hover:bg-primary-100 disabled:opacity-50'
                        }`}
                      >
                        {cambiandoEstado && esActual ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-2">
                {citaSeleccionada.paciente_telefono && (
                  <a
                    href={`https://wa.me/${citaSeleccionada.paciente_telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${citaSeleccionada.paciente_nombre}, te confirmamos tu cita para ${citaSeleccionada.tipo_tratamiento} el ${new Date(citaSeleccionada.fecha_hora).toLocaleDateString('es-MX')} a las ${new Date(citaSeleccionada.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })} hrs. ¡Te esperamos!`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition text-center text-sm flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                <button
                  onClick={() => { handleDelete(citaSeleccionada.id); }}
                  className="px-5 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-2xl transition text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
