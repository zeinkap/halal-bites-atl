import type { MetadataRoute } from 'next';

/**
 * Web app manifest (served at /manifest.webmanifest), so phones can "Add to Home Screen" and
 * launch the site full-screen like an app. Visitors who already allowed location get Near Me
 * results on launch (RestaurantList checks the permission on load).
 *
 * Icons are generated from public/images/logo.png. The maskable ones shrink the artwork into
 * the safe zone so Android launchers can crop them to any shape.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Halal Bites ATL',
    short_name: 'Halal Bites',
    description: 'Find halal restaurants and cafes near you in Atlanta.',
    start_url: '/?source=homescreen',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fafaf9',
    theme_color: '#0d9488',
    categories: ['food', 'lifestyle', 'travel'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
