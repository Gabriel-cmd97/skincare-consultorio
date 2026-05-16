'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit3, X, Save, Loader2, Mail, Copy, Trash2, Camera } from 'lucide-react';
import { sanitizeText } from '@/utils/security';

const TABS = [
  { id: 'antecedentes', label: 'Datos y Antecedentes' },
  { id: 'evaluacion', label: 'Evaluación y Recomendaciones' },
  { id: 'historial', label: 'Historial de Citas' }
];

const FALLBACK_PACIENTE = {
  nombre: 'Cargando...', apellidos: '',
  email: '', telefono: '',
  fecha_nacimiento: '1990-01-01', created_at: new Date().toISOString(),
  alergias: [],
  antecedentes_medicos: {}, antecedentes_gineco: {}, antecedentes_esteticos: {},
  rutina_actual: {}, habitos: {},
  citas: [], notas: '', fotos: [],
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
  const [evaluacion, setEvaluacion] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('antecedentes');

  // Modal Antecedentes
  const [isAntecedentesModalOpen, setIsAntecedentesModalOpen] = useState(false);
  const [antData, setAntData] = useState<any>({});

  // Modal Evaluación
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalData, setEvalData] = useState<any>({});

  useEffect(() => {
    async function fetchPaciente() {
      try {
        const { data: pacData, error: pacError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();

        if (pacError && pacError.code !== 'PGRST116') throw pacError;

        const { data: evData, error: evError } = await supabase
          .from('evaluaciones_clinicas')
          .select('*')
          .eq('paciente_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const pData = pacData || FALLBACK_PACIENTE;
        setPaciente({ ...FALLBACK_PACIENTE, ...pData });
        setEvaluacion(evData || {});
        setNotas(pData.notas || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPaciente();
  }, [id]);

  const handleOpenAntecedentesModal = () => {
    setAntData({
      edad: paciente.edad || '',
      ocupacion: paciente.ocupacion || '',
      antecedentes_medicos: paciente.antecedentes_medicos || {},
      antecedentes_gineco: paciente.antecedentes_gineco || {},
      antecedentes_esteticos: paciente.antecedentes_esteticos || {},
      rutina_actual: paciente.rutina_actual || {},
      habitos: paciente.habitos || {}
    });
    setIsAntecedentesModalOpen(true);
  };

  const handleSaveAntecedentes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('pacientes').update({
        edad: antData.edad ? parseInt(antData.edad) : null,
        ocupacion: sanitizeText(antData.ocupacion, 100),
        antecedentes_medicos: antData.antecedentes_medicos,
        antecedentes_gineco: antData.antecedentes_gineco,
        antecedentes_esteticos: antData.antecedentes_esteticos,
        rutina_actual: antData.rutina_actual,
        habitos: antData.habitos
      }).eq('id', id);

      if (error) throw error;
      setPaciente({ ...paciente, ...antData });
      setIsAntecedentesModalOpen(false);
    } catch (err) {
      alert('Error guardando antecedentes.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEvalModal = () => {
    // Si no hay evaluación previa, pre-llenar plantillas
    const templateReacciones = "Enrojecimiento leve.\nSensibilidad.\nResequedad o ligera descamación.\nAparición de brotes leves (proceso de renovación cutánea).";
    const templateCuidados = "Evitar exposición directa al sol.\nNo tocar, exprimir o manipular la piel.\nEvitar maquillaje (mínimo 24 horas).\nNo usar productos irritantes (ácidos, exfoliantes, retinol).\nEvitar calor excesivo (vapor, ejercicio intenso).";
    const templateManana = "1. Limpiador facial suave.\n2. Contorno de ojos.\n3. Suero antioxidante (Vitamina C).\n4. Crema hidratante ligera.\n5. Protector solar FPS 50+ (Reaplicar cada 3 hrs).";
    const templateNoche = "1. Desmaquillante o agua micelar.\n2. Limpiador facial.\n3. Contorno de ojos.\n4. Tratamiento específico (Despigmentante/Anti-acné/Retinol).\n5. Crema hidratante reparadora.";

    setEvalData({
      motivo_consulta: evaluacion.motivo_consulta || '',
      que_mejorar: evaluacion.que_mejorar || '',
      fototipo: evaluacion.piel_fototipo || 'III',
      hidratacion: evaluacion.piel_hidratacion || 'media',
      elasticidad: evaluacion.piel_elasticidad || 'media',
      sensibilidad: evaluacion.piel_sensibilidad || false,
      objetivo: evaluacion.objetivo_principal || 'Estético',
      cuidados_casa: evaluacion.cuidados_casa || templateCuidados,
      reacciones_normales: evaluacion.reacciones_normales || templateReacciones,
      rutina_manana: evaluacion.rutina_manana || templateManana,
      rutina_noche: evaluacion.rutina_noche || templateNoche,
    });
    setIsEvalModalOpen(true);
  };

  const handleSaveEval = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        paciente_id: id,
        motivo_consulta: sanitizeText(evalData.motivo_consulta, 200),
        que_mejorar: sanitizeText(evalData.que_mejorar, 200),
        piel_fototipo: evalData.fototipo,
        piel_hidratacion: evalData.hidratacion,
        piel_elasticidad: evalData.elasticidad,
        piel_sensibilidad: evalData.sensibilidad,
        objetivo_principal: evalData.objetivo,
        cuidados_casa: sanitizeText(evalData.cuidados_casa, 1000),
        reacciones_normales: sanitizeText(evalData.reacciones_normales, 1000),
        rutina_manana: sanitizeText(evalData.rutina_manana, 1000),
        rutina_noche: sanitizeText(evalData.rutina_noche, 1000),
      };

      if (evaluacion.id) {
        await supabase.from('evaluaciones_clinicas').update(payload).eq('id', evaluacion.id);
      } else {
        await supabase.from('evaluaciones_clinicas').insert([payload]);
      }

      setEvaluacion({ ...evaluacion, ...payload });
      setIsEvalModalOpen(false);
    } catch (err) {
      alert('Error guardando evaluación.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaciente = async () => {
    if (!confirm('¿Estás seguro de eliminar este paciente?')) return;
    setSaving(true);
    try {
      await supabase.from('pacientes').delete().eq('id', id);
      router.push('/dashboard/pacientes');
    } catch (err) {
      alert('Error.');
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>;
  if (!paciente) return null;

  const iniciales = `${paciente.nombre?.[0] ?? ''}${paciente.apellidos?.[0] ?? ''}`;
  
  // Toggle Helper
  const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input type="checkbox" className="hidden" checked={checked || false} onChange={(e) => onChange(e.target.checked)} />
      <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${checked ? 'bg-primary-500' : 'bg-gray-300'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </label>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 relative">
      <div className="flex items-center gap-2 text-sm text-primary-400">
        <Link href="/dashboard/pacientes" className="hover:text-primary-700 font-medium flex items-center gap-1">
          Pacientes
        </Link>
        <span>/</span>
        <span className="text-primary-700 font-bold">{paciente.nombre} {paciente.apellidos}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-primary-50 shadow-sm overflow-hidden flex flex-col sm:flex-row items-center sm:items-stretch">
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-8 flex items-center justify-center w-full sm:w-auto">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-serif font-bold text-4xl shadow-lg">
            {iniciales}
          </div>
        </div>
        <div className="p-8 flex-1 w-full flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">{paciente.nombre} {paciente.apellidos}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-4">
              <span>{paciente.edad ? `${paciente.edad} años` : 'Edad no registrada'}</span>
              <span>{paciente.ocupacion ? paciente.ocupacion : 'Ocupación no registrada'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <button className="text-xs bg-green-100 text-green-700 font-bold px-4 py-2 rounded-full flex items-center gap-2">
              <span className="text-[16px]">📱</span> {paciente.telefono}
            </button>
            <button 
              onClick={() => {
                const url = `${window.location.origin}/pwa?code=${paciente.id}`;
                const msg = `¡Hola ${paciente.nombre}! Ya puedes acceder a tu app personalizada de Skincare. 🌿\n\nEntra directo con este enlace:\n${url}\n\nTambién puedes entrar manualmente en: ${window.location.origin}/pwa\nTu código de acceso es: ${paciente.id}`;
                navigator.clipboard.writeText(msg);
                alert('¡Enlace y código copiados al portapapeles!');
              }}
              className="text-xs bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-full flex items-center gap-2 transition hover:bg-blue-200"
            >
              <Copy className="w-4 h-4" /> Copiar Acceso PWA
            </button>
            <button onClick={handleDeletePaciente} className="text-xs bg-red-50 text-red-600 font-bold px-4 py-2 rounded-full ml-auto">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-gray-100/50 rounded-2xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-primary-700 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:bg-white/50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VISTA: ANTECEDENTES */}
      {activeTab === 'antecedentes' && (
        <div className="bg-white rounded-3xl border border-primary-50 shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-xl font-serif font-bold text-gray-900">Ficha Clínica y Antecedentes</h2>
            <button onClick={handleOpenAntecedentesModal} className="flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-100 transition">
              <Edit3 className="w-4 h-4" /> Editar Datos
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Médicos y Alergias</h3>
              <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                <p className="text-sm"><strong>Diabetes:</strong> {paciente.antecedentes_medicos?.diabetes ? 'Sí' : 'No'}</p>
                <p className="text-sm"><strong>Acné/Rosácea:</strong> {paciente.antecedentes_medicos?.acne ? 'Sí' : 'No'}</p>
                <p className="text-sm"><strong>Cicatrización:</strong> {paciente.antecedentes_medicos?.cicatrizacion ? 'Sí' : 'No'}</p>
                <p className="text-sm mt-2 text-red-600 font-bold">Alergias: {paciente.alergias?.length > 0 ? paciente.alergias.join(', ') : 'Ninguna'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estéticos Previos</h3>
              <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                <p className="text-sm"><strong>Bótox:</strong> {paciente.antecedentes_esteticos?.botox ? 'Sí' : 'No'}</p>
                <p className="text-sm"><strong>Ácido Hialurónico:</strong> {paciente.antecedentes_esteticos?.hialuronico ? 'Sí' : 'No'}</p>
                <p className="text-sm"><strong>Cirugías:</strong> {paciente.antecedentes_esteticos?.cirugias ? 'Sí' : 'No'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rutina Actual</h3>
              <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                <p className="text-sm"><strong>Limpiador:</strong> {paciente.rutina_actual?.limpiador || 'No'}</p>
                <p className="text-sm"><strong>Protector Solar:</strong> {paciente.rutina_actual?.solar || 'No'}</p>
                <p className="text-sm"><strong>Agua:</strong> {paciente.habitos?.agua || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA: EVALUACIÓN Y RECOMENDACIONES */}
      {activeTab === 'evaluacion' && (
        <div className="bg-white rounded-3xl border border-primary-50 shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-xl font-serif font-bold text-gray-900">Evaluación Dermatofuncional</h2>
            <button onClick={handleOpenEvalModal} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-700 transition shadow-md">
              <Edit3 className="w-4 h-4" /> Editar Evaluación
            </button>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <span className="text-blue-500 text-lg">📱</span>
            <p className="text-xs text-blue-700 leading-relaxed font-medium">Las recomendaciones y rutinas que llenes aquí <strong>aparecerán automáticamente en la PWA</strong> del paciente para que las siga en casa.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary-500 uppercase tracking-widest">Datos Clínicos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 p-3 rounded-xl"><p className="text-[10px] uppercase text-primary-400 font-bold">Fototipo</p><p className="font-bold text-gray-900">{evaluacion.piel_fototipo || '—'}</p></div>
                <div className="bg-primary-50 p-3 rounded-xl"><p className="text-[10px] uppercase text-primary-400 font-bold">Hidratación</p><p className="font-bold text-gray-900">{evaluacion.piel_hidratacion || '—'}</p></div>
                <div className="bg-primary-50 p-3 rounded-xl"><p className="text-[10px] uppercase text-primary-400 font-bold">Sensibilidad</p><p className="font-bold text-gray-900">{evaluacion.piel_sensibilidad ? 'Alta' : 'Normal'}</p></div>
                <div className="bg-primary-50 p-3 rounded-xl"><p className="text-[10px] uppercase text-primary-400 font-bold">Objetivo</p><p className="font-bold text-gray-900">{evaluacion.objetivo_principal || '—'}</p></div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary-500 uppercase tracking-widest">Motivo de Consulta</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">{evaluacion.motivo_consulta || 'No especificado'}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">☀️ Rutina Mañana</h3>
              <p className="text-sm text-gray-700 bg-emerald-50/50 p-4 rounded-xl whitespace-pre-wrap min-h-[100px] border border-emerald-100">
                {evaluacion.rutina_manana || 'Sin rutina registrada.'}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">🌙 Rutina Noche</h3>
              <p className="text-sm text-gray-700 bg-indigo-50/50 p-4 rounded-xl whitespace-pre-wrap min-h-[100px] border border-indigo-100">
                {evaluacion.rutina_noche || 'Sin rutina registrada.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">⚠️ Cuidados en Casa (24-72 hrs)</h3>
            <p className="text-sm text-gray-700 bg-amber-50 p-4 rounded-xl whitespace-pre-wrap border border-amber-100">
              {evaluacion.cuidados_casa || 'Sin cuidados registrados.'}
            </p>
          </div>
        </div>
      )}

      {/* VISTA: HISTORIAL */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-3xl border border-primary-50 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in">
          <h2 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-100 pb-4">Historial de Citas y Notas</h2>
          {paciente.citas?.length > 0 ? (
            <div className="space-y-4">
              {paciente.citas.map((cita: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">{cita.tipo}</p>
                    <p className="text-xs text-gray-500">{cita.fecha}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ESTADO_CONFIG[cita.estado]?.bg} ${ESTADO_CONFIG[cita.estado]?.text}`}>
                    {ESTADO_CONFIG[cita.estado]?.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-8">No hay citas registradas.</p>
          )}

          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Notas Clínicas Privadas</h3>
            <textarea
              rows={4}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas internas que no ve el paciente..."
              className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 resize-none outline-none"
            />
            <button onClick={async () => {
              setSaving(true);
              await supabase.from('pacientes').update({ notas }).eq('id', id);
              setSaving(false);
            }} className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold">Guardar Notas</button>
          </div>
        </div>
      )}


      {/* MODAL: ANTECEDENTES */}
      {isAntecedentesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsAntecedentesModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl z-10 animate-in fade-in zoom-in-95">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b flex justify-between items-center z-20">
              <h2 className="text-xl font-bold font-serif">Editar Antecedentes (Botones Rápidos)</h2>
              <button onClick={() => setIsAntecedentesModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveAntecedentes} className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Edad</label><input type="number" value={antData.edad} onChange={e => setAntData({...antData, edad: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none focus:border-primary-400" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Ocupación</label><input type="text" value={antData.ocupacion} onChange={e => setAntData({...antData, ocupacion: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none focus:border-primary-400" /></div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary-500 uppercase border-b pb-2">Antecedentes Médicos (Clic para activar)</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Toggle label="Diabetes" checked={antData.antecedentes_medicos?.diabetes} onChange={(val) => setAntData({...antData, antecedentes_medicos: {...antData.antecedentes_medicos, diabetes: val}})} />
                  <Toggle label="Lupus / Autoinmune" checked={antData.antecedentes_medicos?.lupus} onChange={(val) => setAntData({...antData, antecedentes_medicos: {...antData.antecedentes_medicos, lupus: val}})} />
                  <Toggle label="Acné / Rosácea" checked={antData.antecedentes_medicos?.acne} onChange={(val) => setAntData({...antData, antecedentes_medicos: {...antData.antecedentes_medicos, acne: val}})} />
                  <Toggle label="Prob. Cicatrización" checked={antData.antecedentes_medicos?.cicatrizacion} onChange={(val) => setAntData({...antData, antecedentes_medicos: {...antData.antecedentes_medicos, cicatrizacion: val}})} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary-500 uppercase border-b pb-2">Estéticos y Quirúrgicos</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Toggle label="Aplicación Bótox" checked={antData.antecedentes_esteticos?.botox} onChange={(val) => setAntData({...antData, antecedentes_esteticos: {...antData.antecedentes_esteticos, botox: val}})} />
                  <Toggle label="Ácido Hialurónico" checked={antData.antecedentes_esteticos?.hialuronico} onChange={(val) => setAntData({...antData, antecedentes_esteticos: {...antData.antecedentes_esteticos, hialuronico: val}})} />
                  <Toggle label="Cirugías Faciales" checked={antData.antecedentes_esteticos?.cirugias} onChange={(val) => setAntData({...antData, antecedentes_esteticos: {...antData.antecedentes_esteticos, cirugias: val}})} />
                  <Toggle label="Hilos Tensores" checked={antData.antecedentes_esteticos?.hilos} onChange={(val) => setAntData({...antData, antecedentes_esteticos: {...antData.antecedentes_esteticos, hilos: val}})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAntecedentesModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-md flex justify-center items-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EVALUACION */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsEvalModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl z-10 animate-in fade-in zoom-in-95">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b flex justify-between items-center z-20">
              <h2 className="text-xl font-bold font-serif">Recomendaciones y Rutinas (Visible en PWA)</h2>
              <button onClick={() => setIsEvalModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveEval} className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Motivo de Consulta</label>
                <input type="text" value={evalData.motivo_consulta} onChange={e => setEvalData({...evalData, motivo_consulta: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none" />
              </div>

              {/* Datos Clínicos */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest border-b border-gray-100 pb-2">Datos Clínicos de la Piel</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Fototipo</label>
                    <select value={evalData.fototipo} onChange={e => setEvalData({...evalData, fototipo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none">
                      <option value="I">I – Muy Claro</option>
                      <option value="II">II – Claro</option>
                      <option value="III">III – Intermedio</option>
                      <option value="IV">IV – Mediterráneo</option>
                      <option value="V">V – Moreno</option>
                      <option value="VI">VI – Muy Oscuro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Hidratación</label>
                    <select value={evalData.hidratacion} onChange={e => setEvalData({...evalData, hidratacion: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none">
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Sensibilidad</label>
                    <select value={evalData.sensibilidad ? 'alta' : 'normal'} onChange={e => setEvalData({...evalData, sensibilidad: e.target.value === 'alta'})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none">
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Objetivo Principal</label>
                    <select value={evalData.objetivo} onChange={e => setEvalData({...evalData, objetivo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 outline-none">
                      <option value="Estético">Estético</option>
                      <option value="Médico">Médico</option>
                      <option value="Preventivo">Preventivo</option>
                      <option value="Anti-edad">Anti-edad</option>
                      <option value="Acné">Acné</option>
                      <option value="Manchas">Manchas</option>
                      <option value="Rosácea">Rosácea</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1"><span className="text-lg">☀️</span> Rutina Mañana</label>
                  <textarea rows={4} value={evalData.rutina_manana} onChange={e => setEvalData({...evalData, rutina_manana: e.target.value})} className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 mt-1 outline-none" placeholder="Ej. Limpiador suave..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1"><span className="text-lg">🌙</span> Rutina Noche</label>
                  <textarea rows={4} value={evalData.rutina_noche} onChange={e => setEvalData({...evalData, rutina_noche: e.target.value})} className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl px-4 py-3 mt-1 outline-none" placeholder="Ej. Desmaquillante..." />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1"><span className="text-lg">⚠️</span> Cuidados en Casa (24-72hrs)</label>
                <textarea rows={5} value={evalData.cuidados_casa} onChange={e => setEvalData({...evalData, cuidados_casa: e.target.value})} className="w-full bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3 mt-1 outline-none" />
                <p className="text-[10px] text-gray-400 mt-1">Este texto viene pre-llenado de tu plantilla oficial.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-blue-600 uppercase">Reacciones Normales Post-Tratamiento</label>
                <textarea rows={4} value={evalData.reacciones_normales} onChange={e => setEvalData({...evalData, reacciones_normales: e.target.value})} className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setIsEvalModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-[2] py-3 bg-primary-600 text-white font-bold rounded-xl shadow-md flex justify-center items-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar y Publicar en PWA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
