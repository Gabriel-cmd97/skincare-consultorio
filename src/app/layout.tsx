import type { Metadata } from "next";
import "./globals.css";
import PublicHeader from "@/components/PublicHeader";
import { supabase } from "@/utils/supabase";
import Image from "next/image";

const SITE_URL = 'https://lrfisioderm.com';

export async function generateMetadata(): Promise<Metadata> {
  let primaryColor = '#D29C9F';
  let logoUrl = '/logo.png';

  try {
    const { data } = await supabase.from('configuracion').select('clave, valor').in('clave', ['primary_color', 'logo_url']);
    if (data) {
      data.forEach(item => {
        if (item.clave === 'primary_color' && item.valor) primaryColor = item.valor;
        if (item.clave === 'logo_url' && item.valor) logoUrl = item.valor;
      });
    }
  } catch (e) {}

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "LR Fisioderm | Fisioterapia Dermatofuncional en Toluca",
      template: "%s | LR Fisioderm",
    },
    description: "Especialistas en Fisioterapia Dermatofuncional en Toluca, Estado de México. Tratamientos clínicos para piel grasa, acné, manchas, rejuvenecimiento y más. Agenda tu cita hoy.",
    keywords: ["fisioterapia dermatofuncional", "especialista piel toluca", "acné toluca", "tratamiento facial toluca", "LR Fisioderm", "rejuvenecimiento facial", "limpieza facial profunda"],
    authors: [{ name: "LR Fisioderm" }],
    creator: "LR Fisioderm",
    openGraph: {
      type: "website",
      locale: "es_MX",
      url: SITE_URL,
      siteName: "LR Fisioderm",
      title: "LR Fisioderm | Fisioterapia Dermatofuncional en Toluca",
      description: "Tratamientos clínicos especializados para el cuidado y rehabilitación de tu piel. Agenda tu valoración en Toluca, México.",
      images: [{
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LR Fisioderm - Fisioterapia Dermatofuncional Toluca",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "LR Fisioderm | Fisioterapia Dermatofuncional",
      description: "Tratamientos clínicos especializados para el cuidado de tu piel en Toluca.",
      images: ["/og-image.png"],
    },
    icons: {
      icon: [
        { url: logoUrl, type: "image/png" },
      ],
      apple: logoUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}

// Helper: Convierte HEX a "R G B"
function hexToRgb(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

// Helper: Mezcla dos colores RGB (r g b) con un peso (0 a 1)
function mixRgb(rgb1: string, rgb2: string, weight: number) {
  const [r1, g1, b1] = rgb1.split(' ').map(Number);
  const [r2, g2, b2] = rgb2.split(' ').map(Number);
  const w = weight;
  const r = Math.round(r1 * w + r2 * (1 - w));
  const g = Math.round(g1 * w + g2 * (1 - w));
  const b = Math.round(b1 * w + b2 * (1 - w));
  return `${r} ${g} ${b}`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let showStore = true;
  let primaryColor = '#D29C9F'; // default original Rosa Palo
  let logoUrl = '/logo.png';

  try {
    const { data } = await supabase.from('configuracion').select('clave, valor').in('clave', ['module_store', 'primary_color', 'logo_url']);
    if (data) {
      data.forEach(item => {
        if (item.clave === 'module_store' && item.valor === 'false') showStore = false;
        if (item.clave === 'primary_color' && item.valor) primaryColor = item.valor;
        if (item.clave === 'logo_url' && item.valor) logoUrl = item.valor;
      });
    }
  } catch (e) {
    // Fallback if error
  }

  // Generar paleta de colores dinámicamente
  const baseRgb = hexToRgb(primaryColor);
  const whiteRgb = '255 255 255';
  const blackRgb = '0 0 0';

  return (
    <html lang="es">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary-50: ${mixRgb(baseRgb, whiteRgb, 0.05)};
            --primary-100: ${mixRgb(baseRgb, whiteRgb, 0.15)};
            --primary-200: ${mixRgb(baseRgb, whiteRgb, 0.30)};
            --primary-300: ${mixRgb(baseRgb, whiteRgb, 0.50)};
            --primary-400: ${mixRgb(baseRgb, whiteRgb, 0.70)};
            --primary-500: ${baseRgb};
            --primary-600: ${mixRgb(baseRgb, blackRgb, 0.85)};
            --primary-700: ${mixRgb(baseRgb, blackRgb, 0.70)};
            --primary-800: ${mixRgb(baseRgb, blackRgb, 0.55)};
            --primary-900: ${mixRgb(baseRgb, blackRgb, 0.40)};
          }
        ` }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {/* Schema.org JSON-LD para SEO Local - Le dice a Google exactamente qué es tu negocio */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            "name": "LR Fisioderm",
            "description": "Especialistas en Fisioterapia Dermatofuncional en Toluca. Tratamientos clínicos para acné, manchas, rejuvenecimiento facial y más.",
            "url": "https://lrfisioderm.com",
            "logo": logoUrl.startsWith('http') ? logoUrl : `https://lrfisioderm.com${logoUrl}`,
            "image": "https://lrfisioderm.com/og-image.png",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Toluca de Lerdo",
              "addressRegion": "Estado de México",
              "addressCountry": "MX"
            },
            "openingHoursSpecification": [
              { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" }
            ],
            "sameAs": ["https://www.instagram.com/lr_fisderm"],
            "medicalSpecialty": "Dermatology",
            "priceRange": "$$"
          }) }}
        />
        <PublicHeader>
          <header className="bg-white/80 backdrop-blur-md border-b border-primary-100 text-primary-900 p-4 sticky top-0 z-50 transition-all duration-300">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src={logoUrl}
                alt="LR Fisioderm - Fisioterapia Dermatofuncional"
                width={44}
                height={44}
                className="rounded-full border border-primary-200 object-cover"
                priority
              />
              <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-primary-800">
                LR <span className="font-sans font-light text-primary-500 text-base md:text-lg">Fisioderm</span>
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {showStore && (
                <a href="/#catalogo" className="text-sm uppercase tracking-widest font-medium hover:text-primary-500 transition-colors">Catálogo</a>
              )}
              <a href="/#citas" className="text-sm uppercase tracking-widest font-medium hover:text-primary-500 transition-colors">Agendar Cita</a>
              <a href="/pwa" className="text-sm uppercase tracking-widest font-bold text-primary-600 hover:text-primary-800 transition-colors border border-primary-200 px-3 py-1.5 rounded-full bg-primary-50">
                Acceso Pacientes
              </a>
              <a href="https://www.instagram.com/lr_fisderm" target="_blank" className="text-primary-400 hover:text-primary-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              {/* Acceso al panel — ícono de candado discreto */}
              <div className="relative group">
                <a
                  href="/dashboard/login"
                  id="admin-access-btn"
                  className="flex items-center gap-1.5 text-primary-300 hover:text-primary-600 transition-colors p-1.5 rounded-lg hover:bg-primary-50"
                  title="Acceso Panel Especialista"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </a>
              </div>
            </nav>

            <div className="flex md:hidden items-center gap-2">
              <a href="/pwa" className="text-[10px] uppercase tracking-wider font-bold text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg border border-primary-100">
                Pacientes
              </a>
              <Image
                src={logoUrl}
                alt="LR Fisioderm"
                width={32}
                height={32}
                className="rounded-full border border-primary-200 object-cover"
              />
              <a href="/dashboard/login" className="text-primary-200 p-2" title="Panel Especialista">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </a>
            </div>
          </div>
        </header>
        </PublicHeader>
        <main className="flex-grow">
          {children}
        </main>
        <PublicHeader>
        <footer className="bg-primary-900 text-primary-100 py-16 mt-auto">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
              <div className="flex items-center gap-3 mb-6">
                <Image src={logoUrl} alt="LR Fisioderm" width={48} height={48} className="rounded-full border-2 border-primary-700 object-cover" />
                <h2 className="text-2xl font-serif font-bold text-white">LR Fisioderm</h2>
              </div>
              <p className="text-primary-200/80 leading-relaxed max-w-xs mx-auto md:mx-0">
                Fisioterapia Dermatofuncional con enfoque clínico en alteraciones de la piel y tejidos.
              </p>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest font-bold text-primary-400 mb-6">Navegación</h3>
              <ul className="space-y-3">
                {showStore && (
                  <li><a href="/#catalogo" className="hover:text-white transition-colors">Productos de Skincare</a></li>
                )}
                <li><a href="/#citas" className="hover:text-white transition-colors">Agendar Valoración</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Portal Especialista</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest font-bold text-primary-400 mb-6">Ubicación</h3>
              <p className="text-primary-200/80 mb-4">Toluca Lerdo, Estado de México</p>
              <div className="flex justify-center md:justify-start gap-4">
                <a href="https://www.instagram.com/lr_fisderm" target="_blank" className="bg-primary-800 p-2 rounded-lg hover:bg-primary-700 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-16 pt-8 border-t border-primary-800 text-center">
            <p className="text-primary-500 text-sm">&copy; {new Date().getFullYear()} LR Fisioderm. Todos los derechos reservados.</p>
          </div>
        </footer>
        </PublicHeader>
      </body>
    </html>
  );
}
