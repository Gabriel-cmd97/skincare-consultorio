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

export async function listSpecialists(adminEmail: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.error('Error al listar usuarios:', error);
      return { success: false, error: 'No se pudo obtener la lista de especialistas.' };
    }
    // Filtrar al administrador y asegurar que tengan email
    const specialists = (data?.users || []).filter(user => user.email && user.email !== adminEmail);
    return { success: true, specialists };
  } catch (error) {
    console.error('Excepción al listar usuarios:', error);
    return { success: false, error: 'Ha ocurrido un error inesperado.' };
  }
}

export async function updateSpecialistPassword(userId: string, newPassword: string) {
  try {
    if (!userId || !newPassword || newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) {
      console.error('Error al cambiar contraseña:', error);
      return { success: false, error: error.message || 'No se pudo actualizar la contraseña.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Excepción al cambiar contraseña:', error);
    return { success: false, error: 'Ha ocurrido un error inesperado.' };
  }
}

export async function deleteSpecialist(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'ID de usuario no proporcionado.' };
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Error al eliminar usuario:', error);
      return { success: false, error: error.message || 'No se pudo eliminar al especialista.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Excepción al eliminar usuario:', error);
    return { success: false, error: 'Ha ocurrido un error inesperado.' };
  }
}

export async function toggleSpecialistAccess(userId: string, isCurrentlyBanned: boolean) {
  try {
    if (!userId) {
      return { success: false, error: 'ID de usuario no proporcionado.' };
    }
    // Si ya está baneado, la ban_duration se establece a 'none' para desbloquearlo.
    // Si no está baneado, se le bloquea de forma indefinida ('infinite').
    const newBanDuration = isCurrentlyBanned ? 'none' : 'infinite';
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: newBanDuration
    });
    
    if (error) {
      console.error('Error al cambiar estado de suspensión:', error);
      return { success: false, error: error.message || 'No se pudo modificar el estado de acceso.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Excepción al suspender/reactivar especialista:', error);
    return { success: false, error: 'Ha ocurrido un error inesperado.' };
  }
}


