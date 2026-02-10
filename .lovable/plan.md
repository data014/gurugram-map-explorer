

# Gurugram Object Segmentation Map

A React + Leaflet interactive map platform for visualizing and exploring OSM objects in Gurugram by category.

## Architecture Approach
Since the GeoJSON file is ~40MB, we'll use **Supabase Storage** (via Lovable Cloud) to host the file and stream it to the frontend. The map will use **react-leaflet** with performance optimizations for large datasets.

---

## Page 1: Main Map View (single-page app)

### Left Sidebar (25% width)
- **App title/logo** at the top ("Gurugram Map Explorer")
- **Search bar** to search for locations within the city (geocoding within city bounds)
- **Category Filters** section with checkboxes for each class type (park, school, building, road, watershed, etc.) with a "Select All / Deselect All" toggle
- **Legend** showing color coding for each category
- Active filter count indicator

### Main Map Area (75% width)
- **Leaflet map** centered on Gurugram with OpenStreetMap tiles
- **City boundary** rendered from `city_boundary.geojson` as a dashed outline
- **GeoJSON objects** rendered with distinct colors per category (parks = green, schools = blue, roads = gray, etc.)
- **Hover interaction**: tooltip showing class name and object name on hover, with highlight effect
- **Click interaction**: popup with detailed object properties
- Zoom controls and fullscreen toggle

---

## Key Features

1. **Performance Handling for 40MB file**
   - Load GeoJSON from Supabase Storage
   - Use canvas rendering instead of SVG for better performance with many features
   - Lazy-load and cluster features at low zoom levels

2. **Category Filtering**
   - Checkbox-based filter in sidebar
   - Instant map update when toggling categories
   - Dynamic category extraction from GeoJSON properties

3. **Search**
   - Text search to find specific objects by name within the dataset
   - Pan and zoom to matched result on selection

4. **Hover Tooltips**
   - Show class/category name on hover
   - Highlight the hovered feature with a border effect

5. **Responsive color-coded styling**
   - Each category gets a unique, distinguishable color
   - Consistent colors between map features and sidebar legend

---

## Data Flow
1. Upload GeoJSON files to Supabase Storage
2. App fetches files on load, parses categories
3. Sidebar filters control which features render on the map
4. All interactions (hover, search, filter) happen client-side for speed

