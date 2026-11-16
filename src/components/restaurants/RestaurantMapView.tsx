'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Restaurant } from '@/types';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { formatDistanceMiles, formatDriveTime } from '@/utils/formatDistance';

/** The point Near Me results are measured from: the user's device location or a typed city/ZIP. */
export type SearchCenter = { lat: number; lng: number; source: 'device' | 'place' };

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

// Teal pin for a restaurant; the selected one is larger and darker.
function createHalalMarker(id: string, selected: boolean) {
  const size = selected ? 40 : 32;
  return L.divIcon({
    className: '',
    html: `<div data-testid="map-marker-${id}" style="
      width: ${size}px;
      height: ${size}px;
      background: ${selected ? '#115e59' : '#0d9488'};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,${selected ? 0.4 : 0.25});
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
  });
}

// "You are here" (blue dot) for device location; a grey ringed dot for a searched city/ZIP.
function createCenterMarker(source: SearchCenter['source']) {
  const color = source === 'device' ? '#2563eb' : '#57534e';
  return L.divIcon({
    className: '',
    html: `<div data-testid="map-search-center" data-source="${source}" style="
      width: 20px;
      height: 20px;
      background: ${color};
      border: 3px solid white;
      border-radius: 9999px;
      box-shadow: 0 0 0 6px ${color}33, 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Leaflet renders grey tiles when the map initializes before its container
// has its final laid-out size (common behind a list/map view toggle and a
// dynamic import). Recomputing the size after mount forces the correct tiles
// to load.
function InvalidateMapSize() {
  const map = useMap();

  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(id);
  }, [map]);

  return null;
}

/** How many of the nearest restaurants to frame around a search center. */
const NEAREST_TO_FRAME = 8;

// Fit the map to the results. With a search center, frame the center and its nearest
// restaurants (with "Any" distance the full result set spans the whole metro area).
// Keyed on content, not array identity, so re-renders don't yank the map while panning.
function MapRecenter({
  restaurants,
  searchCenter,
  bottomInset,
}: {
  restaurants: Restaurant[];
  searchCenter: SearchCenter | null;
  /** Pixels covered at the bottom (the phone strip), kept clear when framing. */
  bottomInset: number;
}) {
  const map = useMap();
  const key =
    restaurants.map((r) => r.id).join(',') +
    (searchCenter ? `@${searchCenter.lat},${searchCenter.lng}` : '');

  useEffect(() => {
    const mappable = restaurants.filter((r) => r.latitude && r.longitude);
    const points: [number, number][] = [];

    if (searchCenter) {
      points.push([searchCenter.lat, searchCenter.lng]);
      [...mappable]
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
        .slice(0, NEAREST_TO_FRAME)
        .forEach((r) => points.push([r.latitude!, r.longitude!]));
    } else {
      mappable.forEach((r) => points.push([r.latitude!, r.longitude!]));
    }

    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), {
      paddingTopLeft: [40, 56],
      paddingBottomRight: [40, 40 + bottomInset],
      maxZoom: 14,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}

// Reports the visible area after every pan/zoom (and once on load).
function BoundsWatcher({ onChange }: { onChange: (b: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => onChange(map.getBounds()),
    zoomend: () => onChange(map.getBounds()),
  });
  useEffect(() => {
    const id = setTimeout(() => onChange(map.getBounds()), 150);
    return () => clearTimeout(id);
  }, [map, onChange]);
  return null;
}

const priceLabel = (p: string) => (p === 'LOW' ? '$' : p === 'MEDIUM' ? '$$' : '$$$');
const directionsUrl = (r: Restaurant) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}`;
const mapsUrl = (r: Restaurant) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}`;

/** Cap on cards in the phone strip; the map itself still shows every pin. */
const STRIP_LIMIT = 25;

interface RestaurantMapViewProps {
  restaurants: Restaurant[];
  /** Near Me center: shows a "you are here" (or searched place) marker and frames the nearest results. */
  searchCenter?: SearchCenter | null;
  /** Called by the locate button when there is no search center yet (starts the Near Me flow). */
  onLocate?: () => void;
  /**
   * Phones: the map fills the screen above the bottom bar, pins open a swipeable strip of the
   * restaurants in view (instead of popups), and the zoom buttons are dropped for pinch-zoom.
   */
  fullScreen?: boolean;
}

export default function RestaurantMapView({
  restaurants,
  searchCenter = null,
  onLocate,
  fullScreen = false,
}: RestaurantMapViewProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const [map, setMap] = useState<L.Map | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stripItemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const mappable = useMemo(() => restaurants.filter((r) => r.latitude && r.longitude), [restaurants]);

  // Restaurants inside the visible area, nearest first when distances are known.
  const inView = useMemo(() => {
    if (!fullScreen || !bounds) return [];
    return mappable
      .filter((r) => bounds.contains([r.latitude!, r.longitude!]))
      .sort((a, b) =>
        a.distance != null && b.distance != null ? a.distance - b.distance : a.name.localeCompare(b.name),
      )
      .slice(0, STRIP_LIMIT);
  }, [fullScreen, bounds, mappable]);

  // Selecting a pin brings its card into the strip.
  useEffect(() => {
    if (!selectedId) return;
    stripItemRefs.current[selectedId]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedId, inView]);

  // Pan so the restaurant sits in the middle of the area the strip doesn't cover.
  const focusRestaurant = (r: Restaurant) => {
    setSelectedId(r.id);
    if (!map) return;
    const stripHeight = stripRef.current?.offsetHeight ?? 0;
    const target = map.project([r.latitude!, r.longitude!], map.getZoom()).add([0, stripHeight / 2]);
    map.panTo(map.unproject(target, map.getZoom()));
  };

  const handleLocate = () => {
    if (searchCenter && map) {
      map.flyTo([searchCenter.lat, searchCenter.lng], Math.max(map.getZoom(), 13));
    } else {
      onLocate?.();
    }
  };

  const defaultCenter: [number, number] = [33.749, -84.388]; // Atlanta
  const centerIcon = useMemo(() => (searchCenter ? createCenterMarker(searchCenter.source) : null), [searchCenter]);

  const containerClass = fullScreen
    ? 'fixed inset-x-0 top-0 z-[45] bg-stone-100 bottom-[calc(var(--bottom-bar-h)+env(safe-area-inset-bottom))]'
    : 'relative w-full h-[560px] rounded-2xl overflow-hidden shadow-lg border border-stone-200';

  return (
    <div className={containerClass} data-testid="restaurant-map" data-fullscreen={fullScreen ? 'true' : 'false'}>
      {mappable.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full bg-stone-50 text-stone-500 gap-3 px-6 text-center">
          <svg className="h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm font-medium">No restaurants with map coordinates found.</p>
          <p className="text-xs text-stone-400">Try clearing filters or searching in a broader area.</p>
        </div>
      ) : (
        <>
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm text-xs text-stone-700 font-semibold px-3 py-1.5 rounded-full shadow-md border border-stone-200 pointer-events-none"
            style={{ top: fullScreen ? 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' : '0.5rem' }}
            data-testid="map-count"
          >
            {mappable.length} restaurant{mappable.length !== 1 ? 's' : ''} on map
          </div>

          <MapContainer
            ref={setMap}
            center={defaultCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={!fullScreen}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <InvalidateMapSize />
            {/* The phone strip is ~170px tall; frame results in the area above it. */}
            <MapRecenter restaurants={restaurants} searchCenter={searchCenter} bottomInset={fullScreen ? 170 : 0} />
            {fullScreen && <BoundsWatcher onChange={setBounds} />}

            {searchCenter && centerIcon && (
              <Marker
                position={[searchCenter.lat, searchCenter.lng]}
                icon={centerIcon}
                title={searchCenter.source === 'device' ? 'You are here' : 'Searched location'}
                zIndexOffset={-100}
                keyboard={false}
              />
            )}

            {mappable.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude!, restaurant.longitude!]}
                icon={createHalalMarker(restaurant.id, fullScreen && restaurant.id === selectedId)}
                title={restaurant.name}
                zIndexOffset={fullScreen && restaurant.id === selectedId ? 1000 : 0}
                eventHandlers={fullScreen ? { click: () => setSelectedId(restaurant.id) } : undefined}
              >
                {!fullScreen && (
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
                          href={directionsUrl(restaurant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs font-semibold bg-teal-600 hover:bg-teal-700 !text-white !no-underline px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Directions
                        </a>
                        <a
                          href={mapsUrl(restaurant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs font-semibold bg-stone-100 hover:bg-stone-200 !text-stone-700 !no-underline px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Google Maps
                        </a>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MapContainer>

          {/* Bottom overlay: locate button, then (phones) the strip of restaurants in view. */}
          <div className="absolute inset-x-0 bottom-0 z-[1000] pointer-events-none flex flex-col items-end gap-2 pb-3">
            <button
              type="button"
              onClick={handleLocate}
              className="pointer-events-auto mr-3 h-12 w-12 rounded-full bg-white text-blue-600 shadow-lg border border-stone-200 flex items-center justify-center active:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label={searchCenter ? (searchCenter.source === 'device' ? 'Center on my location' : 'Center on searched location') : 'Find restaurants near me'}
              data-testid="map-locate-button"
            >
              {/* crosshair / locate icon */}
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </button>

            {fullScreen && (
              <div ref={stripRef} className="w-full pointer-events-auto" data-testid="map-strip">
                {inView.length === 0 ? (
                  <div className="mx-3 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg border border-stone-200 px-4 py-3 text-sm text-stone-600 text-center">
                    No restaurants in this area. Zoom out to see more.
                  </div>
                ) : (
                  <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {inView.map((r) => {
                      const distance = formatDistanceMiles(r.distance);
                      const drive = formatDriveTime(r.distance);
                      const selected = r.id === selectedId;
                      return (
                        <div
                          key={r.id}
                          ref={(el) => {
                            stripItemRefs.current[r.id] = el;
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={() => focusRestaurant(r)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              focusRestaurant(r);
                            }
                          }}
                          aria-pressed={selected}
                          className={`snap-center flex-shrink-0 w-[80%] max-w-[300px] rounded-2xl bg-white shadow-lg border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                            selected ? 'border-teal-500 ring-2 ring-teal-500/40' : 'border-stone-200'
                          }`}
                          data-testid={`map-strip-item-${r.id}`}
                        >
                          <p className="font-bold text-stone-900 text-sm leading-tight line-clamp-1">{r.name}</p>
                          <p className="mt-1 text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
                            {distance && (
                              <span className="font-semibold text-emerald-700">
                                {distance}
                                {drive && <span className="font-normal text-stone-500"> ({drive.replace(' drive', '')})</span>}
                              </span>
                            )}
                            {distance && <span aria-hidden="true">·</span>}
                            <span>{formatCuisineName(r.cuisineType)}</span>
                            <span aria-hidden="true">·</span>
                            <span>{priceLabel(r.priceRange)}</span>
                            {r.avgRating != null && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-700 font-semibold">★ {r.avgRating.toFixed(1)}</span>
                              </>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold">
                            {r.isFullyHalal ? (
                              <span className="text-emerald-700">Fully Halal</span>
                            ) : r.isPartiallyHalal ? (
                              <span className="text-amber-700">Partially Halal</span>
                            ) : null}
                            {r.isZabiha && <span className="text-amber-600">{r.isFullyHalal || r.isPartiallyHalal ? ' · ' : ''}Zabihah</span>}
                          </p>
                          <div className="mt-2.5 flex gap-2">
                            <a
                              href={directionsUrl(r)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 inline-flex items-center justify-center gap-1 h-11 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
                              data-testid={`map-strip-directions-${r.id}`}
                            >
                              Directions
                              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-white/80" />
                            </a>
                            <a
                              href={mapsUrl(r)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-11 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold border border-stone-200"
                            >
                              Maps
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
