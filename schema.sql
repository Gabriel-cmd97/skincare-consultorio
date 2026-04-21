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

-- Políticas de seguridad (RLS - Row Level Security)
-- Permitir que cualquiera pueda leer los productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Productos visibles para todos" ON productos FOR SELECT USING (true);

-- Permitir que cualquiera pueda insertar citas (sin necesidad de estar autenticado)
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede agendar citas" ON citas FOR INSERT WITH CHECK (true);
-- Opcional: Solo lectura para citas si es necesario (generalmente no queremos que cualquiera vea todas las citas)
-- CREATE POLICY "Lectura de citas restringida" ON citas FOR SELECT USING (true); -- Descomentar bajo tu propio riesgo
