import Image from "next/image";

interface ProductoProps {
  producto: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
    stripe_link: string;
    categoria: string;
  };
}

export default function ProductoCard({ producto }: ProductoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
      <div className="relative h-64 w-full bg-gray-50 flex items-center justify-center p-4">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-gray-400 font-medium">Sin imagen</div>
        )}
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 rounded-full shadow-sm">
          {producto.categoria}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{producto.nombre}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{producto.descripcion}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-primary-600">${producto.precio.toFixed(2)}</span>
          {producto.stripe_link ? (
            <a
              href={producto.stripe_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-900 hover:bg-primary-800 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              Comprar
            </a>
          ) : (
            <button disabled className="bg-gray-200 text-gray-500 px-5 py-2 rounded-lg font-medium cursor-not-allowed">
              Agotado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
