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
        <footer className="bg-primary-900 text-primary-100 py-8 text-center mt-12">
          <p>&copy; {new Date().getFullYear()} Lumina Skincare. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
