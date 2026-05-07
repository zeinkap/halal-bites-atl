'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant } from '@/types';
import { formatCuisineName } from '@/utils/formatCuisineName';

// Fix Leaflet's broken default icon paths in Next.js/webpack builds
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Custom teal marker for halal restaurants
function createHalalMarker() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: #0d9488;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

// Recenter map when filtered restaurants change
function MapRecenter({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap();

  useEffect(() => {
    const mappable = restaurants.filter(r => r.latitude && r.longitude);
    if (mappable.length === 0) return;

    if (mappable.length === 1) {
      map.setView([mappable[0].latitude!, mappable[0].longitude!], 14);
      return;
    }

    const bounds = L.latLngBounds(
      mappable.map(r => [r.latitude!, r.longitude!] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [restaurants, map]);

  return null;
}

interface RestaurantMapViewProps {
  restaurants: Restaurant[];
}

export default function RestaurantMapView({ restaurants }: RestaurantMapViewProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const mappable = restaurants.filter(r => r.latitude && r.longitude);

  // Default center: Atlanta
  const defaultCenter: [number, number] = [33.749, -84.388];
  const halalMarker = createHalalMarker();

  const priceLabel = (p: string) => p === 'LOW' ? '$' : p === 'MEDIUM' ? '$$' : '$$$';

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-stone-200" style={{ height: '560px' }}>
      {mappable.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full bg-stone-50 text-stone-500 gap-3">
          <svg className="h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm font-medium">No restaurants with map coordinates found.</p>
          <p className="text-xs text-stone-400">Try clearing filters or searching in a broader area.</p>
        </div>
      ) : (
        <>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm text-xs text-stone-600 font-medium px-3 py-1.5 rounded-full shadow-sm border border-stone-200 pointer-events-none">
            {mappable.length} restaurant{mappable.length !== 1 ? 's' : ''} on map
          </div>
          <MapContainer
            center={defaultCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter restaurants={restaurants} />
            {mappable.map(restaurant => (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude!, restaurant.longitude!]}
                icon={halalMarker}
              >
                <Popup maxWidth={240} className="halal-popup">
                  <div className="text-sm leading-relaxed p-1">
                    <p className="font-bold text-stone-900 text-base mb-1 leading-tight">{restaurant.name}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="inline-block bg-teal-50 text-teal-700 border border-teal-100 text-xs font-medium px-2 py-0.5 rounded-full">
                        {formatCuisineName(restaurant.cuisineType)}
                      </span>
                      <span className="inline-block bg-stone-100 text-stone-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {priceLabel(restaurant.priceRange)}
                      </span>
                      {restaurant.avgRating != null && (
                        <span className="inline-block bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold px-2 py-0.5 rounded-full">
                          ★ {restaurant.avgRating.toFixed(1)} ({restaurant.commentCount})
                        </span>
                      )}
                    </div>
                    <p className="text-stone-500 text-xs mb-3 leading-relaxed">{restaurant.address}</p>
                    <div className="flex gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Directions
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Google Maps
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      )}
    </div>
  );
}
