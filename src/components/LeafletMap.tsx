'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LeafletMapProps {
  address: string;
  mapLink?: string | null;
}

export default function LeafletMap({ address, mapLink }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse coordinates from URL or geocode address
  useEffect(() => {
    let active = true;

    async function resolveCoordinates() {
      // 1. Try to parse from mapLink if it contains lat,lon
      if (mapLink) {
        // Match standard query parameters like q=lat,lon or query=lat,lon
        const qMatch = mapLink.match(/[?&](q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qMatch) {
          const lat = parseFloat(qMatch[2]);
          const lon = parseFloat(qMatch[3]);
          if (!isNaN(lat) && !isNaN(lon) && active) {
            setCoordinates([lat, lon]);
            setLoading(false);
            return;
          }
        }

        // Match Google Maps @lat,lon style
        const atMatch = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) {
          const lat = parseFloat(atMatch[1]);
          const lon = parseFloat(atMatch[2]);
          if (!isNaN(lat) && !isNaN(lon) && active) {
            setCoordinates([lat, lon]);
            setLoading(false);
            return;
          }
        }
      }

      // 2. Geocode using OpenStreetMap Nominatim API
      if (address) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address
            )}&limit=1`,
            {
              headers: {
                // Good practice to identify request source per Nominatim usage policy
                'User-Agent': 'medical-lk-pharmacy-hub-agent',
              },
            }
          );
          if (!response.ok) throw new Error('Geocoding failed');
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            if (!isNaN(lat) && !isNaN(lon) && active) {
              setCoordinates([lat, lon]);
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('OSM Nominatim Geocoding Error:', error);
        }
      }

      // 3. Fallback to Colombo, Sri Lanka
      if (active) {
        setCoordinates([6.9148, 79.8496]);
        setLoading(false);
      }
    }

    resolveCoordinates();

    return () => {
      active = false;
    };
  }, [address, mapLink]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!coordinates || !mapContainerRef.current) return;

    // Load Leaflet dynamically to avoid SSR errors
    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView(coordinates, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Custom marker icon to prevent missing asset reference errors in production
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [-15, -20],
        shadowSize: [41, 41],
      });

      L.marker(coordinates, { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `<div style="display: flex; align-items: center; gap: 10px; font-family: sans-serif; font-size: 11px; color: #0b1c30; min-width: 220px; padding: 2px;">
             <img 
               src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=120&h=120&q=80" 
               alt="Pharmacy storefront" 
               style="width: 52px; height: 52px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" 
             />
             <div>
               <strong style="display: block; margin-bottom: 2px; color: #0f3d57;">Pharmacy Location</strong>
               <span style="display: block; color: #42474d; line-height: 1.3;">${address}</span>
             </div>
           </div>`
        )
        .openPopup();

      // Invalidate size helper for fitting container dimensions correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      return () => {
        map.remove();
      };
    });
  }, [coordinates, address]);

  if (loading) {
    return (
      <div className="w-full h-full bg-[#f8f9ff] flex flex-col items-center justify-center text-[#a3aab0] text-xs gap-1.5 min-h-[192px]">
        <Loader2 className="h-5 w-5 animate-spin text-[#006d37]" />
        <span>Resolving location coordinates...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[192px] relative z-10">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />
    </div>
  );
}
