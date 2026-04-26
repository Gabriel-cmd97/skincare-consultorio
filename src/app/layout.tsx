import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skincare Consultorio & Catálogo",
  description: "Consultorio dermatológico y tienda de productos de skincare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="bg-primary-500 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-semibold tracking-tight">Lumina Skincare</h1>
            <nav className="space-x-6">
              <a href="#catalogo" className="hover:text-primary-100 transition-colors">Catálogo</a>
              <a href="#citas" className="hover:text-primary-100 transition-colors">Agendar Cita</a>
            </nav>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-primary-900 text-primary-100 py-12 text-center mt-auto">
          <div className="container mx-auto px-4">
            <p className="mb-4">&copy; {new Date().getFullYear()} Lumina Skincare. Todos los derechos reservados.</p>
            <div className="pt-4 border-t border-primary-800 inline-block px-8">
              <a href="/dashboard" className="text-primary-400 hover:text-amber-200 text-sm transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Acceso para Especialistas
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
