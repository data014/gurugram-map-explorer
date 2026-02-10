import { useState, useCallback, useMemo } from 'react';
import { useGeoJsonData, getFeatureCategory, getFeatureName } from '@/hooks/useGeoJsonData';
import { MapSidebar } from '@/components/map/MapSidebar';
import { LeafletMap } from '@/components/map/LeafletMap';

const Index = () => {
  const { data, boundaryData, categories, loading, error } = useGeoJsonData();
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [flyToIndex, setFlyToIndex] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<
    { name: string; category: string; index: number }[]
  >([]);

  // Initialize active categories when data loads
  useState(() => {
    if (categories.length > 0 && activeCategories.size === 0) {
      setActiveCategories(new Set(categories));
    }
  });

  // Update active categories when categories change
  useMemo(() => {
    if (categories.length > 0 && activeCategories.size === 0) {
      setActiveCategories(new Set(categories));
    }
  }, [categories]);

  const handleToggleCategory = useCallback((cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setActiveCategories(new Set(categories));
  }, [categories]);

  const handleDeselectAll = useCallback(() => {
    setActiveCategories(new Set());
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim() || !data?.features) {
        setSearchResults([]);
        return;
      }

      const q = query.toLowerCase();
      const results: { name: string; category: string; index: number }[] = [];

      data.features.forEach((f, i) => {
        const name = getFeatureName(f.properties);
        const cat = getFeatureCategory(f.properties);
        if (
          name.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        ) {
          results.push({ name: name || cat, category: cat, index: i });
        }
        if (results.length >= 50) return;
      });

      setSearchResults(results);
    },
    [data]
  );

  const handleSelectResult = useCallback((index: number) => {
    setFlyToIndex(index);
  }, []);

  const handleFlyComplete = useCallback(() => {
    setFlyToIndex(null);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - 25% */}
      <div className="h-full w-1/4 min-w-[280px] max-w-[400px] shrink-0 border-r border-border">
        <MapSidebar
          categories={categories}
          activeCategories={activeCategories}
          onToggleCategory={handleToggleCategory}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          searchResults={searchResults}
          onSearch={handleSearch}
          onSelectResult={handleSelectResult}
          loading={loading}
          error={error}
        />
      </div>

      {/* Map - 75% */}
      <div className="h-full flex-1">
        <LeafletMap
          data={data}
          boundaryData={boundaryData}
          activeCategories={activeCategories}
          flyToFeatureIndex={flyToIndex}
          onFlyComplete={handleFlyComplete}
        />
      </div>
    </div>
  );
};

export default Index;
