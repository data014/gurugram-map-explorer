import { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonData, getFeatureCategory, getFeatureName } from '@/hooks/useGeoJsonData';
import { getCategoryColor } from '@/lib/categoryColors';

interface LeafletMapProps {
  data: GeoJsonData | null;
  boundaryData: GeoJsonData | null;
  activeCategories: Set<string>;
  flyToFeatureIndex: number | null;
  onFlyComplete: () => void;
}

// Gurugram center coordinates
const GURUGRAM_CENTER: [number, number] = [28.4595, 77.0266];
const DEFAULT_ZOOM = 12;

export function LeafletMap({
  data,
  boundaryData,
  activeCategories,
  flyToFeatureIndex,
  onFlyComplete,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: GURUGRAM_CENTER,
      zoom: DEFAULT_ZOOM,
      preferCanvas: true, // Canvas rendering for performance
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render boundary
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !boundaryData) return;

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
    }

    boundaryLayerRef.current = L.geoJSON(boundaryData as any, {
      style: {
        color: '#ef4444',
        weight: 3,
        dashArray: '10 6',
        fillOpacity: 0,
        opacity: 0.8,
      },
    }).addTo(map);

    // Fit map to boundary
    const bounds = boundaryLayerRef.current.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [boundaryData]);

  // Render GeoJSON features filtered by active categories
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const filteredFeatures = data.features.filter((f) => {
      const cat = getFeatureCategory(f.properties);
      return activeCategories.has(cat);
    });

    const filteredData: GeoJsonData = {
      type: 'FeatureCollection',
      features: filteredFeatures,
    };

    geoJsonLayerRef.current = L.geoJSON(filteredData as any, {
      style: (feature) => {
        if (!feature) return {};
        const cat = getFeatureCategory(feature.properties);
        const color = getCategoryColor(cat);
        return {
          color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.4,
          opacity: 0.8,
        };
      },
      pointToLayer: (feature, latlng) => {
        const cat = getFeatureCategory(feature.properties);
        const color = getCategoryColor(cat);
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: color,
          color: color,
          weight: 1,
          fillOpacity: 0.7,
        });
      },
      onEachFeature: (feature, layer) => {
        const cat = getFeatureCategory(feature.properties);
        const name = getFeatureName(feature.properties);

        // Tooltip on hover
        const tooltipContent = name
          ? `<strong>${cat}</strong><br/>${name}`
          : `<strong>${cat}</strong>`;

        layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'map-tooltip',
        });

        // Highlight on hover
        layer.on('mouseover', () => {
          if ((layer as any).setStyle) {
            (layer as any).setStyle({
              weight: 3,
              fillOpacity: 0.7,
            });
          }
        });

        layer.on('mouseout', () => {
          geoJsonLayerRef.current?.resetStyle(layer);
        });

        // Popup on click with all properties
        const popupContent = Object.entries(feature.properties || {})
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => `<b>${k}:</b> ${v}`)
          .join('<br/>');

        layer.bindPopup(
          `<div style="max-height:200px;overflow-y:auto;font-size:12px">${popupContent}</div>`,
          { maxWidth: 300 }
        );
      },
    }).addTo(map);
  }, [data, activeCategories]);

  // Fly to feature when search result selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data || flyToFeatureIndex === null) return;

    const feature = data.features[flyToFeatureIndex];
    if (!feature) return;

    try {
      const tempLayer = L.geoJSON(feature as any);
      const bounds = tempLayer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { maxZoom: 17, padding: [50, 50] });
      }
    } catch (e) {
      console.warn('Could not fly to feature:', e);
    }

    onFlyComplete();
  }, [flyToFeatureIndex, data, onFlyComplete]);

  return (
    <div ref={mapContainerRef} className="h-full w-full" />
  );
}
