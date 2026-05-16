'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { optimizeImage } from '@/utils/optimizeImage';
import { checkRateLimit } from '@/utils/security';
import { Loader2, User, Key, ArrowRight, LogOut, Instagram, Camera, Tag, Image as ImageIcon, CheckCircle2, Circle, Bell, BellRing } from 'lucide-react';

interface Tip {
  id: string;
  titulo: string;
  contenido: string;
  tipo: 'tip' | 'rutina';
  etiqueta?: string;
  imagen_url?: string;
  video_url?: string;
}

const ETIQUETAS_OPCIONES = [
  'General', 'Piel Grasa', 'Piel Seca', 'Piel Mixta', 'Acné', 'Rosácea', 'Manchas', 'Anti-edad'
];

type Vista = 'inicio' | 'citas' | 'tienda' | 'perfil';

// ---------- DATOS FICTICIOS FALLBACK ----------
const TIPS_FICTICIOS: Tip[] = [
  {
    id: '1',
    titulo: 'Rutina de Hidratación Nocturna',
    contenido: '1. Limpia tu rostro con gel suave.\n2. Aplica tónico sin alcohol.\n3. Sérum de ácido hialurónico.\n4. Crema hidratante de barrera.\n5. Aceite facial sellador.',
    tipo: 'rutina',
    etiqueta: 'Piel Seca',
    imagen_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  },
];

// ---------- COMPONENTES INTERNOS ----------

function VistaLogin({ onLogin }: { onLogin: (paciente: any) => void }) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo) return;

    // Rate limiting: máximo 10 intentos por hora
    const rateCheck = checkRateLimit('pwa_login', 10, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      setError('Demasiados intentos. Espera un momento o contacta a tu especialista.');
      return;
    }

    setLoading(true);
    setError('');

    // Validar formato UUID básico (evitar queries innecesarios)
    const trimmed = codigo.trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmed)) {
      setError('Código no válido. Verifica con tu especialista.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: sbError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', trimmed)
        .single();

      if (sbError || !data) {
        setError('Código no válido. Verifica con tu especialista.');
      } else {
        const { data: evData } = await supabase.from('evaluaciones_clinicas').select('*').eq('paciente_id', trimmed).order('created_at', { ascending: false }).limit(1).single();
        onLogin({ ...data, evaluacion: evData || {} });
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col px-8 pt-20 pb-10">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="w-20 h-20 bg-white rounded-[28px] shadow-xl flex items-center justify-center text-primary-600 mb-2">
          <User className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-primary-900">Bienvenida</h1>
        <p className="text-primary-500 text-sm">Ingresa tu código de paciente para acceder a tu portal personalizado.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-300" />
          <input
            type="text"
            placeholder="Pega tu código aquí"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-primary-100 shadow-sm focus:ring-2 focus:ring-primary-400 outline-none transition"
          />
        </div>
        {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-primary-900 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-primary-800 transition disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Entrar <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <div className="mt-auto pt-10 text-center">
        <p className="text-primary-300 text-xs uppercase tracking-widest font-bold mb-4">LR Fisioderm</p>
        <div className="flex justify-center gap-4">
          <a href="https://www.instagram.com/lr_fisderm" target="_blank" className="text-primary-400 hover:text-primary-600">
            <Instagram className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}

function VistaInicio({ tips, loading, filter, setFilter, filtroEtiqueta, setFiltroEtiqueta }: {
  tips: Tip[];
  loading: boolean;
  filter: 'todos' | 'tip' | 'rutina';
  setFilter: (f: 'todos' | 'tip' | 'rutina') => void;
  filtroEtiqueta: string;
  setFiltroEtiqueta: (e: string) => void;
}) {
  const filtrados = tips.filter(t => {
    const matchTipo = filter === 'todos' || t.tipo === filter;
    const matchEtiqueta = filtroEtiqueta === 'Todas' || t.etiqueta === filtroEtiqueta;
    return matchTipo && matchEtiqueta;
  });

  return (
    <main className="px-5 pt-6 pb-4 space-y-4">
      {/* Hint de sección */}
      <div className="flex items-start gap-2 bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3">
        <span className="text-base">✨</span>
        <p className="text-[11px] text-primary-500 leading-relaxed">
          Aquí encontrarás <strong>rutinas y consejos de skincare</strong> preparados por tu especialista, filtrados especialmente para tu tipo de piel.
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(['todos', 'rutina', 'tip'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-primary-400 border border-primary-100'
            }`}
          >
            {f === 'tip' ? '✨ Tips' : f === 'rutina' ? '🌿 Rutinas' : 'Todo'}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFiltroEtiqueta('Todas')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
            filtroEtiqueta === 'Todas' ? 'bg-primary-900 text-white shadow-md' : 'bg-primary-50 text-primary-400 border border-primary-100'
          }`}
        >
          Todas
        </button>
        {ETIQUETAS_OPCIONES.map((tag) => (
          <button
            key={tag}
            onClick={() => setFiltroEtiqueta(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
              filtroEtiqueta === tag ? 'bg-primary-900 text-white shadow-md' : 'bg-primary-50 text-primary-400 border border-primary-100'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-primary-400 text-sm italic">Preparando tu piel...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtrados.map((item) => (
            <div key={item.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-primary-50">
              {item.imagen_url && (
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={item.imagen_url} alt={item.titulo} className="w-full h-full object-cover" />
                  {/* Botón de play solo para rutinas con video */}
                  {item.tipo === 'rutina' && item.video_url && (
                    <a href={item.video_url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/25 active:bg-black/40 transition">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <svg className="w-7 h-7 text-primary-700 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </a>
                  )}
                </div>
              )}
              <div className="p-6 space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${item.tipo === 'rutina' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                    {item.tipo === 'rutina' ? '🎬 Rutina' : '💡 Tip'}
                  </span>
                  {item.etiqueta && item.etiqueta !== 'General' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-stone-100 text-stone-600">
                      {item.etiqueta}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-serif font-bold text-primary-900">{item.titulo}</h3>
                <p className="text-primary-700/80 text-sm leading-relaxed whitespace-pre-line">{item.contenido}</p>
                {/* Link de video si es rutina sin imagen */}
                {item.tipo === 'rutina' && item.video_url && !item.imagen_url && (
                  <a href={item.video_url} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 text-primary-600 font-bold text-sm active:text-primary-800 transition">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    Ver video de la rutina →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function VistaPerfil({ paciente, onLogout }: { paciente: any, onLogout: () => void }) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(paciente.foto_url || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const hoy = new Date().toISOString().split('T')[0];
  const storageKey = `rutina_${paciente.id}_${hoy}`;
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  useEffect(() => {
    // Inicializar Checklist
    if (paciente.protocolo) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedSteps(JSON.parse(saved));
      } else {
        setCheckedSteps(new Array(paciente.protocolo.length).fill(false));
      }
    }
    
    // Inicializar Notificaciones
    if ('Notification' in window) {
      setRemindersEnabled(Notification.permission === 'granted');
    }
  }, [paciente.id, paciente.protocolo, hoy, storageKey]);

  const toggleStep = (index: number) => {
    const newChecked = [...checkedSteps];
    newChecked[index] = !newChecked[index];
    setCheckedSteps(newChecked);
    localStorage.setItem(storageKey, JSON.stringify(newChecked));
  };

  const handleEnableReminders = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones web. Intenta desde Chrome o Safari actualizado.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setRemindersEnabled(true);
      new Notification('¡Alertas Activadas!', {
        body: 'Te recordaremos hacer tu rutina de Skincare todos los días.',
        icon: '/icon-192x192.png' // Icono genérico asumiendo PWA standard
      });
    } else {
      alert('Necesitas dar permiso en los ajustes de tu navegador para recibir alertas.');
    }
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Optimizar: convertir a WebP y comprimir (fotos de perfil: 400x400)
      const optimized = await optimizeImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 });
      const fileName = `paciente_${paciente.id}_${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from('pacientes-fotos')
        .upload(fileName, optimized, { upsert: true, contentType: 'image/webp' });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('pacientes-fotos').getPublicUrl(fileName);
      setFotoUrl(data.publicUrl);
      await supabase.from('pacientes').update({ foto_url: data.publicUrl } as any).eq('id', paciente.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="px-5 pt-6 pb-4 space-y-6">
      <div className="bg-white rounded-[32px] p-6 border border-primary-100 shadow-sm flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-100 shadow-inner bg-primary-50">
            {fotoUrl ? (
              <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-300 font-serif font-bold text-2xl uppercase">
                {paciente.nombre[0]}
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white shadow-md text-white"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-serif font-bold text-primary-900 text-xl truncate">{paciente.nombre}</h2>
          <p className="text-primary-400 text-[9px] uppercase tracking-widest font-bold mt-1">Expediente Activo</p>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-6 border border-primary-100 shadow-sm space-y-4">
        <h3 className="font-bold text-primary-900 text-sm uppercase tracking-wider border-b border-primary-50 pb-2">Tu Evaluación</h3>
        <p className="text-[10px] text-primary-400 italic leading-relaxed">Estos datos fueron registrados por tu especialista en tu última valoración clínica. Si algo no coincide, comentáselo en tu próxima cita. 👩‍⚕️</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Fototipo', value: paciente.evaluacion?.piel_fototipo || paciente.fototipo || '—' },
            { label: 'Hidratación', value: paciente.evaluacion?.piel_hidratacion || paciente.hidratacion || '—' },
            { label: 'Sensibilidad', value: paciente.evaluacion?.piel_sensibilidad ? 'Alta' : (paciente.sensibilidad || '—') },
            { label: 'Objetivo', value: paciente.evaluacion?.objetivo_principal || paciente.objetivo || '—' },
          ].map((item) => (
            <div key={item.label} className="bg-primary-50 rounded-2xl p-3">
              <p className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">{item.label}</p>
              <p className="font-bold text-primary-900 text-sm mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMENDACIONES Y CUIDADOS POST-TX */}
      {(paciente.evaluacion?.cuidados_casa || paciente.evaluacion?.reacciones_normales) && (
        <div className="bg-amber-50 rounded-[28px] p-6 border border-amber-100 shadow-sm space-y-4">
          <h3 className="font-bold text-amber-700 text-sm uppercase tracking-wider border-b border-amber-100/50 pb-2 flex items-center gap-2">⚠️ Cuidados Post-Tratamiento</h3>
          
          {paciente.evaluacion.cuidados_casa && (
            <div className="space-y-1">
              <p className="text-[10px] text-amber-600/80 uppercase font-bold tracking-widest">Cuidados en Casa (24-72 hrs)</p>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{paciente.evaluacion.cuidados_casa}</p>
            </div>
          )}

          {paciente.evaluacion.reacciones_normales && (
            <div className="space-y-1 pt-3 border-t border-amber-100/50">
              <p className="text-[10px] text-amber-600/80 uppercase font-bold tracking-widest">Reacciones Normales</p>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{paciente.evaluacion.reacciones_normales}</p>
            </div>
          )}
        </div>
      )}

      {/* RUTINA MAÑANA / NOCHE */}
      {(paciente.evaluacion?.rutina_manana || paciente.evaluacion?.rutina_noche) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-[24px] p-5 border border-emerald-100 shadow-sm space-y-2">
            <h3 className="font-bold text-emerald-700 text-xs uppercase tracking-wider flex items-center gap-1"><span className="text-sm">☀️</span> Día</h3>
            <p className="text-xs text-emerald-900 whitespace-pre-wrap">{paciente.evaluacion.rutina_manana || 'Sin registro.'}</p>
          </div>
          <div className="bg-indigo-50 rounded-[24px] p-5 border border-indigo-100 shadow-sm space-y-2">
            <h3 className="font-bold text-indigo-700 text-xs uppercase tracking-wider flex items-center gap-1"><span className="text-sm">🌙</span> Noche</h3>
            <p className="text-xs text-indigo-900 whitespace-pre-wrap">{paciente.evaluacion.rutina_noche || 'Sin registro.'}</p>
          </div>
        </div>
      )}

      {paciente.protocolo && paciente.protocolo.length > 0 && (
        <div className="bg-primary-900 rounded-[32px] p-8 text-white space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
          
          <div className="flex justify-between items-end relative z-10">
            <div>
              <h3 className="font-serif font-bold text-xl">Tu Rutina Diaria</h3>
              <p className="text-primary-300 text-[10px] uppercase tracking-widest font-bold mt-1">
                {paciente.tratamiento || 'Protocolo Personalizado'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-serif font-bold text-primary-200">
                {checkedSteps.filter(Boolean).length}
              </span>
              <span className="text-primary-400 text-sm">/{paciente.protocolo.length}</span>
            </div>
          </div>

          {/* Hint de reinicio diario */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 relative z-10">
            <span className="text-lg">🔄</span>
            <p className="text-[10px] text-primary-300 leading-relaxed">
              Esta lista <strong className="text-primary-200">se reinicia cada día</strong> para que puedas registrar tu progreso diario. ¡Marca cada paso que completes hoy!
            </p>
          </div>

          <div className="w-full bg-primary-800 h-1.5 rounded-full overflow-hidden relative z-10 mt-2 mb-6">
            <div 
              className="bg-primary-400 h-full transition-all duration-500 ease-out"
              style={{ width: `${(checkedSteps.filter(Boolean).length / paciente.protocolo.length) * 100}%` }}
            ></div>
          </div>

          <ul className="space-y-3 pt-2 relative z-10">
            {paciente.protocolo.map((paso: string, i: number) => {
              const isChecked = checkedSteps[i];
              return (
                <li 
                  key={i} 
                  onClick={() => toggleStep(i)}
                  className={`flex gap-4 p-3 rounded-2xl cursor-pointer transition-all active:scale-95 border ${isChecked ? 'bg-primary-800/50 border-primary-700/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-primary-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-primary-300/50" />
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed transition-all ${isChecked ? 'text-primary-300 line-through' : 'text-primary-50 font-medium'}`}>
                    {paso}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Tarjeta de Recordatorios */}
      <div className="bg-white rounded-[28px] p-6 border border-primary-100 shadow-sm flex items-center justify-between gap-4">
        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0 text-primary-600">
          {remindersEnabled ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-primary-900 text-sm">Recordatorios</h3>
          <p className="text-primary-400 text-xs mt-0.5 leading-tight">
            {remindersEnabled ? 'Alertas diarias activadas.' : 'Activa alertas para tu rutina.'}
          </p>
        </div>
        <button 
          onClick={handleEnableReminders}
          disabled={remindersEnabled}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            remindersEnabled 
              ? 'bg-green-50 text-green-600 border border-green-200' 
              : 'bg-primary-900 text-white hover:bg-primary-800'
          }`}
        >
          {remindersEnabled ? 'Activo' : 'Activar'}
        </button>
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-4 text-primary-300 hover:text-red-400 transition font-bold text-sm"
      >
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </button>
    </main>
  );
}

function VistaTienda({ productos, loading, whatsappNumber }: { productos: any[], loading: boolean, whatsappNumber: string }) {
  return (
    <main className="px-5 pt-6 pb-4 space-y-6">
      <div className="bg-white rounded-[28px] p-5 border border-primary-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-primary-900 mb-1">Productos de la Clínica</h2>
          <p className="text-[10px] text-primary-400 uppercase tracking-widest font-bold">Disponibles en LR Fisioderm</p>
        </div>
        <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
          <Tag className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-start gap-2 bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3">
        <span className="text-base">🛋️</span>
        <p className="text-[11px] text-primary-500 leading-relaxed">
          Estos son los productos disponibles en la clínica. <strong>Consulta con tu especialista</strong> cuál es el más adecuado para tu tipo de piel antes de comprar.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-10">
          {productos.map((p) => (
            <div key={p.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-primary-50 group active:scale-95 transition">
              <div className="aspect-square overflow-hidden bg-primary-50">
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-200">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-primary-900 text-[11px] leading-tight h-8 line-clamp-2">{p.nombre}</h3>
                <p className="text-primary-600 font-serif font-bold text-base">${p.precio}</p>
                <a 
                  href={p.stripe_link || `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me interesa el producto: ' + p.nombre)}`}
                  target="_blank"
                  className="w-full block bg-primary-900 text-white text-[10px] font-bold py-2.5 rounded-xl text-center hover:bg-primary-800 transition"
                >
                  Comprar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function PWAPage() {
  const [paciente, setPaciente] = useState<any>(null);
  const [content, setContent] = useState<Tip[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'tip' | 'rutina'>('todos');
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string>('Todas');
  const [vista, setVista] = useState<Vista>('inicio');
  const [checking, setChecking] = useState(true);

  // --- SaaS Flags ---
  const [moduleStore, setModuleStore] = useState(true);
  const [moduleTips, setModuleTips] = useState(true);

  useEffect(() => {
    // 1. Intentar auto-login desde la URL (?code=UUID)
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');

    if (codeFromUrl) {
      // Limpiar el code de la URL para que no se vea feo después de login
      window.history.replaceState({}, '', '/pwa');
      // Intentar login automático con ese código
      autoLoginFromUrl(codeFromUrl);
      return;
    }

    // 2. Si no hay code en URL, revisar localStorage como antes
    const saved = localStorage.getItem('pwa_paciente');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPaciente(parsed);
      reFetchPaciente(parsed.id);
    }
    setChecking(false);
    fetchContent();
    fetchProductos();
    fetchConfig();
  }, []);

  async function autoLoginFromUrl(code: string) {
    fetchContent();
    fetchProductos();
    fetchConfig();
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(code.trim())) { setChecking(false); return; }

      const { data, error } = await supabase.from('pacientes').select('*').eq('id', code.trim()).single();
      if (!error && data) {
        const { data: evData } = await supabase.from('evaluaciones_clinicas').select('*').eq('paciente_id', code.trim()).order('created_at', { ascending: false }).limit(1).single();
        const fullData = { ...data, evaluacion: evData || {} };
        setPaciente(fullData);
        localStorage.setItem('pwa_paciente', JSON.stringify(fullData));
      }
    } catch (err) {
      console.error('Auto-login error:', err);
    } finally {
      setChecking(false);
    }
  }

  async function reFetchPaciente(id: string) {
    try {
      const { data, error } = await supabase.from('pacientes').select('*').eq('id', id).single();
      if (!error && data) {
        const { data: evData } = await supabase.from('evaluaciones_clinicas').select('*').eq('paciente_id', id).order('created_at', { ascending: false }).limit(1).single();
        const fullData = { ...data, evaluacion: evData || {} };
        setPaciente(fullData);
        localStorage.setItem('pwa_paciente', JSON.stringify(fullData));
      }
    } catch (err) {
      console.error('Error al sincronizar datos del paciente:', err);
    }
  }

  async function fetchConfig() {
    try {
      const { data } = await supabase.from('configuracion').select('clave, valor').in('clave', ['whatsapp', 'module_store', 'module_tips']);
      if (data) {
        data.forEach(item => {
          if (item.clave === 'whatsapp') setWhatsapp(item.valor);
          if (item.clave === 'module_store') setModuleStore(item.valor === 'true');
          if (item.clave === 'module_tips') {
            const hasTips = item.valor === 'true';
            setModuleTips(hasTips);
            if (!hasTips) setVista('perfil'); // Si no hay tips, iniciar en perfil
          }
        });
      }
    } catch {
      // Ignorar error si no existe la configuración
    }
  }

  async function fetchContent() {
    try {
      const { data } = await supabase.from('tips_rutinas').select('*').eq('visible_pwa', true);
      setContent(data && data.length > 0 ? data : TIPS_FICTICIOS);
    } catch {
      setContent(TIPS_FICTICIOS);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProductos() {
    try {
      const { data } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
      if (data) setProductos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProds(false);
    }
  }

  const handleLogin = (data: any) => {
    setPaciente(data);
    localStorage.setItem('pwa_paciente', JSON.stringify(data));
  };

  const handleLogout = () => {
    setPaciente(null);
    localStorage.removeItem('pwa_paciente');
    setVista('inicio');
  };

  if (checking) return null;
  if (!paciente) return <VistaLogin onLogin={handleLogin} />;

  const iniciales = `${paciente.nombre[0]}`;

  return (
    <div className="min-h-screen bg-primary-50 pb-28 max-w-md mx-auto relative shadow-2xl">
      <header className="bg-white px-6 pt-10 pb-5 sticky top-0 z-50 border-b border-primary-100 shadow-sm rounded-b-[36px]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary-900 truncate max-w-[200px]">
              {vista === 'inicio' ? `¡Hola, ${paciente.nombre}!` : 
               vista === 'perfil' ? 'Mi Perfil' : 
               vista === 'tienda' ? 'Tienda' : 'Portal'}
            </h1>
            <p className="text-primary-500 text-[10px] uppercase tracking-widest font-bold mt-1">LR Fisioderm</p>
          </div>
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-serif font-bold text-lg border-2 border-primary-200 overflow-hidden shadow-sm">
            {paciente.foto_url ? <img src={paciente.foto_url} className="w-full h-full object-cover" /> : iniciales}
          </div>
        </div>
      </header>

      {vista === 'inicio' && <VistaInicio tips={content} loading={loading} filter={filter} setFilter={setFilter} filtroEtiqueta={filtroEtiqueta} setFiltroEtiqueta={setFiltroEtiqueta} />}
      {vista === 'tienda' && <VistaTienda productos={productos} loading={loadingProds} whatsappNumber={whatsapp} />}
      {vista === 'perfil' && <VistaPerfil paciente={paciente} onLogout={handleLogout} />}

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm bg-primary-900/95 backdrop-blur-lg rounded-full px-6 py-3 flex justify-around items-center shadow-2xl z-50 border border-white/10">
        {[
          ...(moduleTips ? [{ id: 'inicio', label: 'Inicio', icon: <Key className="w-5 h-5" /> }] : []),
          ...(moduleStore ? [{ id: 'tienda', label: 'Tienda', icon: <Tag className="w-5 h-5" /> }] : []),
          { id: 'perfil', label: 'Mi Piel', icon: <User className="w-5 h-5" /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setVista(item.id as Vista)}
            className={`flex flex-col items-center gap-1 transition-all ${
              vista === item.id ? 'text-white' : 'text-primary-400'
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

