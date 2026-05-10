import CitasForm from "@/components/CitasForm";
import ProductoCard from "@/components/ProductoCard";
import { supabase } from "@/utils/supabase";
import { Sparkles, Activity, ShieldCheck, MapPin, Phone, Mail, Clock, Instagram, Star, ArrowRight, UserCircle2, CheckCircle2 } from "lucide-react";

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

  // Fetch configuracion para secciones de landing
  const { data: configData } = await supabase.from('configuracion').select('*');
  const config = (configData || []).reduce((acc: any, item: any) => {
    acc[item.clave] = item.valor;
    return acc;
  }, {});

  const showServicios = config.landing_servicios !== 'false';
  const showProceso = config.landing_proceso !== 'false';
  const showTestimonios = config.landing_testimonios === 'true'; // Default false
  const showEspecialista = config.landing_especialista !== 'false';
  const showUbicacion = config.landing_ubicacion !== 'false';

  let especialistaInfo = { titulo: 'Lic. en Fisioterapia', descripcion: 'Con especialidad en Fisioterapia Dermatofuncional. Mi pasión es devolverle la salud y funcionalidad a tu piel a través de tratamientos con rigor científico y tecnología de vanguardia.', instagram: 'lr_fisderm' };
  let ubicacionInfo = { direccion: 'Toluca de Lerdo, Estado de México', horario: 'Lunes a Viernes: 9:00 am - 6:00 pm\nSábados: Previa cita' };
  
  if (config.especialista_info) {
    try { especialistaInfo = { ...especialistaInfo, ...JSON.parse(config.especialista_info) }; } catch(e){}
  }
  if (config.ubicacion_info) {
    try { ubicacionInfo = { ...ubicacionInfo, ...JSON.parse(config.ubicacion_info) }; } catch(e){}
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

      {/* 1. Servicios Section */}
      {showServicios && (
        <section className="py-24 bg-white px-4 border-t border-primary-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-primary-500">Nuestros Servicios</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary-900">Tratamientos Especializados</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Sparkles className="w-8 h-8"/>, title: 'Limpieza Profunda Clínica', desc: 'Extracción profesional de impurezas con aparatología y productos dermatológicos de alta gama.' },
                { icon: <Activity className="w-8 h-8"/>, title: 'Peeling Químico', desc: 'Renovación celular intensiva para tratar manchas, marcas de acné y textura irregular.' },
                { icon: <ShieldCheck className="w-8 h-8"/>, title: 'Control de Acné', desc: 'Protocolo clínico para desinflamar, controlar la bacteria y restaurar la barrera cutánea.' },
                { icon: <UserCircle2 className="w-8 h-8"/>, title: 'Rejuvenecimiento Facial', desc: 'Estimulación de colágeno y elastina para mejorar la firmeza y atenuar líneas de expresión.' },
                { icon: <CheckCircle2 className="w-8 h-8"/>, title: 'Valoración Dermatofuncional', desc: 'Análisis profundo de la piel con luz de Wood para diseñar tu protocolo personalizado.' },
                { icon: <Activity className="w-8 h-8"/>, title: 'Dermapen / Microneedling', desc: 'Terapia de inducción de colágeno para cicatrices, estrías y revitalización facial.' }
              ].map((servicio, i) => (
                <div key={i} className="p-8 rounded-[32px] border border-primary-100 hover:border-primary-300 hover:shadow-xl transition-all duration-300 group bg-stone-50/50 hover:bg-white">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {servicio.icon}
                  </div>
                  <h4 className="text-xl font-bold text-primary-900 mb-3">{servicio.title}</h4>
                  <p className="text-primary-600 leading-relaxed font-light">{servicio.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Proceso Section */}
      {showProceso && (
        <section className="py-24 bg-primary-900 px-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-primary-300">Metodología</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">Tu camino hacia una piel sana</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Conector visual (oculto en móvil) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 z-0"></div>
              
              {[
                { step: '01', title: 'Valoración', desc: 'Análisis clínico profundo para entender las necesidades únicas de tu piel y tus objetivos.' },
                { step: '02', title: 'Protocolo', desc: 'Diseño de un plan de tratamiento en cabina combinado con una rutina para casa.' },
                { step: '03', title: 'Seguimiento', desc: 'Acompañamiento constante a través de nuestra App (PWA) para garantizar resultados.' }
              ].map((paso, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-primary-800 border-4 border-primary-900 rounded-full flex items-center justify-center mb-6 shadow-xl relative">
                    <span className="text-3xl font-serif font-bold text-primary-200">{paso.step}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{paso.title}</h4>
                  <p className="text-primary-200/80 leading-relaxed font-light px-4">{paso.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* 3. Testimonios Section */}
      {showTestimonios && (
        <section className="py-24 bg-primary-50 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-primary-500">Historias de Éxito</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary-900">Lo que dicen nuestros pacientes</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Sofía R.', text: 'El cambio en mi acné ha sido increíble. Después de años probando de todo, el enfoque clínico de LR Fisioderm fue lo único que me funcionó. Mi piel está sana.', rating: 5 },
                { name: 'Daniela M.', text: 'La valoración es súper completa. Me explicaron exactamente qué necesitaba mi piel y la rutina de casa es fácil de seguir desde la aplicación.', rating: 5 },
                { name: 'Carmen T.', text: 'Excelente atención y profesionalismo. Los tratamientos de rejuvenecimiento han mejorado muchísimo la textura de mi piel. Se nota la diferencia.', rating: 5 }
              ].map((testimonio, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-primary-100 flex flex-col">
                  <div className="flex gap-1 text-amber-400 mb-6">
                    {[...Array(testimonio.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                  </div>
                  <p className="text-primary-700 italic flex-1 font-light leading-relaxed mb-6">"{testimonio.text}"</p>
                  <p className="font-bold text-primary-900">— {testimonio.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Especialista Section */}
      {showEspecialista && (
        <section className="py-24 bg-white px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-stone-50 rounded-[40px] overflow-hidden border border-primary-100 shadow-lg flex flex-col md:flex-row">
              <div className="md:w-2/5 aspect-square md:aspect-auto bg-primary-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-primary-300 bg-primary-50">
                   <UserCircle2 className="w-32 h-32 opacity-50" />
                   {/* Aquí el usuario puede reemplazar luego con su foto real */}
                </div>
              </div>
              <div className="md:w-3/5 p-10 md:p-16 flex flex-col justify-center space-y-6">
                <div className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold tracking-widest uppercase w-fit">
                  La Especialista
                </div>
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-primary-900">{especialistaInfo.titulo}</h3>
                <p className="text-lg text-primary-600 font-light leading-relaxed whitespace-pre-line">
                  {especialistaInfo.descripcion}
                </p>
                <div className="pt-4">
                  <a href={`https://instagram.com/${especialistaInfo.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-800 transition">
                    <Instagram className="w-5 h-5" /> Sígueme en Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* 5. Ubicación Section */}
      {showUbicacion && (
        <section className="py-24 bg-stone-900 px-4 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-stone-400 mb-4">Visítanos</h2>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">Tu clínica de confianza en Toluca</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-stone-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Ubicación</h4>
                      <p className="text-stone-400 font-light leading-relaxed whitespace-pre-line">{ubicacionInfo.direccion}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-stone-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Horario de Atención</h4>
                      <p className="text-stone-400 font-light leading-relaxed whitespace-pre-line">{ubicacionInfo.horario}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-stone-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Contacto</h4>
                      <p className="text-stone-400 font-light leading-relaxed">
                        WhatsApp: {config.whatsapp ? `+${config.whatsapp}` : 'No disponible'}<br/>
                        IG: @{especialistaInfo.instagram.replace('@', '')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[400px] bg-stone-800 rounded-[40px] border border-white/10 overflow-hidden relative shadow-2xl">
                {ubicacionInfo.googleMapsUrl ? (
                  <iframe 
                    src={ubicacionInfo.googleMapsUrl} 
                    className="w-full h-full border-0 grayscale invert brightness-90 contrast-90" 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                    <div className="relative z-10 text-center space-y-4 p-8">
                      <MapPin className="w-12 h-12 text-white/50 mx-auto" />
                      <p className="font-serif text-2xl font-bold text-white/80">Toluca, Edo. Méx</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
