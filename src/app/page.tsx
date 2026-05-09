import CitasForm from "@/components/CitasForm";
import ProductoCard from "@/components/ProductoCard";
import { supabase } from "@/utils/supabase";

// Revalidar los datos cada 60 segundos
export const revalidate = 60;

export default async function Home() {
  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center px-4 overflow-hidden pt-12 pb-24">
        {/* Fondo decorativo con círculos suaves */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-100 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 opacity-40"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium tracking-wide uppercase border border-primary-100">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
              Especialidad en Fisioterapia Dermatofuncional
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-primary-900 leading-[1.1]">
              Tu piel merece un <br />
              <span className="italic text-primary-500">enfoque clínico</span>
            </h2>
            <p className="text-xl text-primary-800/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Tratamientos especializados en alteraciones de la piel y tejidos en Toluca. Cuidado profesional con base científica para resultados reales.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 pt-4">
              <a href="#citas" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-10 rounded-full transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Agendar Valoración
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
              <a href="#catalogo" className="w-full sm:w-auto bg-white hover:bg-primary-50 text-primary-700 border border-primary-200 font-semibold py-4 px-10 rounded-full transition-all shadow-sm hover:shadow-md flex items-center justify-center">
                Ver Productos
              </a>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="aspect-[4/5] bg-primary-100 rounded-[40px] overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Placeholder para imagen de consultorio/servicio */}
              <div className="w-full h-full flex items-center justify-center text-primary-300">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            {/* Tarjeta flotante de confianza */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl border border-primary-50 max-w-xs animate-bounce-slow">
              <div className="flex gap-4 items-center">
                <div className="bg-primary-500 p-3 rounded-xl text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div>
                  <p className="font-bold text-primary-900 text-lg">Certificada</p>
                  <p className="text-sm text-primary-500">Resultados clínicos garantizados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo Section */}
      <section id="catalogo" className="py-32 bg-stone-50 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
            <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-primary-500">Línea de Cuidado</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary-900">Catálogo de Grado Médico</h3>
            <p className="text-lg text-primary-800/60 font-light">Seleccionamos cuidadosamente los mejores productos para potenciar tu tratamiento en casa.</p>
          </div>
          
          {productos && productos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-primary-100 shadow-sm">
              <svg className="w-16 h-16 text-primary-100 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              <p className="text-primary-400 text-xl font-light">Próximamente disponible</p>
            </div>
          )}
        </div>
      </section>

      {/* Citas Section */}
      <section id="citas" className="py-20 lg:py-32 bg-white px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-primary-900 rounded-3xl lg:rounded-[50px] overflow-hidden shadow-2xl flex flex-col lg:grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 md:p-20 space-y-6 lg:space-y-8 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Empieza tu <br /><span className="italic text-primary-300">transformación</span> hoy
              </h2>
              <p className="text-primary-100/70 text-lg font-light leading-relaxed">
                Cada piel es única. Agenda una valoración completa para diseñar un protocolo personalizado a tus necesidades.
              </p>
              
              <div className="space-y-6 pt-4">
                {[
                  "Atención clínica personalizada",
                  "Tecnología de última generación",
                  "Seguimiento profesional continuo"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-primary-50">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                      <svg className="w-4 h-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 sm:p-8 md:p-16">
              <div className="max-w-md mx-auto">
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-primary-900 mb-6 lg:mb-8 text-center lg:text-left">Agenda tu cita</h4>
                <CitasForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
