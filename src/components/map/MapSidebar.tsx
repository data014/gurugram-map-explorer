import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { getCategoryColor } from '@/lib/categoryColors';

interface SearchResult {
  name: string;
  category: string;
  index: number;
}

interface MapSidebarProps {
  categories: string[];
  activeCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  searchResults: SearchResult[];
  onSearch: (query: string) => void;
  onSelectResult: (index: number) => void;
  loading: boolean;
  error: string | null;
}

export function MapSidebar({
  categories,
  activeCategories,
  onToggleCategory,
  onSelectAll,
  onDeselectAll,
  searchResults,
  onSearch,
  onSelectResult,
  loading,
  error,
}: MapSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const allSelected = categories.length > 0 && activeCategories.size === categories.length;

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-sidebar-primary" />
          <h1 className="text-lg font-bold text-sidebar-foreground">Gurugram Map Explorer</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">OSM Object Segmentation</p>
      </div>

      {/* Search */}
      <div className="border-b border-sidebar-border p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-background text-foreground"
          />
        </div>
        {searchQuery && searchResults.length > 0 && (
          <ScrollArea className="mt-2 max-h-40">
            <div className="space-y-1">
              {searchResults.slice(0, 20).map((result, i) => (
                <button
                  key={i}
                  onClick={() => onSelectResult(result.index)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-sidebar-accent"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getCategoryColor(result.category) }}
                  />
                  <span className="truncate font-medium">{result.name}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">{result.category}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
        {searchQuery && searchResults.length === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">No results found</p>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-2">
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Categories</span>
          <span className="rounded-full bg-sidebar-accent px-1.5 text-xs">
            {activeCategories.size}/{categories.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {/* Category List */}
      <ScrollArea className="flex-1 px-4 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading data...</span>
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-sidebar-accent"
              >
                <Checkbox
                  checked={activeCategories.has(cat)}
                  onCheckedChange={() => onToggleCategory(cat)}
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: getCategoryColor(cat) }}
                />
                <span className="truncate text-sm capitalize">{cat.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <p className="text-center text-xs text-muted-foreground">
          Hover over map features to see class names
        </p>
      </div>
    </div>
  );
}
