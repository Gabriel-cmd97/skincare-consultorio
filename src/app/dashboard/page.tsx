'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Users, Calendar, Activity, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { crearNotificacionHibrida } from '@/actions/notificaciones';

const PACIENTES_FICTICIOS = [
  { id: 'p1', nombre: 'Ana', apellidos: 'García Ruiz', tratamiento: 'Anti-manchas', proxima: '28 Abr' },
  { id: 'p2', nombre: 'Lucía', apellidos: 'Fernández Sosa', tratamiento: 'Hidratación Profunda', proxima: '2 May' },
  { id: 'p3', nombre: 'Mariana', apellidos: 'Pérez Cano', tratamiento: 'Control Acné', proxima: '15 May' },
];

const CITAS_HOY = [
  { id: 'c1', nombre: 'Ana García', hora: '09:00', tipo: 'Limpieza Profunda', estado: 'confirmada' },
  { id: 'c2', nombre: 'Lucía Fernández', hora: '11:30', tipo: 'Valoración Inicial', estado: 'confirmada' },
  { id: 'c3', nombre: 'María Torres', hora: '16:00', tipo: 'Seguimiento', estado: 'pendiente' },
];

export default function DashboardPage() {
  const [totalPacientes, setTotalPacientes] = useState<number | null>(null);
  const [totalCitas, setTotalCitas] = useState<number | null>(null);
  const [simulando, setSimulando] = useState(false);

  const handleSimularCita = async () => {
    setSimulando(true);
    try {
      await crearNotificacionHibrida({
        titulo: 'Nueva Cita',
        mensaje: 'Paciente Test agendó una cita de Valoración mañana a las 10:00 hrs.',
        tipo: 'cita',
        enlace: '/dashboard/agenda'
      });
      alert('¡Cita simulada! Revisa el icono de notificaciones y tu WhatsApp.');
    } catch (e) {
      console.error(e);
      alert('Error simulando cita');
    } finally {
      setSimulando(false);
    }
  };

  useEffect(() => {
    async function fetchStats() {
      const { count: cp } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
      const { count: cc } = await supabase.from('citas').select('*', { count: 'exact', head: true });
      setTotalPacientes(cp ?? 5);
      setTotalCitas(cc ?? 3);
    }
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Pacientes',
      value: totalPacientes ?? 5,
      sub: '+2 este mes',
      color: 'bg-primary-50 text-primary-600',
      icon: <Users className="w-6 h-6" />,
      href: '/dashboard/pacientes',
    },
    {
      label: 'Citas Hoy',
      value: 3,
      sub: '2 confirmadas',
      color: 'bg-rose-50 text-rose-600',
      icon: <Calendar className="w-6 h-6" />,
      href: '/dashboard/agenda',
    },
    {
      label: 'Evaluaciones',
      value: totalCitas ?? 8,
      sub: 'Total historial',
      color: 'bg-emerald-50 text-emerald-600',
      icon: <Activity className="w-6 h-6" />,
      href: '/dashboard/pacientes',
    },
    {
      label: 'Retención',
      value: '94%',
      sub: 'Pacientes activos',
      color: 'bg-amber-50 text-amber-600',
      icon: <TrendingUp className="w-6 h-6" />,
      href: '/dashboard/pacientes',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <header className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <p className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-4xl font-serif font-bold text-primary-900">Panel de Control</h1>
          <p className="text-primary-500 mt-1">Resumen clínico de LR Fisioderm</p>
        </div>
        <button 
          onClick={handleSimularCita}
          disabled={simulando}
          className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {simulando ? 'Enviando...' : '🔔 Simular Cita (Notificación)'}
        </button>
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

      {/* Citas de Hoy + Accesos Rápidos */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Citas de Hoy */}
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
            {CITAS_HOY.map((cita) => (
              <div key={cita.id} className="px-6 py-4 flex items-center justify-between hover:bg-primary-50/30 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                    {cita.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-primary-900 text-sm">{cita.nombre}</p>
                    <p className="text-xs text-primary-400">{cita.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary-600">{cita.hora} hrs</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    cita.estado === 'confirmada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {cita.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accesos Rápidos + QR */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-primary-900">Accesos Rápidos</h2>
            {[
              { href: '/dashboard/pacientes', label: 'Gestionar Pacientes', sub: '5 pacientes activos', color: 'bg-primary-600 hover:bg-primary-700 text-white' },
              { href: '/dashboard/agenda', label: 'Ver Agenda Completa', sub: '3 citas esta semana', color: 'bg-white border border-primary-100 hover:bg-primary-50 text-primary-900' },
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
              {/* Usamos un QR dinámico basado en la URL actual */}
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

      {/* Pacientes Recientes */}
      <div className="bg-white rounded-[28px] border border-primary-50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-primary-50 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold text-primary-900">Pacientes Recientes</h2>
          <a href="/dashboard/pacientes" className="text-primary-500 hover:text-primary-700 flex items-center gap-1 text-sm font-bold transition">
            Ver todos <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="divide-y divide-primary-50">
          {PACIENTES_FICTICIOS.map((p) => (
            <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-primary-50/30 transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                  {p.nombre[0]}{p.apellidos[0]}
                </div>
                <div>
                  <p className="font-bold text-primary-900 text-sm">{p.nombre} {p.apellidos}</p>
                  <p className="text-xs text-primary-400">{p.tratamiento}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-400">Próx. cita</p>
                <p className="text-sm font-bold text-primary-700">{p.proxima}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
