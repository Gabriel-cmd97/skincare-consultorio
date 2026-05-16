'use server';

export async function verifyAdminPassword(password: string) {
  // En producción, es ideal usar una variable de entorno como process.env.ADMIN_PASSWORD
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin1234';
  
  if (password === correctPassword) {
    return { success: true };
  }
  return { success: false };
}
