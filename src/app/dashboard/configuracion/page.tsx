'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface ConfigItem {
  clave: string;
  valor: string;
}

export default function ConfigPage() {
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [callmebotApiKey, setCallmebotApiKey] = useState('');
  
  // Secciones Landing
  const [landingServicios, setLandingServicios] = useState(true);
  const [landingProceso, setLandingProceso] = useState(true);
  const [landingTestimonios, setLandingTestimonios] = useState(false);
  const [landingEspecialista, setLandingEspecialista] = useState(true);
  const [landingUbicacion, setLandingUbicacion] = useState(true);

  // Datos detallados de las secciones
  const [especialistaInfo, setEspecialistaInfo] = useState({ titulo: 'Lic. en Fisioterapia', descripcion: 'Con especialidad en Fisioterapia Dermatofuncional...', instagram: 'lr_fisderm' });
  const [ubicacionInfo, setUbicacionInfo] = useState({ direccion: 'Toluca de Lerdo, Estado de México', horario: 'Lunes a Viernes: 9:00 am - 6:00 pm', googleMapsUrl: '' });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const { data, error } = await supabase.from('configuracion').select('*');
      if (error) throw error;

      if (data && Array.isArray(data)) {
        data.forEach((item: any) => {
          const configItem = item as ConfigItem;
          if (configItem.clave === 'logo_url') setLogoUrl(configItem.valor || '');
          if (configItem.clave === 'primary_color') setPrimaryColor(configItem.valor || '');
          if (configItem.clave === 'whatsapp') setWhatsapp(configItem.valor || '');
          if (configItem.clave === 'callmebot_api_key') setCallmebotApiKey(configItem.valor || '');
          
          if (configItem.clave === 'landing_servicios') setLandingServicios(configItem.valor === 'true');
          if (configItem.clave === 'landing_proceso') setLandingProceso(configItem.valor === 'true');
          if (configItem.clave === 'landing_testimonios') setLandingTestimonios(configItem.valor === 'true');
          if (configItem.clave === 'landing_especialista') setLandingEspecialista(configItem.valor === 'true');
          if (configItem.clave === 'landing_ubicacion') setLandingUbicacion(configItem.valor === 'true');
          
          if (configItem.clave === 'especialista_info' && configItem.valor) {
            try { setEspecialistaInfo(JSON.parse(configItem.valor)); } catch(e){}
          }
          if (configItem.clave === 'ubicacion_info' && configItem.valor) {
            try { setUbicacionInfo(JSON.parse(configItem.valor)); } catch(e){}
          }
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
    try {
      const updates = [
        { clave: 'logo_url', valor: logoUrl },
        { clave: 'primary_color', valor: primaryColor },
        { clave: 'whatsapp', valor: whatsapp },
        { clave: 'callmebot_api_key', valor: callmebotApiKey },
        { clave: 'landing_servicios', valor: String(landingServicios) },
        { clave: 'landing_proceso', valor: String(landingProceso) },
        { clave: 'landing_testimonios', valor: String(landingTestimonios) },
        { clave: 'landing_especialista', valor: String(landingEspecialista) },
        { clave: 'landing_ubicacion', valor: String(landingUbicacion) },
        { clave: 'especialista_info', valor: JSON.stringify(especialistaInfo) },
        { clave: 'ubicacion_info', valor: JSON.stringify(ubicacionInfo) },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('configuracion')
          .upsert(update, { onConflict: 'clave' });
        if (error) throw error;
      }
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-primary-500">Cargando configuración...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-primary-900">Personalización</h1>
        <p className="text-primary-600">Administra la identidad visual de tu consultorio.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-primary-100 shadow-sm space-y-8">
        {/* Logo Section */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-primary-900 uppercase tracking-wider">URL del Logotipo</label>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
              className="flex-1 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition text-primary-900"
            />
            {logoUrl && (
              <div className="w-12 h-12 rounded-full overflow-hidden border border-primary-100 bg-primary-50 flex-shrink-0">
                <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <p className="text-xs text-primary-400 italic">Pega la URL de tu imagen (puedes subirla a un servicio como ImgBB o usar la de Instagram).</p>
        </div>

        {/* WhatsApp Contacto Section */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-primary-900 uppercase tracking-wider">Número de WhatsApp (Ventas)</label>
          <div className="flex gap-4 items-center">
            <span className="text-xl">📱</span>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej: 527221234567"
              className="flex-1 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition text-primary-900"
            />
          </div>
          <p className="text-xs text-primary-400">Incluye el código de país (ej. 52 para México) sin el signo +. Aquí te llegarán los pedidos de la tienda.</p>
        </div>

        {/* Colors Section */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-primary-900 uppercase tracking-wider">Color Primario (Marca)</label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={primaryColor || '#b87c6f'}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-12 rounded-lg cursor-pointer border-none"
            />
            <input
              type="text"
              value={primaryColor || ''}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#b87c6f"
              className="w-32 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition uppercase text-primary-900"
            />
          </div>
          <p className="text-xs text-primary-400">Este color se usará para botones, encabezados y elementos destacados.</p>
        </div>

        {/* CallMeBot API Section */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-primary-900 uppercase tracking-wider">API Key WhatsApp (CallMeBot)</label>
          <div className="flex gap-4 items-center">
            <span className="text-xl">🤖</span>
            <input
              type="text"
              value={callmebotApiKey}
              onChange={(e) => setCallmebotApiKey(e.target.value)}
              placeholder="Ej: 123456"
              className="flex-1 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition text-primary-900"
            />
          </div>
          <div className="text-xs text-primary-600 space-y-2 bg-primary-50 p-5 rounded-2xl border border-primary-100">
            <p className="font-bold text-primary-900">¿Cómo obtener tu clave gratuita para recibir notificaciones por WhatsApp?</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Añade el número <b className="text-primary-800">+34 694 242 562</b> a los contactos de tu celular.</li>
              <li>Envíale un mensaje por WhatsApp a ese número que diga exactamente: <code className="bg-white px-1 py-0.5 rounded text-primary-900 font-bold border border-primary-100">I allow callmebot to send me messages</code></li>
              <li>El bot te responderá inmediatamente con tu <b>API Key</b> (una clave de números). Pégala aquí arriba.</li>
            </ol>
            <p className="text-primary-500 italic mt-2">Asegúrate de que tu "Número de WhatsApp (Ventas)" esté correctamente escrito con el código de país (ej. 52 para México).</p>
          </div>
        </div>

        {/* Secciones de la Landing Page */}
        <div className="space-y-4 pt-6 border-t border-primary-50">
          <label className="block text-sm font-bold text-primary-900 uppercase tracking-wider">Secciones de la Página Principal (Landing Page)</label>
          <p className="text-xs text-primary-500 mb-4">Activa o desactiva las secciones que quieres mostrar en tu sitio web público.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'servicios', label: '1. Servicios y Tratamientos', state: landingServicios, setter: setLandingServicios },
              { id: 'proceso', label: '2. Proceso (3 Pasos)', state: landingProceso, setter: setLandingProceso },
              { id: 'testimonios', label: '3. Testimonios de Pacientes', state: landingTestimonios, setter: setLandingTestimonios },
              { id: 'especialista', label: '4. Sobre la Especialista', state: landingEspecialista, setter: setLandingEspecialista },
              { id: 'ubicacion', label: '5. Ubicación y Contacto', state: landingUbicacion, setter: setLandingUbicacion },
            ].map((seccion) => (
              <label key={seccion.id} className="flex items-center gap-3 p-4 border border-primary-100 rounded-2xl cursor-pointer hover:bg-primary-50 transition">
                <div className="relative inline-block w-10 h-6">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={seccion.state}
                    onChange={(e) => seccion.setter(e.target.checked)}
                  />
                  <div className="w-10 h-6 bg-primary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-primary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </div>
                <span className="text-sm font-bold text-primary-900">{seccion.label}</span>
              </label>
            ))}
          </div>

          {/* Formulario de Especialista (Condicional) */}
          {landingEspecialista && (
            <div className="mt-6 p-6 bg-primary-50 rounded-2xl border border-primary-100 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-primary-900">Editar "Sobre la Especialista"</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase mb-1">Título Profesional</label>
                  <input type="text" value={especialistaInfo.titulo} onChange={e => setEspecialistaInfo({...especialistaInfo, titulo: e.target.value})} className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: Lic. en Fisioterapia" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase mb-1">Descripción / Bio</label>
                  <textarea value={especialistaInfo.descripcion} onChange={e => setEspecialistaInfo({...especialistaInfo, descripcion: e.target.value})} rows={3} className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500" placeholder="Cuenta un poco sobre ti y tu enfoque clínico..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase mb-1">Usuario de Instagram (sin @)</label>
                  <input type="text" value={especialistaInfo.instagram} onChange={e => setEspecialistaInfo({...especialistaInfo, instagram: e.target.value})} className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500" placeholder="lr_fisderm" />
                </div>
              </div>
            </div>
          )}

          {/* Formulario de Ubicación (Condicional) */}
          {landingUbicacion && (
            <div className="mt-6 p-6 bg-primary-50 rounded-2xl border border-primary-100 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-primary-900">Editar "Ubicación y Contacto"</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase mb-1">Dirección Corta</label>
                  <input type="text" value={ubicacionInfo.direccion} onChange={e => setUbicacionInfo({...ubicacionInfo, direccion: e.target.value})} className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: Toluca de Lerdo, Estado de México" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase mb-1">Horario de Atención</label>
                  <input type="text" value={ubicacionInfo.horario} onChange={e => setUbicacionInfo({...ubicacionInfo, horario: e.target.value})} className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: Lunes a Viernes 9am - 6pm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase mb-1">Google Maps Embed URL</label>
                  <input type="text" value={ubicacionInfo.googleMapsUrl} onChange={e => setUbicacionInfo({...ubicacionInfo, googleMapsUrl: e.target.value})} className="w-full p-3 rounded-xl border border-primary-100 outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://www.google.com/maps/embed?pb=..." />
                  <p className="text-[10px] text-primary-400 mt-1 italic">Para obtenerlo: Google Maps > Compartir > Incorporar un mapa > Copia solo el contenido de <b>src="..."</b></p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-2xl transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-primary-50 p-8 rounded-3xl border border-primary-100">
        <h2 className="text-lg font-bold text-primary-900 mb-4">Vista Previa</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-primary-200 rounded-full"></div>
            )}
            <span className="font-serif font-bold text-primary-800">LR Fisioderm</span>
          </div>
          <button className="px-4 py-2 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: primaryColor || '#b87c6f' }}>
            Botón de Ejemplo
          </button>
        </div>
      </div>
    </div>
  );
}
