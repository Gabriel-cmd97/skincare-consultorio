'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

type Section = 'servicios' | 'proceso' | 'testimonios' | 'especialista' | 'ubicacion';

const SECTIONS: { id: Section; label: string; emoji: string }[] = [
  { id: 'servicios', label: 'Servicios', emoji: '✨' },
  { id: 'proceso', label: 'Proceso', emoji: '👣' },
  { id: 'testimonios', label: 'Testimonios', emoji: '⭐' },
  { id: 'especialista', label: 'Especialista', emoji: '👩‍⚕️' },
  { id: 'ubicacion', label: 'Ubicación', emoji: '📍' },
];

interface ServicioItem { titulo: string; descripcion: string; }
interface PasoItem { titulo: string; descripcion: string; }
interface TestimonioItem { nombre: string; texto: string; }

export default function LandingEditorPage() {
  const [activeTab, setActiveTab] = useState<Section>('servicios');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Sección Hero ---
  const [heroTitulo, setHeroTitulo] = useState('Tu piel merece un enfoque clínico');
  const [heroSubtitulo, setHeroSubtitulo] = useState('Tratamientos especializados en alteraciones de la piel y tejidos en Toluca. Cuidado profesional con base científica para resultados reales.');
  const [heroBadge, setHeroBadge] = useState('Especialidad en Fisioterapia Dermatofuncional');

  // --- Sección Servicios ---
  const defaultServicios: ServicioItem[] = [
    { titulo: 'Limpieza Profunda Clínica', descripcion: 'Extracción profesional de impurezas con aparatología y productos dermatológicos de alta gama.' },
    { titulo: 'Peeling Químico', descripcion: 'Renovación celular intensiva para tratar manchas, marcas de acné y textura irregular.' },
    { titulo: 'Control de Acné', descripcion: 'Protocolo clínico para desinflamar, controlar la bacteria y restaurar la barrera cutánea.' },
    { titulo: 'Rejuvenecimiento Facial', descripcion: 'Estimulación de colágeno y elastina para mejorar la firmeza y atenuar líneas de expresión.' },
    { titulo: 'Valoración Dermatofuncional', descripcion: 'Análisis profundo de la piel con luz de Wood para diseñar tu protocolo personalizado.' },
    { titulo: 'Dermapen / Microneedling', descripcion: 'Terapia de inducción de colágeno para cicatrices, estrías y revitalización facial.' },
  ];
  const [servicios, setServicios] = useState<ServicioItem[]>(defaultServicios);

  // --- Sección Proceso ---
  const defaultPasos: PasoItem[] = [
    { titulo: 'Valoración', descripcion: 'Análisis clínico profundo para entender las necesidades únicas de tu piel y tus objetivos.' },
    { titulo: 'Protocolo', descripcion: 'Diseño de un plan de tratamiento en cabina combinado con una rutina para casa.' },
    { titulo: 'Seguimiento', descripcion: 'Acompañamiento constante a través de nuestra App (PWA) para garantizar resultados.' },
  ];
  const [pasos, setPasos] = useState<PasoItem[]>(defaultPasos);

  // --- Sección Testimonios ---
  const defaultTestimonios: TestimonioItem[] = [
    { nombre: 'Sofía R.', texto: 'El cambio en mi acné ha sido increíble. Después de años probando de todo, el enfoque clínico de LR Fisioderm fue lo único que me funcionó. Mi piel está sana.' },
    { nombre: 'Daniela M.', texto: 'La valoración es súper completa. Me explicaron exactamente qué necesitaba mi piel y la rutina de casa es fácil de seguir desde la aplicación.' },
    { nombre: 'Carmen T.', texto: 'Excelente atención y profesionalismo. Los tratamientos de rejuvenecimiento han mejorado muchísimo la textura de mi piel. Se nota la diferencia.' },
  ];
  const [testimonios, setTestimonios] = useState<TestimonioItem[]>(defaultTestimonios);

  // --- Sección Especialista ---
  const [especialista, setEspecialista] = useState({ titulo: 'Lic. en Fisioterapia', descripcion: 'Con especialidad en Fisioterapia Dermatofuncional. Mi pasión es devolverle la salud y funcionalidad a tu piel a través de tratamientos con rigor científico y tecnología de vanguardia.', instagram: 'lr_fisderm' });

  // --- Sección Ubicación ---
  const [ubicacion, setUbicacion] = useState({ titulo: 'Tu clínica de confianza en Toluca', direccion: 'Toluca de Lerdo, Estado de México', horario: 'Lunes a Viernes: 9:00 am - 6:00 pm\nSábados: Previa cita', googleMapsUrl: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data } = await supabase.from('configuracion').select('*');
      const config = (data || []).reduce((acc: any, item: any) => { acc[item.clave] = item.valor; return acc; }, {});
      if (config.hero_info) try { const d = JSON.parse(config.hero_info); setHeroTitulo(d.titulo || heroTitulo); setHeroSubtitulo(d.subtitulo || heroSubtitulo); setHeroBadge(d.badge || heroBadge); } catch(e){}
      if (config.servicios_content) try { setServicios(JSON.parse(config.servicios_content)); } catch(e){}
      if (config.proceso_content) try { setPasos(JSON.parse(config.proceso_content)); } catch(e){}
      if (config.testimonios_content) try { setTestimonios(JSON.parse(config.testimonios_content)); } catch(e){}
      if (config.especialista_info) try { setEspecialista(JSON.parse(config.especialista_info)); } catch(e){}
      if (config.ubicacion_info) try { setUbicacion(prev => ({ ...prev, ...JSON.parse(config.ubicacion_info) })); } catch(e){}
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updates = [
        { clave: 'hero_info', valor: JSON.stringify({ titulo: heroTitulo, subtitulo: heroSubtitulo, badge: heroBadge }) },
        { clave: 'servicios_content', valor: JSON.stringify(servicios) },
        { clave: 'proceso_content', valor: JSON.stringify(pasos) },
        { clave: 'testimonios_content', valor: JSON.stringify(testimonios) },
        { clave: 'especialista_info', valor: JSON.stringify(especialista) },
        { clave: 'ubicacion_info', valor: JSON.stringify(ubicacion) },
      ];
      for (const u of updates) {
        const { error } = await supabase.from('configuracion').upsert(u, { onConflict: 'clave' });
        if (error) throw error;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      console.error(e);
      alert('Error al guardar');
    } finally { setSaving(false); }
  }

  // --- Helpers para listas ---
  function updateServicio(i: number, field: keyof ServicioItem, value: string) {
    setServicios(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }
  function updatePaso(i: number, field: keyof PasoItem, value: string) {
    setPasos(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }
  function updateTestimonio(i: number, field: keyof TestimonioItem, value: string) {
    setTestimonios(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  }
  function addTestimonio() { setTestimonios(prev => [...prev, { nombre: '', texto: '' }]); }
  function removeTestimonio(i: number) { setTestimonios(prev => prev.filter((_, idx) => idx !== i)); }

  const inputCls = 'w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500 bg-white text-primary-900 text-sm transition';
  const labelCls = 'block text-xs font-bold text-primary-500 uppercase tracking-wider mb-1.5';

  if (loading) return <div className="p-8 text-primary-400 animate-pulse">Cargando editor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-900">Editor de Página Principal</h1>
          <p className="text-primary-500 mt-1">Personaliza el contenido de cada sección de tu sitio web público.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all shadow-lg ${saved ? 'bg-green-500' : 'bg-primary-600 hover:bg-primary-700'} disabled:opacity-50`}
        >
          {saving ? '💾 Guardando...' : saved ? '✅ ¡Guardado!' : '💾 Guardar Cambios'}
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-primary-100 overflow-x-auto">
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === sec.id ? 'border-primary-600 text-primary-900 bg-primary-50' : 'border-transparent text-primary-400 hover:text-primary-700 hover:bg-primary-50/50'}`}
            >
              <span>{sec.emoji}</span>
              {sec.label}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-6">

          {/* ---- SERVICIOS ---- */}
          {activeTab === 'servicios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-primary-900 mb-1">Servicios y Tratamientos</h2>
                <p className="text-sm text-primary-400">Edita los 6 servicios que se muestran en la sección de tratamientos.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {servicios.map((s, i) => (
                  <div key={i} className="p-5 bg-primary-50 rounded-2xl border border-primary-100 space-y-3">
                    <p className="text-xs font-black text-primary-400 uppercase">Servicio {i + 1}</p>
                    <div>
                      <label className={labelCls}>Título</label>
                      <input type="text" value={s.titulo} onChange={e => updateServicio(i, 'titulo', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Descripción</label>
                      <textarea value={s.descripcion} onChange={e => updateServicio(i, 'descripcion', e.target.value)} rows={2} className={inputCls} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- PROCESO ---- */}
          {activeTab === 'proceso' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-primary-900 mb-1">Proceso (3 Pasos)</h2>
                <p className="text-sm text-primary-400">Edita los pasos de tu metodología de atención.</p>
              </div>
              <div className="space-y-4">
                {pasos.map((p, i) => (
                  <div key={i} className="p-5 bg-primary-50 rounded-2xl border border-primary-100 flex gap-6 items-start">
                    <div className="w-10 h-10 bg-primary-900 text-white rounded-full flex items-center justify-center font-serif font-bold text-lg shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className={labelCls}>Título del Paso</label>
                        <input type="text" value={p.titulo} onChange={e => updatePaso(i, 'titulo', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Descripción</label>
                        <textarea value={p.descripcion} onChange={e => updatePaso(i, 'descripcion', e.target.value)} rows={2} className={inputCls} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- TESTIMONIOS ---- */}
          {activeTab === 'testimonios' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary-900 mb-1">Testimonios de Pacientes</h2>
                  <p className="text-sm text-primary-400">Agrega, edita o elimina testimonios de tus pacientes.</p>
                </div>
                <button onClick={addTestimonio} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition">
                  + Agregar
                </button>
              </div>
              <div className="space-y-4">
                {testimonios.map((t, i) => (
                  <div key={i} className="p-5 bg-primary-50 rounded-2xl border border-primary-100 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex gap-1 text-amber-400">{'★★★★★'}</div>
                      <button onClick={() => removeTestimonio(i)} className="text-red-400 hover:text-red-600 text-xs font-bold transition">✕ Eliminar</button>
                    </div>
                    <div>
                      <label className={labelCls}>Nombre del Paciente</label>
                      <input type="text" value={t.nombre} onChange={e => updateTestimonio(i, 'nombre', e.target.value)} className={inputCls} placeholder="Ej: Sofía R." />
                    </div>
                    <div>
                      <label className={labelCls}>Testimonio</label>
                      <textarea value={t.texto} onChange={e => updateTestimonio(i, 'texto', e.target.value)} rows={3} className={inputCls} placeholder="Escribe el testimonio aquí..." />
                    </div>
                  </div>
                ))}
                {testimonios.length === 0 && (
                  <div className="text-center py-12 text-primary-300">
                    <p className="text-lg">No hay testimonios aún.</p>
                    <p className="text-sm">Haz clic en "+ Agregar" para añadir el primero.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- ESPECIALISTA ---- */}
          {activeTab === 'especialista' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-primary-900 mb-1">Sobre la Especialista</h2>
                <p className="text-sm text-primary-400">Tu perfil profesional que aparece en la página principal.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Título Profesional</label>
                  <input type="text" value={especialista.titulo} onChange={e => setEspecialista({...especialista, titulo: e.target.value})} className={inputCls} placeholder="Ej: Lic. en Fisioterapia" />
                </div>
                <div>
                  <label className={labelCls}>Descripción / Bio</label>
                  <textarea value={especialista.descripcion} onChange={e => setEspecialista({...especialista, descripcion: e.target.value})} rows={5} className={inputCls} placeholder="Cuéntale a tus pacientes quién eres y cuál es tu enfoque clínico..." />
                  <p className="text-xs text-primary-400 mt-1">Tip: puedes usar Enter para separar párrafos.</p>
                </div>
                <div>
                  <label className={labelCls}>Usuario de Instagram (sin @)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400 font-bold text-lg">@</span>
                    <input type="text" value={especialista.instagram} onChange={e => setEspecialista({...especialista, instagram: e.target.value.replace('@', '')})} className={`${inputCls} flex-1`} placeholder="lr_fisderm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- UBICACIÓN ---- */}
          {activeTab === 'ubicacion' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-primary-900 mb-1">Ubicación y Contacto</h2>
                <p className="text-sm text-primary-400">La información de contacto y mapa de tu clínica.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Título de la Sección</label>
                  <input type="text" value={ubicacion.titulo} onChange={e => setUbicacion({...ubicacion, titulo: e.target.value})} className={inputCls} placeholder="Tu clínica de confianza en Toluca" />
                </div>
                <div>
                  <label className={labelCls}>Dirección</label>
                  <input type="text" value={ubicacion.direccion} onChange={e => setUbicacion({...ubicacion, direccion: e.target.value})} className={inputCls} placeholder="Toluca de Lerdo, Estado de México" />
                </div>
                <div>
                  <label className={labelCls}>Horario de Atención</label>
                  <textarea value={ubicacion.horario} onChange={e => setUbicacion({...ubicacion, horario: e.target.value})} rows={3} className={inputCls} placeholder={'Lunes a Viernes: 9:00 am - 6:00 pm\nSábados: Previa cita'} />
                  <p className="text-xs text-primary-400 mt-1">Usa Enter para separar líneas de horario.</p>
                </div>
                <div>
                  <label className={labelCls}>Google Maps Embed URL</label>
                  <input type="text" value={ubicacion.googleMapsUrl} onChange={e => setUbicacion({...ubicacion, googleMapsUrl: e.target.value})} className={inputCls} placeholder="https://www.google.com/maps/embed?pb=..." />
                  <div className="mt-2 p-4 bg-primary-50 rounded-xl border border-primary-100 text-xs text-primary-600 space-y-1">
                    <p className="font-bold text-primary-800">📍 Cómo obtener el enlace del mapa:</p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Busca tu clínica en Google Maps.</li>
                      <li>Haz clic en <b>Compartir</b>.</li>
                      <li>Selecciona <b>"Incorporar un mapa"</b>.</li>
                      <li>Copia solo el texto dentro de <code className="bg-white px-1 rounded border">src="..."</code></li>
                    </ol>
                  </div>
                  {ubicacion.googleMapsUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden h-48 border border-primary-100 shadow-sm">
                      <iframe src={ubicacion.googleMapsUrl} className="w-full h-full border-0" loading="lazy"></iframe>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
