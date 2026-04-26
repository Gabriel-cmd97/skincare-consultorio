'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface Cita {
  id: string;
  paciente_nombre: string;
  paciente_email: string;
  fecha_hora: string;
  tipo_tratamiento: string;
  estado: string;
}

// Genera fechas relativas a hoy
function daysFromNow(n: number, hours = 10, mins = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
}

const CITAS_FICTICIAS: Cita[] = [
  { id: 'c1', paciente_nombre: 'Ana García Ruiz', paciente_email: 'ana@email.com', fecha_hora: daysFromNow(0, 9, 0), tipo_tratamiento: 'Limpieza Profunda', estado: 'confirmada' },
  { id: 'c2', paciente_nombre: 'Lucía Fernández Sosa', paciente_email: 'lucia@email.com', fecha_hora: daysFromNow(0, 11, 30), tipo_tratamiento: 'Valoración Inicial', estado: 'confirmada' },
  { id: 'c3', paciente_nombre: 'María Torres Vega', paciente_email: 'maria@email.com', fecha_hora: daysFromNow(0, 16, 0), tipo_tratamiento: 'Seguimiento', estado: 'pendiente' },
  { id: 'c4', paciente_nombre: 'Mariana Pérez Cano', paciente_email: 'mariana@email.com', fecha_hora: daysFromNow(1, 10, 0), tipo_tratamiento: 'Peeling Químico', estado: 'confirmada' },
  { id: 'c5', paciente_nombre: 'Carlos Martínez', paciente_email: 'carlos@email.com', fecha_hora: daysFromNow(2, 9, 30), tipo_tratamiento: 'Dermapen', estado: 'pendiente' },
  { id: 'c6', paciente_nombre: 'Roberto Díaz Valdés', paciente_email: 'roberto@email.com', fecha_hora: daysFromNow(3, 11, 0), tipo_tratamiento: 'Control Acné', estado: 'confirmada' },
  { id: 'c7', paciente_nombre: 'Ana García Ruiz', paciente_email: 'ana@email.com', fecha_hora: daysFromNow(5, 10, 0), tipo_tratamiento: 'Seguimiento Anti-manchas', estado: 'pendiente' },
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'confirmada' | 'pendiente' | 'cancelada'>('todas');
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(new Date().getDate());

  useEffect(() => {
    fetchCitas();
  }, []);

  async function fetchCitas() {
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

  // Mini calendario — semana actual
  const hoy = new Date();
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(hoy.getDate() - hoy.getDay() + i);
    return d;
  });

  const citasFiltradas = citas.filter((c) => {
    const estadoOk = filtroEstado === 'todas' || c.estado === filtroEstado;
    return estadoOk;
  });

  const estadoConfig: Record<string, { label: string; bg: string; text: string }> = {
    confirmada: { label: 'Confirmada', bg: 'bg-green-100', text: 'text-green-700' },
    pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
    cancelada: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-600' },
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary-900">Agenda</h1>
          <p className="text-primary-500 mt-1">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <a 
          href="/#citas" 
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Agendar Cita
        </a>
      </header>

      {/* Mini Calendario Semanal */}
      <div className="bg-white rounded-[28px] border border-primary-50 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-bold text-primary-900 text-lg">
            {MESES[hoy.getMonth()]} {hoy.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl border border-primary-100 text-primary-400 hover:bg-primary-50 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="p-2 rounded-xl border border-primary-100 text-primary-400 hover:bg-primary-50 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {semana.map((dia) => {
            const tienesCita = citas.some((c) => new Date(c.fecha_hora).toDateString() === dia.toDateString());
            const esHoy = dia.toDateString() === hoy.toDateString();
            const seleccionado = dia.getDate() === diaSeleccionado;
            return (
              <button
                key={dia.toISOString()}
                onClick={() => setDiaSeleccionado(dia.getDate())}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${
                  seleccionado ? 'bg-primary-600 text-white shadow-md' : esHoy ? 'bg-primary-50' : 'hover:bg-primary-50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${seleccionado ? 'text-primary-200' : 'text-primary-400'}`}>
                  {DIAS_SEMANA[dia.getDay()]}
                </span>
                <span className={`text-lg font-serif font-bold ${seleccionado ? 'text-white' : 'text-primary-900'}`}>
                  {dia.getDate()}
                </span>
                {tienesCita && (
                  <div className={`w-1.5 h-1.5 rounded-full ${seleccionado ? 'bg-white/60' : 'bg-primary-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        {(['todas', 'confirmada', 'pendiente', 'cancelada'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all ${
              filtroEstado === f
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-primary-400 border border-primary-100 hover:border-primary-200'
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
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            <p className="text-primary-300 text-sm italic mt-4">Cargando agenda...</p>
          </div>
        ) : citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => {
            const fecha = new Date(cita.fecha_hora);
            const cfg = estadoConfig[cita.estado] ?? estadoConfig['pendiente'];
            return (
              <div
                key={cita.id}
                className="bg-white rounded-[28px] border border-primary-50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-6 group"
              >
                {/* Fecha */}
                <div className="bg-primary-50 rounded-2xl p-4 text-center min-w-[72px] flex-shrink-0">
                  <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{MESES[fecha.getMonth()]}</p>
                  <p className="text-3xl font-serif font-bold text-primary-900 leading-none mt-1">{fecha.getDate()}</p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                      {cita.paciente_nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <h3 className="font-bold text-primary-900 truncate">{cita.paciente_nombre}</h3>
                  </div>
                  <p className="text-sm text-primary-500 flex items-center gap-2 ml-11">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs
                  </p>
                </div>

                {/* Tipo y estado */}
                <div className="flex flex-wrap sm:flex-col gap-2 sm:items-end">
                  <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                    {cita.tipo_tratamiento || 'General'}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    title="Confirmar"
                    className="p-3 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button
                    title="Cancelar"
                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-primary-50 rounded-[32px] border border-dashed border-primary-200 py-20 text-center">
            <svg className="w-12 h-12 text-primary-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-primary-300 italic">No hay citas con este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
