'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { optimizeImage } from '@/utils/optimizeImage';
import { 
  Plus, 
  Package, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Search, 
  Loader2,
  DollarSign,
  Image as ImageIcon,
  Tag
} from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria: string;
  stripe_link?: string;
}

export default function CatalogoAdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    categoria: 'Skincare',
    stripe_link: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProductos(data);
    setLoading(false);
  }

  async function handleImageUpload(file: File) {
    if (!file) return;
    setUploadingImage(true);
    try {
      // Optimizar: convertir a WebP y comprimir
      const optimized = await optimizeImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 });
      const fileName = `producto_${Date.now()}.webp`;
      const { error: upError } = await supabase.storage
        .from('catalogo')
        .upload(fileName, optimized, { upsert: true, contentType: 'image/webp' });
      if (upError) throw upError;

      const { data: urlData } = supabase.storage
        .from('catalogo')
        .getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, imagen_url: urlData.publicUrl }));
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('No se pudo subir la imagen. Verifica que el bucket "catalogo" exista en Supabase Storage.');
    } finally {
      setUploadingImage(false);
    }
  }

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio.toString(),
        imagen_url: producto.imagen_url || '',
        categoria: producto.categoria || 'Skincare',
        stripe_link: producto.stripe_link || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
        categoria: 'Skincare',
        stripe_link: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      precio: parseFloat(formData.precio)
    };

    if (editingProduct) {
      await supabase.from('productos').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('productos').insert([payload]);
    }

    setIsModalOpen(false);
    fetchProductos();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await supabase.from('productos').delete().eq('id', id);
      fetchProductos();
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-primary-100">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-600" />
            Catálogo de Productos
          </h1>
          <p className="text-primary-500 mt-1">Gestiona los productos que ven tus pacientes en la web y PWA</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary-800 transition shadow-lg shadow-primary-900/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Agregar Producto
        </button>
      </div>

      {/* Grid de Productos */}
      {loading && productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-primary-50">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-primary-500 italic">Cargando catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-[32px] overflow-hidden border border-primary-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-square relative bg-primary-50 overflow-hidden">
                {producto.imagen_url ? (
                  <img 
                    src={producto.imagen_url} 
                    alt={producto.nombre} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-200">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(producto)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-full text-primary-600 hover:bg-primary-600 hover:text-white transition shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(producto.id)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-primary-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {producto.categoria}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-primary-900 text-lg leading-tight truncate mr-2" title={producto.nombre}>
                    {producto.nombre}
                  </h3>
                  <span className="text-primary-600 font-bold text-lg">${producto.precio}</span>
                </div>
                <p className="text-primary-500 text-sm line-clamp-2 h-10 italic">
                  {producto.descripcion || 'Sin descripción...'}
                </p>
                {producto.stripe_link && (
                  <a 
                    href={producto.stripe_link} 
                    target="_blank" 
                    className="flex items-center gap-2 text-xs font-bold text-primary-400 hover:text-primary-600 transition pt-2"
                  >
                    <ExternalLink className="w-3 h-3" /> Ver link de pago
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {/* Tarjeta de "Agregar Nuevo" */}
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary-50/50 rounded-[32px] border-2 border-dashed border-primary-200 flex flex-col items-center justify-center p-8 text-primary-300 hover:border-primary-400 hover:text-primary-600 hover:bg-white transition-all min-h-[350px]"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold">Nuevo Producto</span>
          </button>
        </div>
      )}

      {/* Modal de Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-primary-900 p-8 text-white">
              <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                {editingProduct ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <p className="text-primary-300 text-sm mt-1">Completa los detalles del producto para el catálogo</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary-400 uppercase ml-1">Nombre del Producto</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                    <input
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-primary-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 outline-none transition"
                      placeholder="Ej. Sérum Vitamina C"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Precio ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                      <input
                        required
                        type="number"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 bg-primary-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 outline-none transition"
                        placeholder="0.00"
                        value={formData.precio}
                        onChange={(e) => setFormData({...formData, precio: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary-400 uppercase ml-1">Categoría</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                      <select
                        className="w-full pl-12 pr-4 py-3 bg-primary-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 outline-none transition appearance-none"
                        value={formData.categoria}
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      >
                        <option value="Skincare">Skincare</option>
                        <option value="Tratamiento">Tratamiento</option>
                        <option value="Limpieza">Limpieza</option>
                        <option value="Cuidado Solar">Cuidado Solar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary-400 uppercase ml-1">Descripción corta</label>
                  <textarea
                    rows={2}
                    className="w-full p-4 bg-primary-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 outline-none transition resize-none"
                    placeholder="Describe los beneficios principales..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary-400 uppercase ml-1">Imagen del Producto</label>
                  
                  {/* Preview */}
                  {formData.imagen_url && (
                    <div className="relative w-full aspect-video bg-primary-50 rounded-2xl overflow-hidden mb-2 border border-primary-100">
                      <img src={formData.imagen_url} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, imagen_url: ''})} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition">✕</button>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex rounded-2xl bg-primary-50 p-1 gap-1 mb-2">
                    <button type="button" onClick={() => setImageMode('upload')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${imageMode === 'upload' ? 'bg-white text-primary-900 shadow-sm' : 'text-primary-400 hover:text-primary-600'}`}>
                      <ImageIcon className="w-3.5 h-3.5" /> Subir Foto
                    </button>
                    <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${imageMode === 'url' ? 'bg-white text-primary-900 shadow-sm' : 'text-primary-400 hover:text-primary-600'}`}>
                      <ExternalLink className="w-3.5 h-3.5" /> Pegar URL
                    </button>
                  </div>

                  {/* Upload zone */}
                  {imageMode === 'upload' && (
                    <div
                      className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer ${uploadingImage ? 'border-primary-400 bg-primary-50 animate-pulse' : 'border-primary-200 hover:border-primary-400 hover:bg-primary-50/50'}`}
                      onClick={() => !uploadingImage && fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.type.startsWith('image/')) handleImageUpload(file); }}
                    >
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-primary-400">
                        {uploadingImage ? (
                          <><Loader2 className="w-8 h-8 animate-spin text-primary-500" /><p className="text-sm font-bold text-primary-500">Subiendo imagen...</p></>
                        ) : (
                          <><ImageIcon className="w-8 h-8" /><p className="text-sm font-semibold">{formData.imagen_url ? 'Cambiar imagen' : 'Arrastra una foto o haz clic aquí'}</p><p className="text-xs">JPG, PNG, WEBP · Máx. 5MB</p></>
                        )}
                      </div>
                    </div>
                  )}

                  {/* URL input */}
                  {imageMode === 'url' && (
                    <div className="space-y-1">
                      <input
                        type="url"
                        className="w-full px-4 py-3 bg-primary-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 outline-none transition text-sm"
                        placeholder="https://instagram.com/... o cualquier URL de imagen"
                        value={formData.imagen_url}
                        onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                      />
                      <p className="text-[10px] text-primary-400 italic ml-1">💡 Puedes pegar el link directo de cualquier imagen de Instagram, Unsplash, etc.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary-400 uppercase ml-1">Link de Pago (Opcional)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                    <input
                      type="url"
                      className="w-full pl-12 pr-4 py-3 bg-primary-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-400 outline-none transition"
                      placeholder="Link de Stripe o PayPal"
                      value={formData.stripe_link}
                      onChange={(e) => setFormData({...formData, stripe_link: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-primary-400 hover:bg-primary-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 px-10 py-3 bg-primary-900 text-white rounded-2xl font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-800 transition active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
