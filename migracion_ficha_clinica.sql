-- ==========================================
-- MIGRACIÓN: FICHA CLÍNICA DERMATOFUNCIONAL 2.0
-- Ejecuta este script en el SQL Editor de Supabase
-- ==========================================

-- 1. Actualizar tabla CITAS
ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS es_primera_vez BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notas_adicionales TEXT;

-- 2. Actualizar tabla PACIENTES
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS edad INTEGER,
ADD COLUMN IF NOT EXISTS ocupacion TEXT,
ADD COLUMN IF NOT EXISTS antecedentes_medicos JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS antecedentes_gineco JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS antecedentes_esteticos JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS rutina_actual JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS habitos JSONB DEFAULT '{}'::jsonb;

-- 3. Actualizar tabla EVALUACIONES_CLINICAS
ALTER TABLE evaluaciones_clinicas
ADD COLUMN IF NOT EXISTS motivo_consulta TEXT,
ADD COLUMN IF NOT EXISTS que_mejorar TEXT,
ADD COLUMN IF NOT EXISTS desde_cuando TEXT,
ADD COLUMN IF NOT EXISTS tratamientos_previos TEXT,
ADD COLUMN IF NOT EXISTS produccion_sebacea TEXT CHECK (produccion_sebacea IN ('baja', 'normal', 'alta')),
ADD COLUMN IF NOT EXISTS cuidados_casa TEXT,
ADD COLUMN IF NOT EXISTS reacciones_normales TEXT,
ADD COLUMN IF NOT EXISTS rutina_manana TEXT,
ADD COLUMN IF NOT EXISTS rutina_noche TEXT,
ADD COLUMN IF NOT EXISTS dieta_incluir TEXT,
ADD COLUMN IF NOT EXISTS dieta_reducir TEXT,
ADD COLUMN IF NOT EXISTS proxima_sesion TEXT;
