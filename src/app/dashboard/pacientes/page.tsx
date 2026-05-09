'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { Plus, Search, Edit3, Eye, X, Loader2, Save, User } from 'lucide-react';

interface Paciente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  alergias: string[];
  created_at: string;
}

const PACIENTES_FICTICIOS: Paciente[] = [
  { id: 'p1', nombre: 'Ana', apellidos: 'García Ruiz', email: 'ana.garcia@email.com', telefono: '722-555-0101', fecha_nacimiento: '1995-05-15', alergias: ['Polen'], created_at: '2026-03-10T10:00:00Z' },
  { id: 'p2', nombre: 'Carlos', apellidos: 'Martínez López', email: 'carlos.mtz@email.com', telefono: '722-555-0202', fecha_nacimiento: '1988-10-20', alergias: [], created_at: '2026-03-15T10:00:00Z' },
];

const TRATAMIENTOS: Record<string, string> = {
  p1: 'Anti-manchas',
  p2: 'Control Acné',
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState<Paciente | null>(null);
  
  // Estados para el Modal de Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editando, setEditando] = useState<Partial<Paciente> | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetchPacientes();
  }, []);

  async function fetchPacientes() {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw error;
      setPacientes(data && data.length > 0 ? data : PACIENTES_FICTICIOS);
    } catch {
      setPacientes(PACIENTES_FICTICIOS);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (paciente?: Paciente) => {
    if (paciente) {
      setEditando(paciente);
    } else {
      setEditando({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        alergias: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando?.nombre || !editando?.apellidos) return;

    setGuardando(true);
    try {
      const payload = {
        ...editando,
        // Aseguramos que alergias sea un array si viene como string
        alergias: Array.isArray(editando.alergias) 
          ? editando.alergias 
          : (editando.alergias as any).split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      const { error } = await supabase
        .from('pacientes')
        .upsert(payload);

      if (error) throw error;
      
      await fetchPacientes();
      setIsModalOpen(false);
      setEditando(null);
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error al guardar los datos del paciente.');
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const avatarColor = (id: string) => {
    const colors = ['bg-primary-100 text-primary-600', 'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600'];
    const idx = id.length % colors.length;
    return colors[idx];
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary-900">Pacientes</h1>
          <p className="text-primary-500 mt-1">{filtrados.length} registros encontrados</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Paciente
        </button>
      </header>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-5 h-5 text-primary-300 absolute left-5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-primary-100 text-primary-900 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm transition"
        />
      </div>

      <div className={`grid gap-6 transition-all ${seleccionado ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        <div className={`transition-all ${seleccionado ? 'lg:col-span-2' : ''}`}>
          {/* Vista Desktop (Tabla) */}
        <div className="hidden sm:block bg-white rounded-[32px] border border-primary-50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100">
                  <th className="px-8 py-5 text-xs font-bold text-primary-400 uppercase tracking-widest">Paciente</th>
                  <th className="px-8 py-5 text-xs font-bold text-primary-400 uppercase tracking-widest hidden sm:table-cell">Tratamiento</th>
                  <th className="px-8 py-5 text-xs font-bold text-primary-400 uppercase tracking-widest hidden md:table-cell">Contacto</th>
                  <th className="px-8 py-5 text-xs font-bold text-primary-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                        <p className="text-primary-300 italic text-sm">Cargando pacientes...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length > 0 ? (
                  filtrados.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSeleccionado(p.id === seleccionado?.id ? null : p)}
                      className={`hover:bg-primary-50/30 transition-colors cursor-pointer group ${seleccionado?.id === p.id ? 'bg-primary-50' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(p.id)}`}>
                            {p.nombre[0]}{p.apellidos[0]}
                          </div>
                          <div>
                            <p className="font-bold text-primary-900">{p.nombre} {p.apellidos}</p>
                            <p className="text-xs text-primary-400 mt-0.5 sm:hidden">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 hidden sm:table-cell">
                        <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold">
                          {TRATAMIENTOS[p.id] || 'General'}
                        </span>
                      </td>
                      <td className="px-8 py-5 hidden md:table-cell">
                        <p className="text-sm text-primary-700">{p.email}</p>
                        <p className="text-xs text-primary-400 mt-0.5">{p.telefono}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSeleccionado(p); }}
                            className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-100 rounded-xl transition"
                            title="Ver detalles rápidos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(p); }}
                            className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-100 rounded-xl transition"
                            title="Editar datos"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <p className="text-primary-300 italic">No se encontraron pacientes.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vista Móvil (Tarjetas) */}
        <div className="sm:hidden space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-primary-50">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-primary-400 italic">Cargando pacientes...</p>
            </div>
          ) : filtrados.length > 0 ? (
            filtrados.map((p) => (
              <div 
                key={p.id} 
                className="bg-white rounded-[28px] p-5 border border-primary-50 shadow-sm active:scale-[0.98] transition-transform"
                onClick={() => setSeleccionado(p)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${avatarColor(p.id)}`}>
                    {p.nombre[0]}{p.apellidos[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary-900 truncate">{p.nombre} {p.apellidos}</h3>
                    <p className="text-xs text-primary-400 truncate">{p.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">
                    {TRATAMIENTOS[p.id] || 'Gral'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/dashboard/pacientes/${p.id}`}
                    className="flex-1 bg-primary-900 text-white text-center py-3 rounded-xl text-xs font-bold"
                  >
                    Ver Expediente
                  </Link>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(p); }}
                    className="w-12 bg-primary-50 text-primary-600 flex items-center justify-center rounded-xl"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-primary-50">
              <p className="text-primary-300 italic">No se encontraron pacientes.</p>
            </div>
          )}
        </div>
      </div>

        {/* Panel de detalle rápido */}
        {seleccionado && (
          <div className="bg-white rounded-[32px] border border-primary-50 shadow-sm p-6 space-y-6 h-fit sticky top-8">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-serif font-bold text-primary-900">Vista Rápida</h2>
              <button onClick={() => setSeleccionado(null)} className="text-primary-300 hover:text-primary-500 p-1 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${avatarColor(seleccionado.id)}`}>
                {seleccionado.nombre[0]}{seleccionado.apellidos[0]}
              </div>
              <div>
                <p className="font-bold text-primary-900 text-lg">{seleccionado.nombre} {seleccionado.apellidos}</p>
                <p className="text-xs text-primary-400 mt-1">ID: {seleccionado.id.slice(0,8)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Email', value: seleccionado.email },
                { label: 'Teléfono', value: seleccionado.telefono || '—' },
                { label: 'Fecha Nacimiento', value: seleccionado.fecha_nacimiento || '—' },
                { label: 'Alergias', value: seleccionado.alergias?.join(', ') || 'Ninguna' },
              ].map((item) => (
                <div key={item.label} className="bg-primary-50 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium text-primary-900 mt-1 break-all">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/dashboard/pacientes/${seleccionado.id}`}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-2xl transition shadow-md text-center block"
              >
                Expediente Clínico →
              </Link>
              <button
                onClick={() => handleOpenModal(seleccionado)}
                className="w-full bg-white border border-primary-200 text-primary-600 font-bold py-3 rounded-2xl hover:bg-primary-50 transition"
              >
                Editar Datos Básicos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición/Creación */}
      {isModalOpen && editando && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[32px] w-full max-w-xl relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-primary-50 flex justify-between items-center bg-primary-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary-900">
                    {editando.id ? 'Editar Paciente' : 'Nuevo Paciente'}
                  </h2>
                  <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mt-0.5">Información Básica</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-primary-300 hover:text-primary-900 p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-500 uppercase tracking-wider ml-1">Nombre</label>
                  <input
                    required
                    value={editando.nombre || ''}
                    onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none transition"
                    placeholder="Ej: Ana"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-500 uppercase tracking-wider ml-1">Apellidos</label>
                  <input
                    required
                    value={editando.apellidos || ''}
                    onChange={(e) => setEditando({ ...editando, apellidos: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none transition"
                    placeholder="Ej: García Ruiz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-500 uppercase tracking-wider ml-1">Email</label>
                  <input
                    type="email"
                    value={editando.email || ''}
                    onChange={(e) => setEditando({ ...editando, email: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none transition"
                    placeholder="paciente@email.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-500 uppercase tracking-wider ml-1">Teléfono</label>
                  <input
                    type="tel"
                    value={editando.telefono || ''}
                    onChange={(e) => setEditando({ ...editando, telefono: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none transition"
                    placeholder="722-000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-500 uppercase tracking-wider ml-1">Fecha Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={editando.fecha_nacimiento || ''}
                    onChange={(e) => setEditando({ ...editando, fecha_nacimiento: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-500 uppercase tracking-wider ml-1">Alergias (sep. por comas)</label>
                  <input
                    value={Array.isArray(editando.alergias) ? editando.alergias.join(', ') : editando.alergias || ''}
                    onChange={(e) => setEditando({ ...editando, alergias: e.target.value as any })}
                    className="w-full px-4 py-3 bg-primary-50 rounded-xl border border-primary-100 focus:ring-2 focus:ring-primary-400 outline-none transition"
                    placeholder="Ej: Polen, Aspirina"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl border border-primary-100 text-primary-400 font-bold hover:bg-primary-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-[2] py-4 px-6 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Paciente
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
