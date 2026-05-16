"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { crearNotificacionHibrida } from "@/actions/notificaciones";
import {
  sanitizeText,
  isValidPhone,
  isValidFutureDate,
  isValidBusinessHour,
  checkRateLimit,
  wasFilledTooFast,
} from "@/utils/security";

export default function CitasForm() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tratamiento, setTratamiento] = useState("Limpieza Facial");
  const [esPrimeraVez, setEsPrimeraVez] = useState("si");
  const [notasAdicionales, setNotasAdicionales] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- Protecciones anti-bot ---
  const [honeypot, setHoneypot] = useState(""); // Campo trampa invisible
  const formLoadTime = useRef(Date.now());      // Tiempo de carga del form

  // Reiniciar timer cuando el componente se monta
  useEffect(() => {
    formLoadTime.current = Date.now();
  }, []);

  // Consultar horas ocupadas cuando el paciente elige una fecha
  useEffect(() => {
    async function fetchHorasOcupadas() {
      if (!fecha) {
        setHorasOcupadas([]);
        return;
      }
      try {
        // Rango del día seleccionado
        const start = new Date(`${fecha}T00:00:00`).toISOString();
        const end = new Date(`${fecha}T23:59:59`).toISOString();
        
        const { data } = await supabase
          .from('citas')
          .select('fecha_hora')
          .gte('fecha_hora', start)
          .lte('fecha_hora', end)
          .neq('estado', 'cancelada'); // Las canceladas vuelven a estar libres
          
        if (data) {
          const ocupadas = data.map((cita) => {
            const d = new Date(cita.fecha_hora);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          });
          setHorasOcupadas(ocupadas);
        }
      } catch (error) {
        console.error("Error al obtener disponibilidad:", error);
      }
    }
    fetchHorasOcupadas();
  }, [fecha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // ====== CAPA 1: Anti-Bot ======
    // Si el honeypot tiene contenido, es un bot (los humanos no ven el campo)
    if (honeypot) {
      // Fingir éxito para no alertar al bot
      setMessage({ type: "success", text: "¡Tu cita ha sido agendada con éxito! Te contactaremos pronto." });
      setLoading(false);
      return;
    }

    // Si el form se llenó en menos de 3 segundos, es un bot
    if (wasFilledTooFast(formLoadTime.current)) {
      setMessage({ type: "success", text: "¡Tu cita ha sido agendada con éxito! Te contactaremos pronto." });
      setLoading(false);
      return;
    }

    // ====== CAPA 2: Rate Limiting ======
    // Máximo 5 citas por hora desde este navegador
    const rateCheck = checkRateLimit('citas_form', 5, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      setMessage({
        type: "error",
        text: "Has alcanzado el límite de solicitudes. Intenta de nuevo más tarde o contáctanos por WhatsApp.",
      });
      setLoading(false);
      return;
    }

    // ====== CAPA 3: Validación y sanitización ======
    const cleanNombre = sanitizeText(nombre, 100);
    const cleanTelefono = sanitizeText(telefono, 20);

    if (cleanNombre.length < 3) {
      setMessage({ type: "error", text: "Ingresa un nombre válido (mínimo 3 caracteres)." });
      setLoading(false);
      return;
    }

    if (!isValidPhone(cleanTelefono)) {
      setMessage({ type: "error", text: "Ingresa un teléfono válido (10-15 dígitos). Ej: 722 123 4567" });
      setLoading(false);
      return;
    }

    if (!isValidFutureDate(fecha)) {
      setMessage({ type: "error", text: "La fecha debe ser futura y no mayor a 6 meses." });
      setLoading(false);
      return;
    }

    const selectedDate = new Date(`${fecha}T12:00:00`);
    if (selectedDate.getDay() === 0) {
      setMessage({ type: "error", text: "El consultorio no abre los domingos. Por favor elige de Lunes a Sábado." });
      setLoading(false);
      return;
    }

    if (!isValidBusinessHour(hora)) {
      setMessage({ type: "error", text: "El horario de atención es de 8:00 AM a 6:20 PM." });
      setLoading(false);
      return;
    }

    try {
      const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString();

      // Insertar la cita con datos sanitizados
      const { error: insertError } = await supabase.from("citas").insert([
          {
            paciente_nombre: cleanNombre,
            paciente_email: '',
            paciente_telefono: cleanTelefono,
            fecha_hora: fechaHora,
            tipo_tratamiento: sanitizeText(tratamiento, 50),
            es_primera_vez: esPrimeraVez === "si",
            notas_adicionales: sanitizeText(notasAdicionales, 500) || null,
          },
      ]);

      if (insertError) {
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
          mensaje: `El paciente ${cleanNombre} ha agendado una cita para ${tratamiento} el día ${fecha} a las ${hora}.`,
          tipo: 'cita',
          enlace: '/dashboard/agenda'
        });

        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
        setTratamiento("Limpieza Facial");
        setEsPrimeraVez("si");
        setNotasAdicionales("");
        formLoadTime.current = Date.now(); // Reiniciar timer
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
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-primary-100 max-w-lg mx-auto">
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* 🍯 Honeypot: campo invisible que solo los bots llenan */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" tabIndex={-1}>
        <label htmlFor="website_url">Website</label>
        <input
          id="website_url"
          type="text"
          name="website"
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            required
            maxLength={100}
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
            maxLength={20}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">¿Es tu primera vez en consulta?</label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="primeraVez"
                value="si"
                checked={esPrimeraVez === "si"}
                onChange={(e) => setEsPrimeraVez(e.target.value)}
                className="text-primary-600 focus:ring-primary-500 w-4 h-4"
              />
              <span className="text-gray-700 text-sm">Sí</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="primeraVez"
                value="no"
                checked={esPrimeraVez === "no"}
                onChange={(e) => setEsPrimeraVez(e.target.value)}
                className="text-primary-600 focus:ring-primary-500 w-4 h-4"
              />
              <span className="text-gray-700 text-sm">No, ya he asistido</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ¿Padeces alguna enfermedad crónica, alergia o tomas medicamentos? <span className="text-gray-400 font-normal">(Opcional)</span>
          </label>
          <textarea
            maxLength={500}
            rows={2}
            value={notasAdicionales}
            onChange={(e) => setNotasAdicionales(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
            placeholder="Ej. Soy diabética, o soy alérgica a la aspirina..."
          />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora (Sesiones de 2:20 hrs)</label>
            <select
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
            >
              <option value="">Selecciona un horario</option>
              <option value="08:00" disabled={horasOcupadas.includes("08:00")}>08:00 AM {horasOcupadas.includes("08:00") && "(Ocupado)"}</option>
              <option value="12:00" disabled={horasOcupadas.includes("12:00")}>12:00 PM {horasOcupadas.includes("12:00") && "(Ocupado)"}</option>
              <option value="16:00" disabled={horasOcupadas.includes("16:00")}>04:00 PM {horasOcupadas.includes("16:00") && "(Ocupado)"}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">L a S, 8:00 AM - 6:20 PM</p>
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
