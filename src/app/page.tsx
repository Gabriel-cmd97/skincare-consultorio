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
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6 leading-tight">
            Descubre tu mejor piel con Lumina Skincare
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Tratamientos dermatológicos personalizados y una selección exclusiva de productos de grado médico para cuidar tu piel.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#citas" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Agendar Valoración
            </a>
            <a href="#catalogo" className="bg-white hover:bg-primary-50 text-primary-700 border-2 border-primary-100 font-semibold py-3 px-8 rounded-full transition-all shadow-sm hover:shadow-md">
              Ver Productos
            </a>
          </div>
        </div>
      </section>

      {/* Catálogo Section */}
      <section id="catalogo" className="py-20 bg-white px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Catálogo de Productos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Nuestra selección de productos dermatológicos de alta calidad, listos para enviar directamente a tu hogar.</p>
          </div>
          
          {productos && productos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-lg">Aún no hay productos en el catálogo.</p>
            </div>
          )}
        </div>
      </section>

      {/* Citas Section */}
      <section id="citas" className="py-20 bg-primary-50 px-4 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transform translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto relative z-10 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">Agenda tu cita hoy mismo</h2>
            <p className="text-lg text-gray-700 mb-8">
              Da el primer paso hacia una piel radiante y saludable. Completa el formulario y asegura tu lugar en nuestro consultorio.
            </p>
            <ul className="space-y-4 text-left max-w-md mx-auto lg:mx-0">
              <li className="flex items-center text-gray-700">
                <span className="bg-primary-100 text-primary-700 p-2 rounded-full mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </span>
                Atención personalizada
              </li>
              <li className="flex items-center text-gray-700">
                <span className="bg-primary-100 text-primary-700 p-2 rounded-full mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </span>
                Sin tiempos de espera
              </li>
              <li className="flex items-center text-gray-700">
                <span className="bg-primary-100 text-primary-700 p-2 rounded-full mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </span>
                Tratamientos seguros y efectivos
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 w-full">
            <CitasForm />
          </div>
        </div>
      </section>
    </div>
  );
}
