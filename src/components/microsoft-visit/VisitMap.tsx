import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Location {
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
  time: string;
  order: number;
}

const locations: Location[] = [
  {
    name: "TEDC Creative Capital",
    address: "125 W 3rd St",
    coordinates: [-95.9934, 36.1540],
    time: "8:00 AM",
    order: 1
  },
  {
    name: "City Hall",
    address: "175 E 2nd St S",
    coordinates: [-95.9891, 36.1534],
    time: "9:00 AM",
    order: 2
  },
  {
    name: "Gradient",
    address: "12 N Cheyenne Ave",
    coordinates: [-95.9944, 36.1556],
    time: "10:00 AM",
    order: 3
  },
  {
    name: "Fixins Soul Kitchen",
    address: "222 N Detroit Ave",
    coordinates: [-95.9912, 36.1582],
    time: "12:10 PM",
    order: 4
  },
  {
    name: "Tulsa Regional Chamber",
    address: "1 W 3rd St",
    coordinates: [-95.9920, 36.1543],
    time: "1:30 PM",
    order: 5
  },
  {
    name: "Liquid Lounge (Greenwood)",
    address: "10 N Greenwood Ave",
    coordinates: [-95.9863, 36.1568],
    time: "2:45 PM",
    order: 6
  },
  {
    name: "Rudisill Library",
    address: "1520 N Hartford Ave",
    coordinates: [-95.9876, 36.1742],
    time: "4:00 PM",
    order: 7
  },
  {
    name: "GEM Building",
    address: "660 E Pine St",
    coordinates: [-95.9802, 36.1648],
    time: "5:15 PM",
    order: 8
  }
];

export function VisitMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initMap() {
      if (!mapContainer.current) return;

      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (fnError || !data?.token) {
          setError('Map unavailable');
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = data.token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-95.9880, 36.1620],
          zoom: 13,
          pitch: 45,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: true }),
          'top-right'
        );

        map.current.on('load', () => {
          // Add markers for each location
          locations.forEach((loc) => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.innerHTML = `
              <div style="
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">${loc.order}</div>
            `;

            new mapboxgl.Marker(el)
              .setLngLat(loc.coordinates)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div style="padding: 8px;">
                      <strong style="font-size: 14px;">${loc.name}</strong>
                      <p style="margin: 4px 0 0; font-size: 12px; color: #666;">${loc.time}</p>
                      <p style="margin: 2px 0 0; font-size: 11px; color: #888;">${loc.address}</p>
                    </div>
                  `)
              )
              .addTo(map.current!);
          });

          // Draw route line
          const routeCoordinates = locations
            .sort((a, b) => a.order - b.order)
            .map(loc => loc.coordinates);

          map.current?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
              }
            }
          });

          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#8b5cf6',
              'line-width': 3,
              'line-opacity': 0.7,
              'line-dasharray': [2, 2]
            }
          });

          setLoading(false);
        });

      } catch (err) {
        setError('Failed to load map');
        setLoading(false);
      }
    }

    initMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border">
      {loading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
