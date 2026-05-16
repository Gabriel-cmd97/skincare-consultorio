'use server';

export async function verifyAdminPassword(password: string) {
  // Retardo intencional de 1 segundo para mitigar ataques de fuerza bruta
  await new Promise(resolve => setTimeout(resolve, 1000));

  // En producción, es ideal usar una variable de entorno
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin1234';
  
  if (password === correctPassword) {
    return { success: true };
  }
  return { success: false };
}
