import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: any;
  properties: Record<string, any>;
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export function useGeoJsonData() {
  const [data, setData] = useState<GeoJsonData | null>(null);
  const [boundaryData, setBoundaryData] = useState<GeoJsonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch OSM objects GeoJSON
        const { data: osmData } = supabase.storage
          .from('geojson')
          .getPublicUrl('osm_objects.geojson');

        const { data: boundaryUrl } = supabase.storage
          .from('geojson')
          .getPublicUrl('city_boundary.geojson');

        const [osmResponse, boundaryResponse] = await Promise.all([
          fetch(osmData.publicUrl),
          fetch(boundaryUrl.publicUrl),
        ]);

        if (osmResponse.ok) {
          const osmJson = await osmResponse.json();
          setData(osmJson);
        } else {
          // Use demo data if no file uploaded yet
          setData({ type: 'FeatureCollection', features: [] });
          setError('GeoJSON files not found in storage. Please upload your files.');
        }

        if (boundaryResponse.ok) {
          const boundaryJson = await boundaryResponse.json();
          setBoundaryData(boundaryJson);
        }
      } catch (err) {
        console.error('Error fetching GeoJSON:', err);
        setError('Failed to load GeoJSON data. Please upload files to storage.');
        setData({ type: 'FeatureCollection', features: [] });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Extract unique categories from data
  const categories = useMemo(() => {
    if (!data?.features?.length) return [];
    const cats = new Set<string>();
    data.features.forEach((f) => {
      // Try common property keys for category
      const cat =
        f.properties?.class ||
        f.properties?.category ||
        f.properties?.type ||
        f.properties?.landuse ||
        f.properties?.amenity ||
        f.properties?.building ||
        f.properties?.natural ||
        f.properties?.leisure ||
        f.properties?.highway ||
        f.properties?.waterway ||
        'other';
      if (typeof cat === 'string') cats.add(cat);
      else cats.add('other');
    });
    return Array.from(cats).sort();
  }, [data]);

  return { data, boundaryData, categories, loading, error };
}

export function getFeatureCategory(properties: Record<string, any>): string {
  return (
    properties?.class ||
    properties?.category ||
    properties?.type ||
    properties?.landuse ||
    properties?.amenity ||
    properties?.building ||
    properties?.natural ||
    properties?.leisure ||
    properties?.highway ||
    properties?.waterway ||
    'other'
  );
}

export function getFeatureName(properties: Record<string, any>): string {
  return (
    properties?.name ||
    properties?.['name:en'] ||
    properties?.label ||
    properties?.title ||
    ''
  );
}
