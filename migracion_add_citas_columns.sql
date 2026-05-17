-- Migración: Añadir columnas faltantes a la tabla de citas
-- Ejecuta este script en el SQL Editor de Supabase

ALTER TABLE citas 
  ADD COLUMN IF NOT EXISTS es_primera_vez BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notas_adicionales TEXT;
