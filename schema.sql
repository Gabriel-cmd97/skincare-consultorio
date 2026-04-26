-- Habilitar la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla para el catálogo de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  imagen_url TEXT,
  categoria TEXT,
  stripe_link TEXT, -- Link de pago de Stripe
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para agendar citas
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_nombre TEXT NOT NULL,
  paciente_email TEXT NOT NULL,
  paciente_telefono TEXT,
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_tratamiento TEXT,
  estado TEXT DEFAULT 'pendiente', -- pendiente, confirmada, cancelada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT cita_unica UNIQUE (fecha_hora) -- Evita que dos citas tengan exactamente la misma fecha y hora
);

-- ==========================================
-- CONTEXTO: GESTIÓN CLÍNICA (CORE DOMAIN)
-- ==========================================

-- Tabla de Pacientes (Entity Root)
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  telefono TEXT,
  email TEXT,
  alergias JSONB DEFAULT '[]'::jsonb, -- Almacena array de strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Evaluaciones Dermatofuncionales (Aggregate Root)
CREATE TABLE IF NOT EXISTS evaluaciones_clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Estado Piel (Value Object mapeado a columnas)
  piel_hidratacion TEXT CHECK (piel_hidratacion IN ('baja', 'media', 'alta')),
  piel_elasticidad TEXT CHECK (piel_elasticidad IN ('baja', 'media', 'alta')),
  piel_fototipo TEXT CHECK (piel_fototipo IN ('I', 'II', 'III', 'IV', 'V', 'VI')),
  piel_sensibilidad BOOLEAN DEFAULT false,
  -- Detalles
  objetivo_principal TEXT CHECK (objetivo_principal IN ('Estético', 'Funcional', 'Mixto')),
  hallazgos JSONB DEFAULT '[]'::jsonb, -- Array de HallazgoClinico
  fotos_url JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad (RLS - Row Level Security)
-- Permitir que cualquiera pueda leer los productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Productos visibles para todos" ON productos FOR SELECT USING (true);

-- Permitir que cualquiera pueda insertar citas (sin necesidad de estar autenticado)
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede agendar citas" ON citas FOR INSERT WITH CHECK (true);
-- Opcional: Solo lectura para citas si es necesario (generalmente no queremos que cualquiera vea todas las citas)
-- CREATE POLICY "Lectura de citas restringida" ON citas FOR SELECT USING (true); -- Descomentar bajo tu propio riesgo
