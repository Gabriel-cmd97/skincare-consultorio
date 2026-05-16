-- Migración: Ampliar opciones de objetivo_principal y quitar restricción NOT NULL de email
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Quitar el CHECK de objetivo_principal para aceptar cualquier texto
ALTER TABLE evaluaciones_clinicas 
  DROP CONSTRAINT IF EXISTS evaluaciones_clinicas_objetivo_principal_check;

-- 2. Quitar el NOT NULL de paciente_email en citas (ya no capturamos email)
ALTER TABLE citas 
  ALTER COLUMN paciente_email DROP NOT NULL;

-- 3. (Opcional) Quitar el constraint en piel_fototipo para mayor flexibilidad
-- ALTER TABLE evaluaciones_clinicas DROP CONSTRAINT IF EXISTS evaluaciones_clinicas_piel_fototipo_check;
