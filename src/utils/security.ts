/**
 * Utilidades de seguridad para proteger formularios públicos
 * contra bots, spam y entradas maliciosas.
 */

/**
 * Sanitiza texto removiendo scripts, HTML peligroso y caracteres de control.
 * Preserva acentos y caracteres en español.
 */
export function sanitizeText(input: string, maxLength = 200): string {
  return input
    .slice(0, maxLength)                         // Limitar longitud
    .replace(/<[^>]*>/g, '')                      // Quitar tags HTML
    .replace(/javascript:/gi, '')                 // Quitar JS URIs
    .replace(/on\w+\s*=/gi, '')                   // Quitar event handlers (onclick=, etc.)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Quitar chars de control
    .trim();
}

/**
 * Sanitiza una URL asegurando que es segura (https/http).
 * Bloquea javascript:, data:, y vbscript: URIs.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // Bloquear protocolos peligrosos
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return '';
  }
  
  // Solo permitir http://, https://, o rutas relativas que empiezan con /
  if (!lower.startsWith('http://') && !lower.startsWith('https://') && !lower.startsWith('/')) {
    return '';
  }
  
  return trimmed.slice(0, 2000); // Max 2000 chars para URLs
}

/**
 * Valida formato de teléfono mexicano (10-15 dígitos, puede incluir código de país).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-\(\)\+]/g, '');
  return /^\d{10,15}$/.test(digits);
}

/**
 * Valida que una fecha sea futura y dentro de un rango razonable (no más de 6 meses).
 */
export function isValidFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  
  return date >= now && date <= maxDate;
}

/**
 * Valida que la hora esté dentro del horario de atención.
 */
export function isValidBusinessHour(timeStr: string): boolean {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  // 9:00 AM = 540 min, 6:00 PM = 1080 min
  return totalMinutes >= 540 && totalMinutes <= 1080;
}

/**
 * Rate limiter simple basado en localStorage.
 * Limita acciones por clave + ventana de tiempo.
 */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; remaining: number } {
  const storageKey = `rl_${key}`;
  const now = Date.now();
  
  let attempts: number[] = [];
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) attempts = JSON.parse(stored);
  } catch {}
  
  // Filtrar intentos fuera de la ventana de tiempo
  attempts = attempts.filter(t => now - t < windowMs);
  
  if (attempts.length >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }
  
  attempts.push(now);
  localStorage.setItem(storageKey, JSON.stringify(attempts));
  
  return { allowed: true, remaining: maxAttempts - attempts.length };
}

/**
 * Verifica que el formulario no fue llenado demasiado rápido (bot detection).
 * Un humano tarda al menos 3 segundos en llenar un form.
 */
export function wasFilledTooFast(startTime: number, minMs = 3000): boolean {
  return Date.now() - startTime < minMs;
}
