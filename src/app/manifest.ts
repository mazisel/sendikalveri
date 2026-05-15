import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sendikal Veri',
    short_name: 'SendikalVeri',
    description: 'Türkiye Sendika Veri Analiz Platformu',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
