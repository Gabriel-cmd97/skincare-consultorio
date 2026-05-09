'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface Cita {
  id: string;
  paciente_nombre: string;
  paciente_email: string;
  paciente_telefono: string;
  fecha_hora: string;
  tipo_tratamiento: string;
  estado: string;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'confirmada' | 'pendiente' | 'cancelada'>('todas');
  
  // Estado para la fecha seleccionada y el mes que se muestra
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [mesActual, setMesActual] = useState<Date>(new Date());

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
      setCitas(data || []);
    } catch (error) {
      console.error('Error fetching citas:', error);
    } finally {
      setLoading(false);
    }
  }

  // Generar los días de la semana actual para el mini-calendario
  const getDiasSemana = () => {
    const dias = [];
    const inicioSemana = new Date(mesActual);
    // Ajustar al lunes de la semana de mesActual
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

  // Filtrado de citas por estado Y por fecha seleccionada
  const citasFiltradas = citas.filter((c) => {
    const fechaCita = new Date(c.fecha_hora);
    const mismoDia = fechaCita.toDateString() === fechaSeleccionada.toDateString();
    const estadoOk = filtroEstado === 'todas' || c.estado === filtroEstado;
    return mismoDia && estadoOk;
  });

  const estadoConfig: Record<string, { label: string; bg: string; text: string }> = {
    confirmada: { label: 'Confirmada', bg: 'bg-green-100', text: 'text-green-700' },
    pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
    cancelada: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-600' },
  };

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
        <button 
          onClick={() => window.location.href = '/#citas'}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Nueva Cita
        </button>
      </header>

      {/* Navegador de Calendario */}
      <div className="bg-white rounded-[32px] border border-primary-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif font-bold text-primary-900 text-2xl">
              {MESES[mesActual.getMonth()]} <span className="text-primary-300 font-sans font-medium text-lg">{mesActual.getFullYear()}</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => cambiarSemana(-1)}
              className="p-3 rounded-2xl border border-primary-100 text-primary-600 hover:bg-primary-50 transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => setMesActual(new Date())}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-500 hover:text-primary-900 transition"
            >
              Hoy
            </button>
            <button 
              onClick={() => cambiarSemana(1)}
              className="p-3 rounded-2xl border border-primary-100 text-primary-600 hover:bg-primary-50 transition shadow-sm"
            >
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
                <span className={`text-xl font-serif font-bold`}>
                  {dia.getDate()}
                </span>
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

      {/* Lista de Citas para el Día Seleccionado */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            <p className="text-primary-400 mt-4 font-medium italic">Sincronizando agenda...</p>
          </div>
        ) : citasFiltradas.length > 0 ? (
          citasFiltradas.map((cita) => {
            const fecha = new Date(cita.fecha_hora);
            const cfg = estadoConfig[cita.estado] || estadoConfig.pendiente;
            return (
              <div
                key={cita.id}
                className="bg-white rounded-[32px] border border-primary-50 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col sm:flex-row items-center gap-6 group"
              >
                <div className="w-16 h-16 bg-primary-900 text-white rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
                   <span className="text-xs font-bold uppercase">{fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}).split(':')[0]}</span>
                   <span className="text-lg font-serif font-bold tracking-tighter">:{fecha.toLocaleTimeString([], {minute:'2-digit'})}</span>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-primary-900">{cita.paciente_nombre}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-1">
                    <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">{cita.tipo_tratamiento}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-4 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
    </div>
  );
}
