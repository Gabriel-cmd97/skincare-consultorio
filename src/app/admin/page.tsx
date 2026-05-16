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
  Terminal,
  Lock,
  ArrowRight,
  Database,
  Download,
  ToggleLeft,
  ExternalLink
} from 'lucide-react';
import { verifyAdminPassword } from '@/actions/admin';

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

  // Módulos SaaS
  const [moduleStore, setModuleStore] = useState(true);
  const [moduleTips, setModuleTips] = useState(true);

  // Status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWA, setTestingWA] = useState(false);
  const [waLogs, setWaLogs] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check session storage on mount
    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchConfig();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    
    try {
      const result = await verifyAdminPassword(password);
      if (result.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        fetchConfig();
      } else {
        setAuthError('Contraseña incorrecta.');
      }
    } catch (err) {
      setAuthError('Error de conexión.');
    } finally {
      setIsAuthenticating(false);
    }
  };

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
          
          if (item.clave === 'module_store') setModuleStore(item.valor === 'true');
          if (item.clave === 'module_tips') setModuleTips(item.valor === 'true');
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
      { clave: 'module_store', valor: String(moduleStore) },
      { clave: 'module_tips', valor: String(moduleTips) },
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
          <div className="p-8 text-center space-y-2 border-b border-slate-700/50 bg-slate-800/50">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Acceso Restringido</h1>
            <p className="text-slate-400 text-sm">Panel de soporte técnico y administración.</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contraseña Maestra</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              {authError && <p className="text-rose-400 text-sm mt-2 font-medium">{authError}</p>}
            </div>
            <button
              type="submit"
              disabled={isAuthenticating || !password}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAuthenticating ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Ingresar al Panel'}
              {!isAuthenticating && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Columna 1: Configuración Básica */}
          <div className="space-y-6">
            <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2 text-blue-400">
                <MessageSquare className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">WhatsApp & Notifs</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Número Destino</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: 521733..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">CallMeBot API Key</label>
                  <input
                    type="text"
                    value={callmebotApiKey}
                    onChange={(e) => setCallmebotApiKey(e.target.value)}
                    placeholder="Ej: 7720184"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
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
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Terminal className="w-4 h-4" />
                  {testingWA ? 'Probando...' : 'Test WhatsApp'}
                </button>
                {waLogs.length > 0 && (
                  <div className="mt-3 bg-black/40 rounded-lg p-3 font-mono text-[9px] leading-relaxed max-h-32 overflow-y-auto border border-slate-700">
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

            <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Globe className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">Infraestructura</h2>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">URL Base</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </section>
          </div>

          {/* Columna 2: Visibilidad (Toggles compactos) */}
          <div className="space-y-6">
            <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <Layout className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">Secciones Landing</h2>
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                      s.state 
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-100' 
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-bold">{s.label}</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${s.state ? 'bg-blue-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${s.state ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </section>
            
            <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-purple-400">
                <ToggleLeft className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">Módulos SaaS</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Catálogo de Productos', state: moduleStore, setter: setModuleStore },
                  { label: 'Rutinas y Tips', state: moduleTips, setter: setModuleTips },
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => s.setter(!s.state)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                      s.state 
                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-100' 
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-bold">{s.label}</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${s.state ? 'bg-purple-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${s.state ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Columna 3: Accesos y Respaldo */}
          <div className="space-y-6">
            <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-fuchsia-400">
                <ExternalLink className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">Accesos VIP</h2>
              </div>
              <p className="text-[11px] text-slate-400">Editores visuales de marca y contenido.</p>
              
              <div className="space-y-2">
                <a href="/dashboard/configuracion" target="_blank" className="w-full flex items-center justify-between p-3 rounded-xl border bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 transition-all group">
                  <span className="text-xs font-bold">🎨 Config. Marca</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-fuchsia-400" />
                </a>
                <a href="/dashboard/landing" target="_blank" className="w-full flex items-center justify-between p-3 rounded-xl border bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 transition-all group">
                  <span className="text-xs font-bold">📝 Editor Landing</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-fuchsia-400" />
                </a>
              </div>
            </section>

            <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Database className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-sm">Respaldo</h2>
              </div>
              <p className="text-[11px] text-slate-400">Descarga en JSON de la BD.</p>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? 'Generando...' : 'Exportar JSON'}
              </button>
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
