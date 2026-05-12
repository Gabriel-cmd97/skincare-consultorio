'use server';

import { supabase } from '@/utils/supabase';

interface NotificacionResult {
  success: boolean;
  dbSaved: boolean;
  whatsappSent: boolean;
  logs: string[];
  error?: string;
}

export async function crearNotificacionHibrida({
  titulo,
  mensaje,
  tipo = 'sistema',
  enlace = ''
}: {
  titulo: string;
  mensaje: string;
  tipo?: 'cita' | 'pedido' | 'sistema' | 'paciente';
  enlace?: string;
}): Promise<NotificacionResult> {
  const logs: string[] = [];
  let dbSaved = false;
  let whatsappSent = false;

  try {
    // 1. Guardar en la base de datos (Panel Web)
    logs.push('📝 Insertando notificación en base de datos...');
    const { error: dbError } = await supabase
      .from('notificaciones')
      .insert([
        { titulo, mensaje, tipo, enlace }
      ]);

    if (dbError) {
      logs.push(`❌ Error DB: ${dbError.message} (código: ${dbError.code})`);
    } else {
      dbSaved = true;
      logs.push('✅ Notificación guardada en BD correctamente.');
    }

    // 2. Obtener configuración para WhatsApp (CallMeBot)
    logs.push('🔍 Buscando configuración de WhatsApp...');
    const { data: configData, error: configError } = await supabase
      .from('configuracion')
      .select('*')
      .in('clave', ['whatsapp', 'callmebot_api_key', 'site_url']);

    if (configError) {
      logs.push(`❌ Error leyendo configuración: ${configError.message}`);
      return { success: dbSaved, dbSaved, whatsappSent: false, logs };
    }

    let telefono = '';
    let apiKey = '';
    let siteUrl = '';

    configData.forEach(item => {
      if (item.clave === 'whatsapp') telefono = item.valor;
      if (item.clave === 'callmebot_api_key') apiKey = item.valor;
      if (item.clave === 'site_url') siteUrl = item.valor;
    });

    logs.push(`📱 Teléfono encontrado: ${telefono ? `"${telefono}" (${telefono.length} chars)` : '⚠️ VACÍO'}`);
    logs.push(`🔑 API Key encontrada: ${apiKey ? `"${apiKey.slice(0, 3)}***" (${apiKey.length} chars)` : '⚠️ VACÍA'}`);
    logs.push(`🌐 URL del sitio: ${siteUrl || '⚠️ No configurada'}`);

    // 3. Enviar mensaje por WhatsApp si están configurados los datos
    if (!telefono) {
      logs.push('⛔ No se envía WhatsApp: falta el número de teléfono en Configuración.');
      return { success: dbSaved, dbSaved, whatsappSent: false, logs };
    }

    if (!apiKey) {
      logs.push('⛔ No se envía WhatsApp: falta la API Key de CallMeBot en Configuración.');
      return { success: dbSaved, dbSaved, whatsappSent: false, logs };
    }

    // CallMeBot requiere el teléfono con el signo + al principio
    const telefonoLimpio = telefono.replace(/\D/g, '');
    const telefonoFormateado = `+${telefonoLimpio}`;
    
    // Construir mensaje con link si existe enlace y siteUrl
    let textoMensaje = `*${titulo}*\n${mensaje}`;
    if (enlace && siteUrl) {
      const fullUrl = siteUrl.endsWith('/') ? `${siteUrl}${enlace.startsWith('/') ? enlace.slice(1) : enlace}` : `${siteUrl}${enlace.startsWith('/') ? enlace : `/${enlace}`}`;
      textoMensaje += `\n\n🔗 *Ver en el Dashboard:*\n${fullUrl}`;
    }
    
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(telefonoFormateado)}&text=${encodeURIComponent(textoMensaje)}&apikey=${apiKey}`;

    logs.push(`📤 Enviando a CallMeBot...`);
    logs.push(`   → Teléfono: ${telefonoFormateado}`);
    logs.push(`   → URL: ${url.slice(0, 80)}...`);

    try {
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      const responseText = await response.text();
      const lowerRes = responseText.toLowerCase();
      
      logs.push(`📡 HTTP Status: ${response.status} ${response.statusText}`);
      logs.push(`📡 Respuesta: ${responseText.slice(0, 300)}`);

      // CallMeBot a veces devuelve 200 OK pero con un mensaje de error en el texto
      const isError = !response.ok || 
                      lowerRes.includes('error') || 
                      lowerRes.includes('invalid') || 
                      lowerRes.includes('not registered');

      if (!isError) {
        whatsappSent = true;
        logs.push('✅ ¡Mensaje de WhatsApp enviado correctamente!');
      } else {
        logs.push('❌ CallMeBot rechazó el mensaje. Verifica tu API Key y que el número esté registrado con el bot.');
      }
    } catch (fetchError: any) {
      logs.push(`❌ Error de conexión a CallMeBot: ${fetchError.message}`);
      logs.push('💡 Esto puede pasar si Cloudflare Pages bloquea llamadas externas o si hay un problema de red.');
    }

    return { success: dbSaved, dbSaved, whatsappSent, logs };
  } catch (err: any) {
    logs.push(`💥 Error fatal: ${err.message}`);
    return { success: false, dbSaved, whatsappSent, logs, error: err.message };
  }
}

/**
 * Función de prueba para diagnosticar la conexión con CallMeBot.
 * Envía un mensaje de test y devuelve logs detallados.
 */
export async function testWhatsAppConnection(): Promise<NotificacionResult> {
  return crearNotificacionHibrida({
    titulo: '🧪 Prueba de conexión',
    mensaje: 'Si recibes este mensaje, CallMeBot está configurado correctamente en LR Fisioderm.',
    tipo: 'sistema',
    enlace: '/dashboard/configuracion'
  });
}
