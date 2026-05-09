import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LR Fisioderm',
    short_name: 'LR Fisioderm',
    description: 'Portal de pacientes y tienda de cuidado dermatofuncional',
    start_url: '/pwa',
    display: 'standalone',
    background_color: '#fdfbf9',
    theme_color: '#907661',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
