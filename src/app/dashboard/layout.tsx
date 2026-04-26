import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar / Navegación del Consultorio */}
      <aside className="w-64 bg-stone-900 text-stone-100 flex flex-col shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-amber-200 tracking-tight">Consultorio</h2>
          <p className="text-stone-400 text-sm mt-1">Dermatofuncional</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg bg-stone-800 text-amber-100 font-medium hover:bg-stone-700 transition">
            Panel Principal
          </Link>
          <Link href="/dashboard/pacientes" className="block px-4 py-3 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-amber-100 transition">
            Pacientes
          </Link>
          <Link href="/dashboard/agenda" className="block px-4 py-3 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-amber-100 transition">
            Agenda
          </Link>
        </nav>
        <div className="p-4 border-t border-stone-800 text-sm text-stone-500">
          Lumina Skincare System
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
