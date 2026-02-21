# Crossed Paths

A privacy-focused web application that helps you and a loved one discover if your paths ever crossed before you met. By analyzing the location metadata (GPS) from your old photos, the app visually plots out temporal and geographic overlaps onto a personalized heatmap.

## Features
- **Client-side EXIF Parsing:** Extracts GPS data (`latitude`, `longitude`, `timestamp`) directly inside your browser. Your huge image files are *never* uploaded to our servers, saving bandwidth and entirely protecting your privacy.
- **PostGIS Spatial Queries:** Securely stores timestamped coordinates and calculates highly-performant geographic intersections based on configurable distance and time windows.
- **Mapbox Visualizations:** Renders overlapping events using Mapbox GL JS on a modern dark-mode map style.
- **Reverse Geocoding:** Automatically translates GPS coordinates into readable place names (e.g. "Dolores Park, San Francisco").

## Architecture Stack
- **Frontend Framework:** Next.js (App Router), React, TailwindCSS
- **Database:** Supabase PostgreSQL with PostGIS extension enabled
- **Map / Geocoding:** Mapbox GL JS and Mapbox Search API
- **EXIF Extraction:** `exifr`

## Setup & Running Locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   Ensure you have a Supabase project created. Run the contents of `../setup.sql` in your Supabase SQL Editor. This initializes the tables, enables the `postgis` extension, and generates the `find_intersections` RPC function.

3. **Environment Variables**
   Create a `.env.local` file at the root of the project with the following keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Drag and drop your Google Photos into the respective upload boxes to map your history.

## Roadmap
- Integrate Supabase Storage/IndexedDB to preview the actual overlapping photos on the timeline.
- Configurable distance and time window ranges directly from the UI.
- Support scaling beyond the prototype phase with user authentication.
