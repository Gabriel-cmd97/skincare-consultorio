'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { Loader2, User, Key, ArrowRight, LogOut, Instagram, Camera, Tag, Image as ImageIcon } from 'lucide-react';

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
    setLoading(true);
    setError('');

    try {
      const { data, error: sbError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', codigo.trim())
        .single();

      if (sbError || !data) {
        setError('Código no válido. Verifica con tu especialista.');
      } else {
        onLogin(data);
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
                </div>
              )}
              <div className="p-6 space-y-2">
                <div className="flex gap-2 items-center mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${item.tipo === 'rutina' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                    {item.tipo}
                  </span>
                  {item.etiqueta && item.etiqueta !== 'General' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-stone-100 text-stone-600">
                      {item.etiqueta}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-serif font-bold text-primary-900">{item.titulo}</h3>
                <p className="text-primary-700/80 text-sm leading-relaxed whitespace-pre-line">{item.contenido}</p>
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

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `paciente_${paciente.id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatares').getPublicUrl(fileName);
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
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Fototipo', value: paciente.fototipo || '—' },
            { label: 'Hidratación', value: paciente.hidratacion || '—' },
            { label: 'Sensibilidad', value: paciente.sensibilidad || '—' },
            { label: 'Objetivo', value: paciente.objetivo || '—' },
          ].map((item) => (
            <div key={item.label} className="bg-primary-50 rounded-2xl p-3">
              <p className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">{item.label}</p>
              <p className="font-bold text-primary-900 text-sm mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {paciente.protocolo && paciente.protocolo.length > 0 && (
        <div className="bg-primary-900 rounded-[32px] p-8 text-white space-y-4">
          <h3 className="font-serif font-bold text-xl">Tu Rutina</h3>
          <p className="text-primary-300 text-xs italic border-l-2 border-primary-500 pl-3">
            {paciente.tratamiento || 'Protocolo Personalizado'}
          </p>
          <ul className="space-y-4 pt-2">
            {paciente.protocolo.map((paso: string, i: number) => (
              <li key={i} className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-primary-800 flex items-center justify-center text-[10px] font-bold text-primary-300 shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-primary-100 leading-relaxed">{paso}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

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
          <h2 className="text-lg font-serif font-bold text-primary-900 mb-1">Productos Recomendados</h2>
          <p className="text-[10px] text-primary-400 uppercase tracking-widest font-bold">Seleccionados por tu especialista</p>
        </div>
        <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
          <Tag className="w-5 h-5" />
        </div>
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

  useEffect(() => {
    const saved = localStorage.getItem('pwa_paciente');
    if (saved) setPaciente(JSON.parse(saved));
    setChecking(false);
    fetchContent();
    fetchProductos();
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const { data } = await supabase.from('configuracion').select('valor').eq('clave', 'whatsapp').single();
      if (data) setWhatsapp(data.valor);
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
          { id: 'inicio', label: 'Inicio', icon: <Key className="w-5 h-5" /> },
          { id: 'tienda', label: 'Tienda', icon: <Tag className="w-5 h-5" /> },
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

