'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function ConfigPage() {
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [callmebotApiKey, setCallmebotApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const { data, error } = await supabase.from('configuracion').select('*');
      if (error) throw error;
      
      data.forEach((item) => {
        if (item.clave === 'logo_url') setLogoUrl(item.valor);
        if (item.clave === 'primary_color') setPrimaryColor(item.valor);
        if (item.clave === 'whatsapp') setWhatsapp(item.valor);
        if (item.clave === 'callmebot_api_key') setCallmebotApiKey(item.valor);
      });
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
              className="flex-1 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition"
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
              className="flex-1 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition"
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
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#b87c6f"
              className="w-32 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition uppercase"
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
              className="flex-1 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition"
            />
          </div>
          <div className="text-xs text-primary-600 space-y-2 bg-primary-50 p-5 rounded-2xl border border-primary-100">
            <p className="font-bold text-primary-900">¿Cómo obtener tu clave gratuita para recibir notificaciones por WhatsApp?</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Añade el número <b className="text-primary-800">+34 699 14 00 48</b> a los contactos de tu celular.</li>
              <li>Envíale un mensaje por WhatsApp a ese número que diga exactamente: <code className="bg-white px-1 py-0.5 rounded text-primary-900 font-bold border border-primary-100">I allow callmebot to send me messages</code></li>
              <li>El bot te responderá inmediatamente con tu <b>API Key</b> (una clave de números). Pégala aquí arriba.</li>
            </ol>
            <p className="text-primary-500 italic mt-2">Asegúrate de que tu "Número de WhatsApp (Ventas)" esté correctamente escrito con el código de país (ej. 52 para México).</p>
          </div>
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
