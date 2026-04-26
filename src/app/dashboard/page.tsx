import React from 'react';
import { Users, Calendar, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Panel de Control Clínico</h1>
        <p className="text-stone-500 mt-2">Resumen de tu actividad dermatofuncional</p>
      </header>

      {/* Tarjetas de Resumen (Módulos DDD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-start space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-800">Pacientes</h3>
            <p className="text-stone-500 text-sm mt-1">Gestión Clínica</p>
            <span className="inline-block mt-3 px-3 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">Ver todos</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-start space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-800">Evaluaciones</h3>
            <p className="text-stone-500 text-sm mt-1">Plan de Tratamiento</p>
            <span className="inline-block mt-3 px-3 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">Nueva Evaluación</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-start space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-800">Próximas Citas</h3>
            <p className="text-stone-500 text-sm mt-1">Agenda de hoy</p>
            <span className="inline-block mt-3 px-3 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">3 Programadas</span>
          </div>
        </div>
      </div>

      {/* Sección de Citas Recientes */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
        <h2 className="text-xl font-bold text-stone-800 mb-4">Actividad Reciente</h2>
        <div className="text-center py-10">
          <p className="text-stone-400">Las evaluaciones y citas aparecerán aquí.</p>
        </div>
      </section>
    </div>
  );
}
