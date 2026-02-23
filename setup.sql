-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Users table (simple for now)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Locations table to store extracted photo metadata
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    photo_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location geometry(Point, 4326) NOT NULL, -- SRID 4326 is standard GPS coord format WGS84
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index to speed up location-based queries
CREATE INDEX IF NOT EXISTS locations_gix ON public.locations USING GIST (location);
-- Create an index to speed up time-based queries
CREATE INDEX IF NOT EXISTS locations_time_idx ON public.locations (photo_timestamp);

-- Function to find intersections between two users
-- Inputs: User 1 ID, User 2 ID, Distance in meters (e.g. 1609 for 1 mile), Time interval in minutes
CREATE OR REPLACE FUNCTION find_intersections(
    user1_id UUID,
    user2_id UUID,
    distance_meters FLOAT,
    time_window_minutes INT
)
RETURNS TABLE (
    user1_loc_id UUID,
    user2_loc_id UUID,
    intersect_time TIMESTAMP WITH TIME ZONE,
    distance FLOAT,
    intersect_point JSON
)
LANGUAGE sql
AS $$
    SELECT 
        l1.id AS user1_loc_id,
        l2.id AS user2_loc_id,
        l1.photo_timestamp AS intersect_time,
        ST_Distance(l1.location::geography, l2.location::geography) AS distance,
        ST_AsGeoJSON(l1.location)::JSON AS intersect_point
    FROM 
        public.locations l1
    JOIN 
        public.locations l2 
    ON 
        l1.user_id = user1_id 
        AND l2.user_id = user2_id
        -- Geographic condition: Using ST_DWithin with geography type automatically handles meters calculation
        AND ST_DWithin(l1.location::geography, l2.location::geography, distance_meters)
        -- Time condition: Absolute difference in timestamps is within the given window
        AND ABS(EXTRACT(EPOCH FROM (l1.photo_timestamp - l2.photo_timestamp))) / 60 <= time_window_minutes
    ORDER BY
        l1.photo_timestamp ASC;
$$;
