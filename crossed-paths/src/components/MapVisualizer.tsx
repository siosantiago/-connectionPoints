'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';

// Provide your access token in an env variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MapVisualizer({ user1, user2 }: { user1: string; user2: string }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    const [intersections, setIntersections] = useState<any[]>([]);
    const [places, setPlaces] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Example hardcoded distance & time config 
    // In a full app, these would be toggleable sliders in the UI
    const distance = 1609; // 1 mile in meters
    const timeWindow = 120; // 2 hours in minutes

    // Fetch Intersections using the Supabase RPC we made
    const fetchIntersections = async () => {
        if (!user1 || !user2) return;

        setLoading(true);
        // Call the Postgres function securely via Supabase RPC
        const { data, error } = await supabase.rpc('find_intersections', {
            user1_id: user1,
            user2_id: user2,
            distance_meters: distance,
            time_window_minutes: timeWindow
        });

        if (error) {
            console.error("Error finding intersections", error);
        } else if (data) {
            setIntersections(data);

            // Reverse geocode the places
            const newPlaces: Record<string, string> = {};
            for (const item of data) {
                const [lng, lat] = item.intersect_point.coordinates;
                const coordKey = `${lng},${lat}`;
                if (!newPlaces[coordKey]) {
                    try {
                        const res = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${mapboxgl.accessToken}`);
                        const geoData = await res.json();
                        if (geoData.features && geoData.features.length > 0) {
                            newPlaces[coordKey] = geoData.features[0].properties.full_address || geoData.features[0].properties.place_formatted || "Unknown Location";
                        }
                    } catch (err) {
                        console.error("Geocoding failed", err);
                    }
                }
            }
            setPlaces(newPlaces);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!map.current && mapContainer.current) {
            // Initialize map with a dark, premium aesthetic
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11', // Very close to the screenshot
                center: [-119.4179, 36.7783], // Default center (California roughly)
                zoom: 5
            });

            map.current.on('load', () => {
                // Add source for heatmap data
                map.current?.addSource('intersections', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [] // Start empty
                    }
                });

                // Add Heatmap Layer
                map.current?.addLayer({
                    id: 'intersections-heat',
                    type: 'heatmap',
                    source: 'intersections',
                    maxzoom: 15,
                    paint: {
                        // Increase weight based on frequency 
                        'heatmap-weight': 1,
                        // Color ramp (matches photo)
                        'heatmap-color': [
                            'interpolate',
                            ['linear'],
                            ['heatmap-density'],
                            0, 'rgba(33,102,172,0)',
                            0.2, 'rgb(103,169,207)',
                            0.4, 'rgb(209,229,240)',
                            0.6, 'rgb(253,219,199)',
                            0.8, 'rgb(239,138,98)',
                            1, 'rgb(178,24,43)'
                        ],
                        'heatmap-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0, 2,
                            9, 20
                        ],
                        'heatmap-opacity': 0.8
                    }
                });
            });
        }

        fetchIntersections();
    }, [user1, user2]);

    // Update map when data comes in
    useEffect(() => {
        if (map.current && intersections.length > 0) {
            const source = map.current.getSource('intersections') as mapboxgl.GeoJSONSource;
            if (source) {
                const geojsonData = {
                    type: 'FeatureCollection',
                    features: intersections.map(item => ({
                        type: 'Feature',
                        properties: {
                            time: item.intersect_time,
                            distance: item.distance
                        },
                        geometry: item.intersect_point // This is valid GeoJSON from PostGIS
                    }))
                };
                source.setData(geojsonData as any);

                // Auto-fit bounds if we have points
                const bounds = new mapboxgl.LngLatBounds();
                intersections.forEach(item => {
                    bounds.extend(item.intersect_point.coordinates);
                });
                map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
            }
        }
    }, [intersections]);


    return (
        <div className="flex flex-col w-full h-full space-y-8">
            <div className="flex flex-col w-full h-full space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Your Map</h2>
                    {loading && <div className="text-sm font-medium animate-pulse text-emerald-400">Analyzing temporal overlaps...</div>}
                </div>

                <div className="relative w-full overflow-hidden border border-zinc-800 rounded-3xl h-[600px] shadow-2xl">
                    <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

                    {/* Overlay Stats matching user photo reference */}
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="flex flex-col items-center justify-center space-y-1">
                            <div className="w-12 h-1 mb-2 rounded-full bg-zinc-600"></div>
                            <p className="text-xl text-white font-semibold">
                                {intersections.length} overlapping moments
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Intersections */}
            {intersections.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Where you crossed paths</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {intersections.map((item, idx) => {
                            const [lng, lat] = item.intersect_point.coordinates;
                            const placeName = places[`${lng},${lat}`] || "Loading place name...";
                            const date = new Date(item.intersect_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                            const time = new Date(item.intersect_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-white font-medium">{placeName}</p>
                                            <p className="text-zinc-400 text-sm">{date} at {time}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
