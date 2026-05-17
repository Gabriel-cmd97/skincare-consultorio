'use server';

import { createClient } from '@supabase/supabase-js';

// Instanciamos Supabase usando el Service Role Key para tener permisos de administrador
// NOTA: Esto solo debe usarse en entornos seguros (Server Actions / API Routes)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function createSpecialistProfile(email: string, password: string) {
  try {
    // Verificar si el correo no está vacío
    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son obligatorios.' };
    }

    // Usar la API de admin para crear el usuario sin enviar confirmación de correo
    // y sin iniciar sesión automáticamente
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar el correo
    });

    if (error) {
      console.error('Error al crear usuario:', error);
      // Errores comunes
      if (error.message.includes('User already registered')) {
        return { success: false, error: 'Este correo electrónico ya está registrado.' };
      }
      return { success: false, error: 'Error del servidor al crear el especialista.' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Excepción al crear usuario:', error);
    return { success: false, error: 'Ha ocurrido un error inesperado.' };
  }
}
