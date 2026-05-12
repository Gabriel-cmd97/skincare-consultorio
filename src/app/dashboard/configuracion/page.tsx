'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { 
  Palette, 
  Image as ImageIcon, 
  Save, 
  RefreshCw, 
  ExternalLink,
  Settings
} from 'lucide-react';

interface ConfigItem {
  clave: string;
  valor: string;
}

export default function ConfigPage() {
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
          if (item.clave === 'logo_url') setLogoUrl(item.valor || '');
          if (item.clave === 'primary_color') setPrimaryColor(item.valor || '');
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
      { clave: 'logo_url', valor: logoUrl },
      { clave: 'primary_color', valor: primaryColor },
    ];

    try {
      for (const config of configs) {
        const { error } = await supabase
          .from('configuracion')
          .upsert({ clave: config.clave, valor: config.valor }, { onConflict: 'clave' });
        if (error) throw error;
      }
      setMessage({ type: 'success', text: 'Configuración de marca actualizada.' });
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-primary-50">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-900">Configuración de Marca</h1>
          <p className="text-primary-600">Personaliza la identidad visual de tu plataforma.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-200 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-2xl border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Logo Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-primary-50 space-y-6">
          <div className="flex items-center gap-3 text-primary-800">
            <ImageIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">Logotipo</h2>
          </div>
          
          <div className="space-y-4">
            <div className="h-32 bg-primary-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary-200 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Preview" className="max-h-24 object-contain" />
              ) : (
                <span className="text-primary-300 text-sm">Sin logo configurado</span>
              )}
            </div>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
              className="w-full p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition"
            />
          </div>
        </section>

        {/* Colors Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-primary-50 space-y-6">
          <div className="flex items-center gap-3 text-primary-800">
            <Palette className="w-6 h-6" />
            <h2 className="text-xl font-bold">Colores</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">Color Principal (Hexadecimal)</label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-500 outline-none transition uppercase"
                />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Landing Link Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 rounded-3xl text-white shadow-xl shadow-primary-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">Editor de Contenido</h2>
            <p className="text-primary-100 opacity-90">Edita los textos, servicios y testimonios de tu página principal.</p>
          </div>
          <Link 
            href="/dashboard/landing"
            className="bg-white text-primary-700 px-8 py-3 rounded-2xl font-bold hover:bg-primary-50 transition-colors flex items-center gap-2"
          >
            Ir al Editor de Landing <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Info de soporte (solo visible para quienes sepan que existe /admin) */}
      <div className="text-center pt-8">
        <p className="text-primary-300 text-xs flex items-center justify-center gap-1">
          <Settings className="w-3 h-3" />
          Configuración técnica gestionada por Soporte LR Fisioderm.
        </p>
      </div>

    </div>
  );
}
