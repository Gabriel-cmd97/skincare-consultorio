'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { testWhatsAppConnection } from '@/actions/notificaciones';
import { 
  Palette, 
  Image as ImageIcon, 
  Save, 
  RefreshCw, 
  MessageSquare,
  Globe,
  Layout,
  Terminal,
  Database,
  Download,
  ToggleLeft
} from 'lucide-react';

export default function ConfigPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Logo y Colores
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  
  // WhatsApp y Notifs
  const [whatsapp, setWhatsapp] = useState('');
  const [callmebotApiKey, setCallmebotApiKey] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  // Secciones Landing
  const [landingServicios, setLandingServicios] = useState(true);
  const [landingProceso, setLandingProceso] = useState(true);
  const [landingTestimonios, setLandingTestimonios] = useState(false);
  const [landingEspecialista, setLandingEspecialista] = useState(true);
  const [landingUbicacion, setLandingUbicacion] = useState(true);

  // Modulos SaaS
  const [moduleStore, setModuleStore] = useState(true);
  const [moduleTips, setModuleTips] = useState(true);

  // Estado
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Pruebas WA y Exportacion
  const [testingWA, setTestingWA] = useState(false);
  const [waLogs, setWaLogs] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAdminAndFetchConfig();
  }, []);

  async function checkAdminAndFetchConfig() {
    try {
      setLoading(true);
      const { data: configData, error } = await supabase.from('configuracion').select('*');
      if (error) throw error;

      let adminEmail = '';

      if (configData) {
        configData.forEach((item) => {
          if (item.clave === 'admin_email') adminEmail = item.valor || '';
          if (item.clave === 'logo_url') setLogoUrl(item.valor || '');
          if (item.clave === 'primary_color') setPrimaryColor(item.valor || '');
          if (item.clave === 'whatsapp') setWhatsapp(item.valor || '');
          if (item.clave === 'callmebot_api_key') setCallmebotApiKey(item.valor || '');
          if (item.clave === 'site_url') setSiteUrl(item.valor || '');
          
          if (item.clave === 'landing_servicios') setLandingServicios(item.valor === 'true');
          if (item.clave === 'landing_proceso') setLandingProceso(item.valor === 'true');
          if (item.clave === 'landing_testimonios') setLandingTestimonios(item.valor === 'true');
          if (item.clave === 'landing_especialista') setLandingEspecialista(item.valor === 'true');
          if (item.clave === 'landing_ubicacion') setLandingUbicacion(item.valor === 'true');
          
          if (item.clave === 'module_store') setModuleStore(item.valor === 'true');
          if (item.clave === 'module_tips') setModuleTips(item.valor === 'true');
        });
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || session.user.email !== adminEmail) {
        router.replace('/dashboard');
        return;
      }
      
      setIsAdmin(true);

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
      { clave: 'logo_url', valor: logoUrl },
      { clave: 'primary_color', valor: primaryColor },
      { clave: 'whatsapp', valor: whatsapp },
      { clave: 'callmebot_api_key', valor: callmebotApiKey },
      { clave: 'site_url', valor: siteUrl },
      { clave: 'landing_servicios', valor: landingServicios.toString() },
      { clave: 'landing_proceso', valor: landingProceso.toString() },
      { clave: 'landing_testimonios', valor: landingTestimonios.toString() },
      { clave: 'landing_especialista', valor: landingEspecialista.toString() },
      { clave: 'landing_ubicacion', valor: landingUbicacion.toString() },
      { clave: 'module_store', valor: moduleStore.toString() },
      { clave: 'module_tips', valor: moduleTips.toString() },
    ];

    try {
      for (const config of configs) {
        const { error } = await supabase
          .from('configuracion')
          .upsert({ clave: config.clave, valor: config.valor }, { onConflict: 'clave' });
        if (error) throw error;
      }
      setMessage({ type: 'success', text: 'Configuración general actualizada con éxito.' });
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  }

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: pacientes, error: pError } = await supabase.from('pacientes').select('*');
      const { data: citas, error: cError } = await supabase.from('citas').select('*');
      
      if (pError || cError) throw new Error('Error al descargar datos');

      const exportData = {
        fecha_exportacion: new Date().toISOString(),
        pacientes: pacientes || [],
        citas: citas || []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo_clinica_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Respaldo descargado con éxito.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'No se pudo generar el respaldo.' });
    } finally {
      setExporting(false);
    }
  };

  if (loading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 rounded-3xl shadow-sm border border-primary-50 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-900">Configuración Súper Admin</h1>
          <p className="text-primary-600">Control maestro de plataforma SaaS (Diseño, Landing y WhatsApp).</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-200 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-2xl border font-medium ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Diseño */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-primary-50 space-y-5">
            <div className="flex items-center gap-3 text-primary-800">
              <ImageIcon className="w-5 h-5" />
              <h2 className="text-lg font-bold">Logotipo</h2>
            </div>
            
            <div className="space-y-4">
              <div className="h-24 bg-primary-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary-200 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="max-h-16 object-contain" />
                ) : (
                  <span className="text-primary-300 text-xs font-medium">Sin logo</span>
                )}
              </div>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full p-2.5 rounded-xl border border-primary-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-primary-50 space-y-5">
            <div className="flex items-center gap-3 text-primary-800">
              <Palette className="w-5 h-5" />
              <h2 className="text-lg font-bold">Color Primario</h2>
            </div>
            
            <div className="flex gap-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#D29C9F"
                className="flex-1 p-2.5 rounded-xl border border-primary-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition font-mono uppercase"
              />
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-primary-50 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <Database className="w-5 h-5" />
              <h2 className="text-lg font-bold">Respaldo Datos</h2>
            </div>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition border border-emerald-200"
            >
              {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? 'Generando JSON...' : 'Exportar JSON'}
            </button>
          </section>
        </div>

        {/* Columna 2: Infra y WhatsApp */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-primary-50 space-y-5">
            <div className="flex items-center gap-3 text-blue-600">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-lg font-bold">WhatsApp y URL</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Número Destino</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 521733..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">CallMeBot API Key</label>
                <input
                  type="text"
                  value={callmebotApiKey}
                  onChange={(e) => setCallmebotApiKey(e.target.value)}
                  placeholder="Ej: 7720184"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">URL Base</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://lrfisioderm.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    setTestingWA(true);
                    setWaLogs(['⏳ Iniciando diagnóstico...']);
                    const res = await testWhatsAppConnection();
                    setWaLogs(res.logs);
                    setTestingWA(false);
                  }}
                  disabled={testingWA}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
                >
                  <Terminal className="w-4 h-4" />
                  {testingWA ? 'Probando...' : 'Test WhatsApp'}
                </button>
                {waLogs.length > 0 && (
                  <div className="mt-3 bg-slate-900 rounded-xl p-3 font-mono text-[10px] leading-relaxed max-h-32 overflow-y-auto border border-slate-800">
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
            </div>
          </section>
        </div>

        {/* Columna 3: Toggles SaaS */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-primary-50">
            <div className="flex items-center gap-3 text-amber-500 mb-5">
              <Layout className="w-5 h-5" />
              <h2 className="text-lg font-bold">Secciones Landing</h2>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Servicios', state: landingServicios, setter: setLandingServicios },
                { label: 'Proceso de Atención', state: landingProceso, setter: setLandingProceso },
                { label: 'Testimonios', state: landingTestimonios, setter: setLandingTestimonios },
                { label: 'Especialista', state: landingEspecialista, setter: setLandingEspecialista },
                { label: 'Ubicación', state: landingUbicacion, setter: setLandingUbicacion },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => s.setter(!s.state)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    s.state 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="text-sm font-bold">{s.label}</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${s.state ? 'bg-amber-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${s.state ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </button>
              ))}
            </div>
          </section>
          
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-primary-50 space-y-5">
            <div className="flex items-center gap-3 text-purple-600">
              <ToggleLeft className="w-5 h-5" />
              <h2 className="text-lg font-bold">Módulos Plataforma</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Catálogo de Productos', state: moduleStore, setter: setModuleStore },
                { label: 'Rutinas y Tips', state: moduleTips, setter: setModuleTips },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => s.setter(!s.state)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    s.state 
                      ? 'bg-purple-50 border-purple-200 text-purple-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="text-sm font-bold">{s.label}</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${s.state ? 'bg-purple-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${s.state ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
