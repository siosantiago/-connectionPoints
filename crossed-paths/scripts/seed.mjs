import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const USER_1 = "d1b5a5ef-2e8c-4a34-b258-000000000001";
const USER_2 = "d1b5a5ef-2e8c-4a34-b258-000000000002";

async function main() {
    console.log("Seeding mock data...");

    // 1. Create Users
    console.log("Creating users...");
    await supabase.from('users').upsert([
        { id: USER_1, name: "Santiago" },
        { id: USER_2, name: "Girlfriend" }
    ]);

    // 2. Clear old test locations for these users
    await supabase.from('locations').delete().in('user_id', [USER_1, USER_2]);

    // 3. Generate Mock Data Locations
    // We will generate some non-intersecting points and some intersecting points
    const locations = [];

    // --- INTERSECTION 1: Dolores Park, San Francisco ---
    // User 1
    locations.push({
        user_id: USER_1,
        photo_timestamp: new Date('2024-05-10T14:30:00Z').toISOString(),
        location: `SRID=4326;POINT(-122.4272 37.7597)` // Dolores Park
    });
    // User 2 (same place, 15 minutes later)
    locations.push({
        user_id: USER_2,
        photo_timestamp: new Date('2024-05-10T14:45:00Z').toISOString(),
        location: `SRID=4326;POINT(-122.4275 37.7595)` // Dolores Park
    });

    // --- INTERSECTION 2: Yosemite Valley ---
    locations.push({
        user_id: USER_1,
        photo_timestamp: new Date('2023-08-20T09:00:00Z').toISOString(),
        location: `SRID=4326;POINT(-119.5936 37.7456)`
    });
    locations.push({
        user_id: USER_2,
        photo_timestamp: new Date('2023-08-20T09:55:00Z').toISOString(),
        location: `SRID=4326;POINT(-119.5930 37.7450)` // Same morning
    });

    // --- NON-INTERSECTING POINTS (Different times/places) ---
    // User 1 only
    locations.push({
        user_id: USER_1,
        photo_timestamp: new Date('2023-01-01T12:00:00Z').toISOString(),
        location: `SRID=4326;POINT(-74.0060 40.7128)` // New York
    });
    // User 2 only
    locations.push({
        user_id: USER_2,
        photo_timestamp: new Date('2023-01-01T12:00:00Z').toISOString(),
        location: `SRID=4326;POINT(-118.2437 34.0522)` // LA
    });

    // --- RANDOM SPRINKLE ---
    for (let i = 0; i < 50; i++) {
        // User 1 random points in California
        locations.push({
            user_id: USER_1,
            photo_timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            location: `SRID=4326;POINT(${-(114 + Math.random() * 8)} ${32 + Math.random() * 8})`
        });
        // User 2 random points in California
        locations.push({
            user_id: USER_2,
            photo_timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            location: `SRID=4326;POINT(${-(114 + Math.random() * 8)} ${32 + Math.random() * 8})`
        });
    }

    console.log(`Inserting ${locations.length} location records...`);
    const { error } = await supabase.from('locations').insert(locations);

    if (error) {
        console.error("Error inserting locations:", error);
    } else {
        console.log("Mock data inserted successfully!");
    }
}

main().catch(console.error);
