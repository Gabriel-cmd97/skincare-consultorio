'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { testWhatsAppConnection } from '@/actions/notificaciones';
import { 
  Settings, 
  MessageSquare, 
  Globe, 
  Layout, 
  Save, 
  ShieldCheck, 
  RefreshCw,
  Terminal
} from 'lucide-react';

interface ConfigItem {
  clave: string;
  valor: string;
}

export default function AdminSoportePage() {
  // Configuración Técnica
  const [whatsapp, setWhatsapp] = useState('');
  const [callmebotApiKey, setCallmebotApiKey] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  
  // Secciones Landing
  const [landingServicios, setLandingServicios] = useState(true);
  const [landingProceso, setLandingProceso] = useState(true);
  const [landingTestimonios, setLandingTestimonios] = useState(false);
  const [landingEspecialista, setLandingEspecialista] = useState(true);
  const [landingUbicacion, setLandingUbicacion] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWA, setTestingWA] = useState(false);
  const [waLogs, setWaLogs] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('configuracion').select('*');
      if (error) throw error;

      if (data) {
        data.forEach((item: ConfigItem) => {
          if (item.clave === 'whatsapp') setWhatsapp(item.valor || '');
          if (item.clave === 'callmebot_api_key') setCallmebotApiKey(item.valor || '');
          if (item.clave === 'site_url') setSiteUrl(item.valor || '');
          
          if (item.clave === 'landing_servicios') setLandingServicios(item.valor === 'true');
          if (item.clave === 'landing_proceso') setLandingProceso(item.valor === 'true');
          if (item.clave === 'landing_testimonios') setLandingTestimonios(item.valor === 'true');
          if (item.clave === 'landing_especialista') setLandingEspecialista(item.valor === 'true');
          if (item.clave === 'landing_ubicacion') setLandingUbicacion(item.valor === 'true');
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    
    const configs = [
      { clave: 'whatsapp', valor: whatsapp },
      { clave: 'callmebot_api_key', valor: callmebotApiKey },
      { clave: 'site_url', valor: siteUrl },
      { clave: 'landing_servicios', valor: String(landingServicios) },
      { clave: 'landing_proceso', valor: String(landingProceso) },
      { clave: 'landing_testimonios', valor: String(landingTestimonios) },
      { clave: 'landing_especialista', valor: String(landingEspecialista) },
      { clave: 'landing_ubicacion', valor: String(landingUbicacion) },
    ];

    try {
      for (const config of configs) {
        const { error } = await supabase
          .from('configuracion')
          .upsert({ clave: config.clave, valor: config.valor }, { onConflict: 'clave' });
        if (error) throw error;
      }
      setMessage({ type: 'success', text: 'Configuración técnica actualizada correctamente.' });
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Panel de Soporte Técnico</h1>
              <p className="text-slate-400 text-sm">Configuración crítica de infraestructura y servicios</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/50 text-rose-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna Izquierda: Mensajería y URL */}
          <div className="space-y-8">
            <section className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-blue-400">
                <MessageSquare className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">WhatsApp & Notificaciones</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Número Destino (Internacional)</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: 521733..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">CallMeBot API Key</label>
                  <input
                    type="text"
                    value={callmebotApiKey}
                    onChange={(e) => setCallmebotApiKey(e.target.value)}
                    placeholder="Ej: 7720184"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={async () => {
                    setTestingWA(true);
                    setWaLogs(['⏳ Iniciando diagnóstico...']);
                    const res = await testWhatsAppConnection();
                    setWaLogs(res.logs);
                    setTestingWA(false);
                  }}
                  disabled={testingWA}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
                >
                  <Terminal className="w-4 h-4" />
                  {testingWA ? 'Probando...' : 'Ejecutar Test de WhatsApp'}
                </button>
                {waLogs.length > 0 && (
                  <div className="mt-4 bg-black/40 rounded-xl p-4 font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto border border-slate-700">
                    {waLogs.map((log, i) => (
                      <div key={i} className={
                        log.includes('✅') ? 'text-emerald-400' : 
                        log.includes('❌') || log.includes('⛔') ? 'text-rose-400' : 
                        'text-slate-300'
                      }>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Globe className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">Infraestructura Web</h2>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">URL Base del Proyecto</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <p className="mt-2 text-[10px] text-slate-500">Usada para generar links absolutos en notificaciones externas.</p>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Secciones de la Landing */}
          <div className="space-y-8">
            <section className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 h-full">
              <div className="flex items-center gap-2 text-amber-400 mb-6">
                <Layout className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">Visibilidad de Secciones (PWA/Landing)</h2>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Servicios y Tratamientos', state: landingServicios, setter: setLandingServicios },
                  { label: 'Proceso de Atención', state: landingProceso, setter: setLandingProceso },
                  { label: 'Testimonios', state: landingTestimonios, setter: setLandingTestimonios },
                  { label: 'Sobre Especialista', state: landingEspecialista, setter: setLandingEspecialista },
                  { label: 'Ubicación y Contacto', state: landingUbicacion, setter: setLandingUbicacion },
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => s.setter(!s.state)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      s.state 
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-100' 
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="text-sm font-medium">{s.label}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${s.state ? 'bg-blue-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${s.state ? 'left-6' : 'left-1'}`} />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="flex gap-3">
                  <Settings className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-200/70 leading-relaxed">
                    <b>Nota de Soporte:</b> Estos cambios afectan directamente la visibilidad de componentes en la página pública. Desactivar secciones innecesarias mejora la velocidad de carga.
                  </p>
                </div>
              </div>
            </section>
          </div>

        </div>

        <footer className="text-center py-8">
          <p className="text-slate-600 text-xs tracking-widest uppercase">Admin Support Interface &copy; 2026</p>
        </footer>

      </div>
    </div>
  );
}
