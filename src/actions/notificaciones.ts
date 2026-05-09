'use server';

import { supabase } from '@/utils/supabase';

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
}) {
  try {
    // 1. Guardar en la base de datos (Panel Web)
    const { error: dbError } = await supabase
      .from('notificaciones')
      .insert([
        { titulo, mensaje, tipo, enlace }
      ]);

    if (dbError) {
      console.error('Error insertando notificación en DB:', dbError);
    }

    // 2. Obtener configuración para WhatsApp (CallMeBot)
    const { data: configData, error: configError } = await supabase
      .from('configuracion')
      .select('*')
      .in('clave', ['whatsapp', 'callmebot_api_key']);

    if (configError) {
      console.error('Error obteniendo configuración:', configError);
      return { success: true, dbOnly: true }; // Se guardó en BD pero falló config WhatsApp
    }

    let telefono = '';
    let apiKey = '';

    configData.forEach(item => {
      if (item.clave === 'whatsapp') telefono = item.valor;
      if (item.clave === 'callmebot_api_key') apiKey = item.valor;
    });

    // 3. Enviar mensaje por WhatsApp si están configurados los datos
    if (telefono && apiKey) {
      // CallMeBot requiere el teléfono con el signo + al principio, y luego el código de país.
      // El usuario guarda "527221234567" (ejemplo), entonces añadimos el "+"
      const telefonoFormateado = telefono.startsWith('+') ? telefono : `+${telefono}`;
      
      const textoMensaje = `*${titulo}*\n${mensaje}`;
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(telefonoFormateado)}&text=${encodeURIComponent(textoMensaje)}&apikey=${apiKey}`;

      try {
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
           console.error('CallMeBot respondió con error:', response.status);
        }
      } catch (fetchError) {
        console.error('Error llamando a CallMeBot:', fetchError);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error fatal en crearNotificacionHibrida:', err);
    return { success: false, error: err };
  }
}
