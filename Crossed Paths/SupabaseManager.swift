import Foundation
import Supabase

class SupabaseManager {
    // You would initialize this with the keys from your .env.local
    let client = SupabaseClient(supabaseURL: URL(string: "YOUR_URL")!, supabaseKey: "YOUR_ANON_KEY")
    
    func uploadLocations(_ locations: [PhotoLocation]) async throws {
        // Batch insert to 'locations' table
        try await client.database
            .from("locations")
            .insert(locations)
            .execute()
    }
    
    func findIntersections(user1: UUID, user2: UUID, distance: Double, timeWindow: Int) async throws -> [IntersectionResult] {
        let params: [String: Any] = [
            "user1_id": user1.uuidString,
            "user2_id": user2.uuidString,
            "distance_meters": distance,
            "time_window_minutes": timeWindow
        ]
        
        let response: [IntersectionResult] = try await client.database
            .rpc("find_intersections", params: params)
            .execute()
            .value
            
        return response
    }
}
