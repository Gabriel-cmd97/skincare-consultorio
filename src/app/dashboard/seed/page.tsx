'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const seedData = async () => {
    setLoading(true);
    setStatus('Iniciando carga de datos...');
    
    try {
      // 1. Pacientes Ficticios
      const pacientesFicticios = [
        { nombre: 'Ana', apellidos: 'García Ruiz', email: 'ana.garcia@email.com', telefono: '555-0101', fecha_nacimiento: '1990-05-15' },
        { nombre: 'Carlos', apellidos: 'Martínez López', email: 'carlos.mtz@email.com', telefono: '555-0202', fecha_nacimiento: '1985-11-22' },
        { nombre: 'Lucía', apellidos: 'Fernández Sosa', email: 'lucia.f@email.com', telefono: '555-0303', fecha_nacimiento: '1998-02-10' },
        { nombre: 'Mariana', apellidos: 'Pérez Cano', email: 'mariana.p@email.com', telefono: '555-0404', fecha_nacimiento: '1992-08-30' },
        { nombre: 'Roberto', apellidos: 'Díaz Valdés', email: 'roberto.d@email.com', telefono: '555-0505', fecha_nacimiento: '1980-03-12' },
      ];

      setStatus('Insertando pacientes...');
      const { data: dataPacientes, error: errorPacientes } = await supabase
        .from('pacientes')
        .insert(pacientesFicticios)
        .select();

      if (errorPacientes) throw errorPacientes;

      // 2. Citas Ficticias
      const hoy = new Date();
      const citasFicticias = [
        { 
          paciente_nombre: 'Ana García Ruiz', 
          paciente_email: 'ana.garcia@email.com', 
          fecha_hora: new Date(hoy.setDate(hoy.getDate() + 1)).toISOString(),
          tipo_tratamiento: 'Limpieza Profunda',
          estado: 'confirmada'
        },
        { 
          paciente_nombre: 'Carlos Martínez López', 
          paciente_email: 'carlos.mtz@email.com', 
          fecha_hora: new Date(hoy.setDate(hoy.getDate() + 1)).toISOString(),
          tipo_tratamiento: 'Peeling Químico',
          estado: 'pendiente'
        },
        { 
          paciente_nombre: 'Lucía Fernández Sosa', 
          paciente_email: 'lucia.f@email.com', 
          fecha_hora: new Date(hoy.setDate(hoy.getDate() + 2)).toISOString(),
          tipo_tratamiento: 'Valoración Inicial',
          estado: 'confirmada'
        },
      ];

      setStatus('Insertando citas...');
      const { error: errorCitas } = await supabase.from('citas').insert(citasFicticias);
      if (errorCitas) throw errorCitas;

      // 3. Tips y Rutinas Ficticias
      const tipsFicticios = [
        { 
          titulo: 'Rutina de Hidratación Nocturna', 
          contenido: '1. Limpia tu rostro.\n2. Aplica tónico sin alcohol.\n3. Usa un sérum de ácido hialurónico.\n4. Sella con crema hidratante.',
          tipo: 'rutina'
        },
        { 
          titulo: 'El Protector Solar es Vital', 
          contenido: 'Recuerda reaplicar tu protector cada 4 horas, incluso si estás en interiores. La luz azul de las pantallas también afecta tu piel.',
          tipo: 'tip'
        }
      ];

      setStatus('Insertando tips y rutinas...');
      const { error: errorTips } = await supabase.from('tips_rutinas').insert(tipsFicticios);
      if (errorTips) throw errorTips;

      // 4. Productos Ficticios (NUEVO)
      const productosFicticios = [
        {
          nombre: 'Sérum Vitamina C 15%',
          descripcion: 'Antioxidante de alta potencia para manchas y luminosidad diaria.',
          precio: 380,
          categoria: 'Skincare',
          imagen_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'
        },
        {
          nombre: 'Hidratante de Barrera SPF 30',
          descripcion: 'Protección diaria con efecto matificante y reparación de barrera.',
          precio: 290,
          categoria: 'Cuidado Solar',
          imagen_url: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&q=80'
        },
        {
          nombre: 'Limpiador Micelar Suave',
          descripcion: 'Para pieles sensibles y con tendencia reactiva. Limpieza sin irritar.',
          precio: 195,
          categoria: 'Limpieza',
          imagen_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80'
        },
        {
          nombre: 'Tónico con Niacinamida 10%',
          descripcion: 'Controla el exceso de grasa y reduce el tamaño de los poros.',
          precio: 240,
          categoria: 'Skincare',
          imagen_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80'
        },
        {
          nombre: 'Sérum Ácido Hialurónico 2%',
          descripcion: 'Hidratación profunda multicapa para una piel rellena y suave.',
          precio: 385,
          categoria: 'Skincare',
          imagen_url: 'https://images.unsplash.com/photo-1631730450081-929043132717?w=800&q=80'
        },
        {
          nombre: 'Contorno de Ojos Cafeína',
          descripcion: 'Reduce bolsas y ojeras oscuras con efecto revitalizante inmediato.',
          precio: 320,
          categoria: 'Skincare',
          imagen_url: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?w=800&q=80'
        }
      ];

      setStatus('Insertando catálogo de productos...');
      const { error: errorProds } = await supabase.from('productos').insert(productosFicticios);
      if (errorProds) throw errorProds;

      setStatus('¡Datos cargados con éxito!');
    } catch (error: any) {
      console.error(error);
      setStatus('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20 text-center space-y-8">
      <h1 className="text-4xl font-serif font-bold text-primary-900">Generador de Datos</h1>
      <p className="text-primary-600">Presiona el botón para llenar la base de datos con pacientes, citas y tips de prueba.</p>
      
      <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-primary-100">
        <button 
          onClick={seedData}
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-6 px-10 rounded-3xl transition shadow-xl hover:shadow-2xl disabled:opacity-50 text-xl"
        >
          {loading ? 'Generando...' : 'Generar Datos Ficticios'}
        </button>
        
        {status && (
          <div className={`mt-8 p-4 rounded-2xl text-sm font-medium ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-700'}`}>
            {status}
          </div>
        )}
      </div>
      
      <div className="pt-8">
        <a href="/dashboard/pacientes" className="text-primary-400 hover:text-primary-600 font-bold underline">
          Volver al Panel
        </a>
      </div>
    </div>
  );
}
