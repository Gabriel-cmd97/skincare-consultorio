"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { crearNotificacionHibrida } from "@/actions/notificaciones";

export default function CitasForm() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tratamiento, setTratamiento] = useState("Limpieza Facial");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString();

      // Omitimos la verificación manual de duplicados para evitar errores de permisos (RLS).
      // La base de datos se encargará de esto mediante el UNIQUE constraint definido en schema.sql.

      // Insertar la cita
      const { error: insertError } = await supabase.from("citas").insert([
        {
          paciente_nombre: nombre,
          paciente_email: '', // Campo ahora opcional internamente
          paciente_telefono: telefono,
          fecha_hora: fechaHora,
          tipo_tratamiento: tratamiento,
        },
      ]);

      if (insertError) {
        // En caso de condición de carrera, el UNIQUE constraint de la BD saltará
        if (insertError.code === '23505') {
          setMessage({
            type: "error",
            text: "Alguien más acaba de agendar en este horario. Por favor elige otro.",
          });
        } else {
          throw insertError;
        }
      } else {
        setMessage({
          type: "success",
          text: "¡Tu cita ha sido agendada con éxito! Te contactaremos pronto.",
        });

        // Enviar notificación al especialista
        await crearNotificacionHibrida({
          titulo: 'Nueva Cita Agendada',
          mensaje: `El paciente ${nombre} ha agendado una cita para ${tratamiento} el día ${fecha} a las ${hora}.`,
          tipo: 'cita',
          enlace: '/dashboard/agenda'
        });

        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
        setTratamiento("Limpieza Facial");
      }
    } catch (error: any) {
      console.error(error);
      setMessage({
        type: "error",
        text: "Hubo un error al agendar la cita. Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener la fecha de hoy para el mínimo del input
  const hoy = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-primary-100 max-w-lg mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-primary-900 text-center">Agenda tu visita</h3>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder="Ej. María Pérez"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
          <input
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder="Ej. 52 722 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento de interés</label>
          <select
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
          >
            <option value="Limpieza Facial">Limpieza Facial Profunda</option>
            <option value="Peeling">Peeling Químico</option>
            <option value="Tratamiento Acné">Tratamiento para Acné</option>
            <option value="Valoracion">Valoración General</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              required
              min={hoy}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
            <input
              type="time"
              required
              min="09:00"
              max="18:00"
              step="1800"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">L a V, 9am - 6pm</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? "Agendando..." : "Confirmar Cita"}
        </button>
      </div>
    </form>
  );
}
