'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Panel Principal', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { href: '/dashboard/pacientes', label: 'Pacientes', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
  { href: '/dashboard/agenda', label: 'Agenda', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  )},
];

const CONTENT_LINKS = [
  { href: '/dashboard/landing', label: 'Página Principal', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { href: '/dashboard/catalogo', label: 'Catálogo Productos', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  )},
  { href: '/dashboard/tips', label: 'Rutinas y Tips', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
  )},
  { href: '/dashboard/configuracion', label: 'Personalización', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [moduleStore, setModuleStore] = useState(true);
  const [moduleTips, setModuleTips] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar sesión activa
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/dashboard/login');
      } else {
        setUser(data.user);
      }
      setChecking(false);
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/dashboard/login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('leida', false);
      if (count !== null) setUnreadCount(count);
    };
    fetchUnreadCount();

    const fetchConfig = async () => {
      const { data } = await supabase.from('configuracion').select('clave, valor').in('clave', ['module_store', 'module_tips']);
      if (data) {
        data.forEach(item => {
          if (item.clave === 'module_store') setModuleStore(item.valor === 'true');
          if (item.clave === 'module_tips') setModuleTips(item.valor === 'true');
        });
      }
    };
    fetchConfig();

    const channel = supabase
      .channel('layout_notificaciones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificaciones' }, payload => {
         fetchUnreadCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/dashboard/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Spinner mientras verifica auth
  if (checking) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-primary-400 text-sm font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Sidebar - Solo visible en desktop */}
      <aside className="hidden lg:flex w-64 bg-primary-900 text-primary-100 flex-col shadow-2xl flex-shrink-0 sticky top-0 h-screen">
        {/* Logo con Link a la Web Principal */}
        <div className="p-8 border-b border-primary-800">
          <Link href="/" className="flex items-center gap-3 group" title="Ir al Sitio Web">
            <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg group-hover:bg-primary-500 transition-colors">
              LR
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white leading-tight">LR Fisioderm</h2>
              <p className="text-primary-400 text-[10px] uppercase tracking-widest font-bold mt-1 group-hover:text-primary-200 transition-colors flex items-center gap-1">
                Ver Sitio Web 
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </p>
            </div>
          </Link>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive(link.href)
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-primary-500 uppercase tracking-widest border-t border-primary-800 mt-2">
            Contenido
          </div>
          
          {CONTENT_LINKS.filter(link => {
            if (link.href === '/dashboard/catalogo' && !moduleStore) return false;
            if (link.href === '/dashboard/tips' && !moduleTips) return false;
            return true;
          }).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
                isActive(link.href)
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-800 space-y-2">
          <Link
            href="/dashboard/notificaciones"
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${isActive('/dashboard/notificaciones') ? 'bg-primary-600 text-white shadow-md' : 'text-primary-300 hover:bg-primary-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Notificaciones
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {user && (
            <div className="px-4 py-3 rounded-xl bg-primary-800/50 mt-2">
              <p className="text-xs text-primary-400 font-bold uppercase tracking-wider">Sesión activa</p>
              <p className="text-sm text-primary-200 font-medium mt-1 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary-400 hover:bg-red-900/30 hover:text-red-300 transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Header Móvil - Solo visible en móvil */}
      <header className="lg:hidden bg-primary-900 text-white p-4 flex justify-between items-center sticky top-0 z-[60] shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-serif font-bold text-sm">LR</div>
          <span className="font-serif font-bold text-sm tracking-tight">LR Fisioderm</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/notificaciones" className="relative p-2 text-primary-200 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-primary-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <button onClick={handleLogout} className="text-primary-400 p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      {/* Área principal */}
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 overflow-auto min-h-screen">
        {children}
      </main>

      {/* Navegación Inferior Móvil - Solo visible en móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary-100 flex justify-around items-center py-3 px-2 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[...NAV_LINKS, CONTENT_LINKS[0]].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive(link.href) ? 'text-primary-600 scale-110' : 'text-primary-300'
            }`}
          >
            <div className={isActive(link.href) ? 'text-primary-600' : ''}>
              {link.icon}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              {link.label.split(' ')[0]}
            </span>
          </Link>
        ))}
        {/* Botón de Ajustes rápido */}
        <Link 
          href="/dashboard/configuracion"
          className={`flex flex-col items-center gap-1 ${isActive('/dashboard/configuracion') ? 'text-primary-600' : 'text-primary-300'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Config</span>
        </Link>
      </nav>
    </div>
  );
}

