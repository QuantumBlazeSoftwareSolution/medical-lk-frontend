import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Medical.lk',
    short_name: 'Medical.lk',
    description: 'Premium Pharmacy SaaS & Cloud POS Terminal',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#006d37',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
