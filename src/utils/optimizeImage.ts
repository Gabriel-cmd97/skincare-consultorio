/**
 * Optimiza una imagen convirtiéndola a WebP y comprimiéndola.
 * Usa el Canvas API del navegador (no requiere dependencias).
 */
export async function optimizeImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calcular dimensiones manteniendo proporción
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Dibujar en canvas y exportar como WebP
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al convertir imagen'));
            return;
          }

          // Crear nuevo File con extensión .webp
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const optimized = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
          });

          console.log(
            `🖼️ Imagen optimizada: ${(file.size / 1024).toFixed(0)}KB → ${(optimized.size / 1024).toFixed(0)}KB (${Math.round((1 - optimized.size / file.size) * 100)}% reducción)`
          );

          resolve(optimized);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar imagen'));
    };

    img.src = url;
  });
}
