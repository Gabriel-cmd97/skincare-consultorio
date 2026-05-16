'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Users, Calendar, Activity, TrendingUp, Clock, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [totalPacientes, setTotalPacientes] = useState<number | null>(null);
  const [totalCitas, setTotalCitas] = useState<number | null>(null);
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Totales globales
      const { count: cp } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
      const { count: cc } = await supabase.from('citas').select('*', { count: 'exact', head: true });
      setTotalPacientes(cp ?? 0);
      setTotalCitas(cc ?? 0);

      // Citas de HOY — reales desde Supabase
      const hoyInicio = new Date();
      hoyInicio.setHours(0, 0, 0, 0);
      const hoyFin = new Date();
      hoyFin.setHours(23, 59, 59, 999);

      const { data: citas } = await supabase
        .from('citas')
        .select('*')
        .gte('fecha_hora', hoyInicio.toISOString())
        .lte('fecha_hora', hoyFin.toISOString())
        .order('fecha_hora', { ascending: true });

      setCitasHoy(citas || []);
      setLoadingCitas(false);
    }
    fetchStats();
  }, []);

  const citasConfirmadas = citasHoy.filter(c => c.estado === 'confirmada').length;
  const citasPendientes = citasHoy.filter(c => c.estado === 'pendiente').length;

  const stats = [
    {
      label: 'Total Pacientes',
      value: totalPacientes ?? '—',
      sub: 'en expediente',
      color: 'bg-primary-50 text-primary-600',
      icon: <Users className="w-6 h-6" />,
      href: '/dashboard/pacientes',
    },
    {
      label: 'Citas Hoy',
      value: loadingCitas ? '…' : citasHoy.length,
      sub: `${citasConfirmadas} confirmada${citasConfirmadas !== 1 ? 's' : ''}`,
      color: 'bg-rose-50 text-rose-600',
      icon: <Calendar className="w-6 h-6" />,
      href: '/dashboard/agenda',
    },
    {
      label: 'Total Citas',
      value: totalCitas ?? '—',
      sub: 'historial completo',
      color: 'bg-emerald-50 text-emerald-600',
      icon: <Activity className="w-6 h-6" />,
      href: '/dashboard/agenda',
    },
    {
      label: 'Pendientes Hoy',
      value: loadingCitas ? '…' : citasPendientes,
      sub: 'por confirmar',
      color: 'bg-amber-50 text-amber-600',
      icon: <TrendingUp className="w-6 h-6" />,
      href: '/dashboard/agenda',
    },
  ];

  const estadoConfig: Record<string, { label: string; bg: string; text: string }> = {
    confirmada: { label: 'Confirmada', bg: 'bg-green-100', text: 'text-green-700' },
    pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
    cancelada: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-600' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <header>
        <p className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="text-4xl font-serif font-bold text-primary-900">Panel de Control</h1>
        <p className="text-primary-500 mt-1">Resumen clínico de LR Fisioderm</p>
      </header>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="bg-white p-6 rounded-[28px] shadow-sm border border-primary-50 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-primary-900">{stat.value}</p>
              <p className="text-xs font-bold text-primary-500 mt-1">{stat.label}</p>
              <p className="text-xs text-primary-300 mt-0.5">{stat.sub}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Citas de Hoy (REALES) + Accesos Rápidos */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Citas de Hoy — datos REALES de Supabase */}
        <div className="lg:col-span-2 bg-white rounded-[28px] border border-primary-50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-primary-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif font-bold text-primary-900">Citas de Hoy</h2>
              <p className="text-xs text-primary-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <a href="/dashboard/agenda" className="text-primary-500 hover:text-primary-700 flex items-center gap-1 text-sm font-bold transition">
              Ver todo <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="divide-y divide-primary-50">
            {loadingCitas ? (
              <div className="px-6 py-12 text-center text-primary-300 text-sm animate-pulse">
                Sincronizando agenda...
              </div>
            ) : citasHoy.length === 0 ? (
              <div className="px-6 py-14 text-center space-y-2">
                <p className="text-5xl">🗓️</p>
                <p className="text-primary-600 font-bold mt-3">Sin citas para hoy</p>
                <p className="text-primary-300 text-sm">¡Disfruta tu día libre o gestiona tu agenda!</p>
              </div>
            ) : (
              citasHoy.map((cita) => {
                const hora = new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
                const cfg = estadoConfig[cita.estado] || estadoConfig.pendiente;
                return (
                  <a
                    key={cita.id}
                    href="/dashboard/agenda"
                    className="px-6 py-4 flex items-center justify-between hover:bg-primary-50/30 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                        {(cita.paciente_nombre || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-primary-900 text-sm">{cita.paciente_nombre}</p>
                        <p className="text-xs text-primary-400">{cita.tipo_tratamiento}</p>
                        {cita.paciente_telefono && (
                          <p className="text-xs text-primary-300">{cita.paciente_telefono}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary-600">{hora} hrs</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>

        {/* Accesos Rápidos + QR */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-primary-900">Accesos Rápidos</h2>
            {[
              { href: '/dashboard/pacientes', label: 'Gestionar Pacientes', sub: `${totalPacientes ?? '…'} en expediente`, color: 'bg-primary-600 hover:bg-primary-700 text-white' },
              { href: '/dashboard/agenda', label: 'Ver Agenda Completa', sub: `${loadingCitas ? '…' : citasHoy.length} citas hoy`, color: 'bg-white border border-primary-100 hover:bg-primary-50 text-primary-900' },
              { href: '/dashboard/tips', label: 'Publicar Contenido PWA', sub: 'Tips y Rutinas', color: 'bg-white border border-primary-100 hover:bg-primary-50 text-primary-900' },
              { href: '/dashboard/configuracion', label: 'Personalización', sub: 'Logo y colores', color: 'bg-white border border-primary-100 hover:bg-primary-50 text-primary-900' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl transition shadow-sm group ${item.color}`}
              >
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className={`text-xs mt-0.5 ${item.color.includes('text-white') ? 'text-primary-200' : 'text-primary-400'}`}>{item.sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>

          {/* QR para Pacientes */}
          <div className="bg-primary-50 rounded-[28px] p-6 border border-primary-100 flex flex-col items-center text-center">
            <h3 className="font-serif font-bold text-primary-900 text-sm">Comparte la App</h3>
            <p className="text-[10px] text-primary-500 mt-1 uppercase tracking-widest font-bold">Portal Pacientes</p>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-primary-100 mt-4 mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${typeof window !== 'undefined' ? window.location.origin : ''}/pwa&color=4d302a`}
                alt="QR Portal Pacientes"
                className="w-32 h-32"
              />
            </div>
            <p className="text-[10px] text-primary-400 leading-tight">
              Muestra este QR a tus pacientes para que instalen su portal de seguimiento en el celular.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
