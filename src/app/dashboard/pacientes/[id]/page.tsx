'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit3, X, Save, Loader2, Mail, Copy } from 'lucide-react';

// ---- Datos ficticios por ID ----
const PACIENTES_MOCK: Record<string, any> = {
  p1: {
    nombre: 'Ana', apellidos: 'García Ruiz',
    email: 'ana.garcia@email.com', telefono: '722-555-0101',
    fecha_nacimiento: '1990-05-15', created_at: '2026-03-10T10:00:00Z',
    fototipo: 'III', hidratacion: 'Media', elasticidad: 'Alta', sensibilidad: 'Baja',
    objetivo: 'Estético', alergias: ['Fragancia sintética'],
    tratamiento: 'Anti-manchas con Vitamina C',
    protocolo: [
      'Limpieza micelar doble por la noche',
      'Sérum Vitamina C 15% cada mañana',
      'Protector solar SPF 50+ obligatorio',
      'Limpieza profunda mensual en consultorio',
      'Evitar exposición solar prolongada',
    ],
    citas: [
      { fecha: '10 Mar 2026', tipo: 'Valoración Inicial', estado: 'completada', notas: 'Primera consulta. Se observan manchas leves en zona T.' },
      { fecha: '28 Abr 2026', tipo: 'Limpieza Profunda', estado: 'confirmada', notas: '' },
      { fecha: '2 Jun 2026', tipo: 'Seguimiento Anti-manchas', estado: 'pendiente', notas: '' },
    ],
    notas: 'Paciente con muy buena adherencia al protocolo. Se observa mejoría del 30% en hiperpigmentación. Continuar con tratamiento actual.',
    fotos: [],
  },
  p2: {
    nombre: 'Carlos', apellidos: 'Martínez López',
    email: 'carlos.mtz@email.com', telefono: '722-555-0202',
    fecha_nacimiento: '1985-11-22', created_at: '2026-03-15T10:00:00Z',
    fototipo: 'IV', hidratacion: 'Baja', elasticidad: 'Media', sensibilidad: 'Alta',
    objetivo: 'Funcional', alergias: [],
    tratamiento: 'Control Acné Activo',
    protocolo: [
      'Limpiador con ácido salicílico 2% dos veces al día',
      'Niacinamida 10% después del tónico',
      'No aplicar aceites ni cremas pesadas',
      'Peeling BHA mensual en consultorio',
      'Cambiar funda de almohada cada 3 días',
    ],
    citas: [
      { fecha: '15 Mar 2026', tipo: 'Valoración Inicial', estado: 'completada', notas: 'Acné comedogénico moderado en frente y mentón.' },
      { fecha: '28 Abr 2026', tipo: 'Peeling Químico BHA', estado: 'pendiente', notas: '' },
    ],
    notas: 'Piel oleosa con tendencia comedogénica. Responde bien al BHA. Revisar dieta en próxima consulta.',
    fotos: [],
  },
};

const FALLBACK_PACIENTE = {
  nombre: 'Paciente', apellidos: 'Ejemplo',
  email: 'ejemplo@email.com', telefono: '722-555-0000',
  fecha_nacimiento: '1990-01-01', created_at: new Date().toISOString(),
  fototipo: 'II', hidratacion: 'Media', elasticidad: 'Media', sensibilidad: 'Baja',
  objetivo: 'Estético', alergias: [],
  tratamiento: 'Protocolo General',
  protocolo: ['Limpieza suave diaria', 'Hidratante sin fragancia', 'Protector solar SPF 30+'],
  citas: [],
  notas: '',
  fotos: [],
};

const ESTADO_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  completada: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completada' },
  confirmada: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Confirmada' },
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-600', label: 'Cancelada' },
};

export default function ExpedientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados para la Evaluación Clínica
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalData, setEvalData] = useState<any>(null);

  useEffect(() => {
    async function fetchPaciente() {
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) throw error;
        // Mezclamos con fallback clínico si viene vacío de la DB
        const fullData = { ...FALLBACK_PACIENTE, ...data };
        setPaciente(fullData);
        setNotas(fullData.notas || '');
      } catch {
        const mock = PACIENTES_MOCK[id as string] || FALLBACK_PACIENTE;
        setPaciente(mock);
        setNotas(mock.notas || '');
      } finally {
        setLoading(false);
      }
    }
    fetchPaciente();
  }, [id]);

  const handleOpenEvalModal = () => {
    setEvalData({
      fototipo: paciente.fototipo || 'III',
      hidratacion: paciente.hidratacion || 'Media',
      elasticidad: paciente.elasticidad || 'Media',
      sensibilidad: paciente.sensibilidad || 'Baja',
      objetivo: paciente.objetivo || 'Estético',
      tratamiento: paciente.tratamiento || '',
      protocolo: paciente.protocolo?.join('\n') || ''
    });
    setIsEvalModalOpen(true);
  };

  const handleSaveEval = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Aquí actualizamos el estado local (idealmente también se guardaría en DB)
    const updatedPaciente = {
      ...paciente,
      fototipo: evalData.fototipo,
      hidratacion: evalData.hidratacion,
      elasticidad: evalData.elasticidad,
      sensibilidad: evalData.sensibilidad,
      objetivo: evalData.objetivo,
      tratamiento: evalData.tratamiento,
      protocolo: evalData.protocolo.split('\n').filter((p: string) => p.trim() !== '')
    };

    setPaciente(updatedPaciente);
    setIsEvalModalOpen(false);
    setSaving(false);
  };

  const handleSaveNotas = async () => {
    setSaving(true);
    try {
      await supabase.from('pacientes').update({ notas } as any).eq('id', id);
    } catch { /* silencioso en modo mock */ } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-primary-400 text-sm italic">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (!paciente) return null;

  const iniciales = `${paciente.nombre?.[0] ?? ''}${paciente.apellidos?.[0] ?? ''}`;
  const edad = paciente.fecha_nacimiento && paciente.fecha_nacimiento !== '1990-01-01'
    ? Math.floor((Date.now() - new Date(paciente.fecha_nacimiento).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  const COLORES_AVATAR = [
    'from-primary-400 to-primary-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
    'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600',
  ];
  const colorIdx = (id?.charCodeAt(id.length - 1) ?? 0) % COLORES_AVATAR.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
      {/* Breadcrumb + Volver */}
      <div className="flex items-center gap-2 text-sm text-primary-400">
        <Link href="/dashboard/pacientes" className="hover:text-primary-700 transition font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Pacientes
        </Link>
        <span>/</span>
        <span className="text-primary-700 font-bold">{paciente.nombre} {paciente.apellidos}</span>
      </div>

      {/* Header del expediente */}
      <div className="bg-white rounded-[32px] border border-primary-50 shadow-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${COLORES_AVATAR[colorIdx]} p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6`}>
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center text-white font-serif font-bold text-4xl border-4 border-white/30 shadow-xl">
            {iniciales}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-serif font-bold text-white">{paciente.nombre} {paciente.apellidos}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
              <p className="text-white/80 text-sm flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Mail className="w-3.5 h-3.5" /> {paciente.email}
              </p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(paciente.id);
                  alert('¡Código PWA copiado!');
                }}
                className="text-white text-xs font-bold flex items-center gap-2 bg-primary-900/40 hover:bg-primary-900/60 px-3 py-1 rounded-full border border-white/20 transition backdrop-blur-sm"
                title="Copiar Código PWA"
              >
                <Copy className="w-3.5 h-3.5" /> <span className="font-mono opacity-80">{paciente.id.split('-')[0]}...</span>
              </button>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/pwa`;
                  const mensaje = `¡Hola ${paciente.nombre}! 👋\n\nAquí tienes tu acceso exclusivo al portal de LR Fisioderm. Podrás ver tu rutina, seguimiento y tienda de productos.\n\n🔑 *Tu código secreto es:* ${paciente.id}\n\n📱 *Para instalar la App en tu celular:*\n1. Entra a este enlace: ${url}\n2. Toca el botón de 'Compartir' o 'Opciones' de tu navegador.\n3. Elige *'Agregar a inicio' o 'Instalar aplicación'*.\n\n¡Nos vemos pronto!`;
                  window.open(`https://wa.me/${paciente.telefono?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(mensaje)}`, '_blank');
                }}
                className="text-white text-xs font-bold flex items-center gap-1.5 bg-[#25D366]/80 hover:bg-[#25D366] px-3 py-1 rounded-full border border-white/20 transition backdrop-blur-sm shadow-sm"
                title="Enviar instrucciones por WhatsApp"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Enviar a paciente
              </button>
            </div>
            <p className="text-white/60 mt-3 text-[10px] uppercase tracking-[0.2em] font-bold italic">{edad ? `${edad} años · ` : ''}{paciente.tratamiento}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              {paciente.alergias?.map((a: string) => (
                <span key={a} className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold">
                  ⚠ {a}
                </span>
              ))}
              {(!paciente.alergias || paciente.alergias.length === 0) && (
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold">Sin alergias registradas</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Evaluación Clínica */}
          <div className="bg-white rounded-[28px] border border-primary-50 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-primary-50 pb-3">
              <h2 className="font-serif font-bold text-primary-900 text-lg">Evaluación Clínica</h2>
              <button 
                onClick={handleOpenEvalModal}
                className="text-primary-400 hover:text-primary-600 bg-primary-50 p-2 rounded-xl transition"
                title="Editar Evaluación"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Fototipo', value: paciente.fototipo ?? '—' },
                { label: 'Hidratación', value: paciente.hidratacion ?? '—' },
                { label: 'Elasticidad', value: paciente.elasticidad ?? '—' },
                { label: 'Sensibilidad', value: paciente.sensibilidad ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-primary-50 rounded-2xl p-3">
                  <p className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">{label}</p>
                  <p className="font-bold text-primary-900 mt-1 text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary-50 rounded-2xl p-3">
              <p className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">Objetivo</p>
              <p className="font-bold text-primary-900 mt-1 text-sm">{paciente.objetivo ?? 'Estético'}</p>
            </div>
          </div>

          {/* Protocolo de Tratamiento */}
          <div className="bg-white rounded-[28px] border border-primary-50 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-primary-50 pb-3">
              <h2 className="font-serif font-bold text-primary-900 text-lg">Protocolo Activo</h2>
              <button 
                onClick={handleOpenEvalModal}
                className="text-primary-400 hover:text-primary-600 bg-primary-50 p-2 rounded-xl transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-bold text-primary-500 uppercase tracking-wider">{paciente.tratamiento}</p>
            <ol className="space-y-3">
              {(paciente.protocolo ?? []).map((paso: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-primary-800 leading-relaxed">{paso}</p>
                </li>
              ))}
              {(!paciente.protocolo || paciente.protocolo.length === 0) && (
                <p className="text-sm italic text-primary-300">No hay protocolo activo.</p>
              )}
            </ol>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Historial de Citas */}
          <div className="bg-white rounded-[28px] border border-primary-50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-primary-50">
              <h2 className="font-serif font-bold text-primary-900 text-lg">Historial de Citas</h2>
            </div>
            {(paciente.citas ?? []).length > 0 ? (
              <div className="divide-y divide-primary-50">
                {(paciente.citas as any[]).map((cita: any, i: number) => {
                  const cfg = ESTADO_CONFIG[cita.estado] ?? ESTADO_CONFIG.pendiente;
                  return (
                    <div key={i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-primary-50/30 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-primary-900 text-sm">{cita.tipo}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-primary-400 mt-1">{cita.fecha}</p>
                        {cita.notas && (
                          <p className="text-xs text-primary-600 mt-2 italic bg-primary-50 rounded-xl px-3 py-2">
                            📝 {cita.notas}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-primary-300 text-sm italic">Sin historial de citas registrado.</p>
              </div>
            )}
          </div>

          {/* Notas Clínicas */}
          <div className="bg-white rounded-[28px] border border-primary-50 shadow-sm p-6 space-y-4">
            <h2 className="font-serif font-bold text-primary-900 text-lg border-b border-primary-50 pb-3">Notas Clínicas</h2>
            <textarea
              rows={5}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones clínicas, evolución del tratamiento, notas de consulta..."
              className="w-full p-4 bg-primary-50 border border-primary-100 rounded-2xl text-primary-900 text-sm placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none transition"
            />
            <button
              onClick={handleSaveNotas}
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl transition shadow-md disabled:opacity-60 flex items-center gap-2 text-sm"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-4 h-4" /> Guardar Notas</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Edición de Evaluación y Protocolo */}
      {isEvalModalOpen && evalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" onClick={() => setIsEvalModalOpen(false)} />
          <div className="bg-white rounded-[32px] w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-primary-50 flex justify-between items-center bg-primary-50/50 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-2xl font-serif font-bold text-primary-900">Editar Evaluación y Protocolo</h2>
              <button onClick={() => setIsEvalModalOpen(false)} className="text-primary-300 hover:text-primary-900 p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEval} className="p-8 space-y-8">
              {/* Sección de Piel */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary-500 uppercase tracking-widest border-b border-primary-50 pb-2">Estado de la Piel</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Fototipo</label>
                    <select
                      value={evalData.fototipo}
                      onChange={(e) => setEvalData({ ...evalData, fototipo: e.target.value })}
                      className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none"
                    >
                      <option value="I">I - Muy clara</option>
                      <option value="II">II - Clara</option>
                      <option value="III">III - Intermedia</option>
                      <option value="IV">IV - Oscura</option>
                      <option value="V">V - Muy oscura</option>
                      <option value="VI">VI - Negra</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Hidratación</label>
                    <select
                      value={evalData.hidratacion}
                      onChange={(e) => setEvalData({ ...evalData, hidratacion: e.target.value })}
                      className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Elasticidad</label>
                    <select
                      value={evalData.elasticidad}
                      onChange={(e) => setEvalData({ ...evalData, elasticidad: e.target.value })}
                      className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Sensibilidad</label>
                    <select
                      value={evalData.sensibilidad}
                      onChange={(e) => setEvalData({ ...evalData, sensibilidad: e.target.value })}
                      className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección de Protocolo */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary-500 uppercase tracking-widest border-b border-primary-50 pb-2">Plan de Tratamiento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Objetivo Principal</label>
                    <select
                      value={evalData.objetivo}
                      onChange={(e) => setEvalData({ ...evalData, objetivo: e.target.value })}
                      className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none"
                    >
                      <option value="Estético">Estético</option>
                      <option value="Funcional">Funcional</option>
                      <option value="Mixto">Mixto</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Nombre del Tratamiento</label>
                    <input
                      type="text"
                      value={evalData.tratamiento}
                      onChange={(e) => setEvalData({ ...evalData, tratamiento: e.target.value })}
                      className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none"
                      placeholder="Ej. Control de Acné"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-400 uppercase ml-1">Pasos del Protocolo (uno por línea)</label>
                  <textarea
                    rows={4}
                    value={evalData.protocolo}
                    onChange={(e) => setEvalData({ ...evalData, protocolo: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none resize-none"
                    placeholder="Lavar rostro por la mañana&#10;Aplicar tónico hidratante&#10;Usar protector solar SPF 50"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEvalModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl border border-primary-100 text-primary-400 font-bold hover:bg-primary-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-4 px-6 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Actualizar Expediente</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
