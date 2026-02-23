import Foundation
import CoreLocation

// Matches the 'public.locations' table from setup.sql
struct PhotoLocation: Encodable {
    let user_id: UUID
    let photo_timestamp: Date
    let location: String // Formatted as "POINT(longitude latitude)" for PostGIS
}

// Matches the return structure of your SQL 'find_intersections' function
struct IntersectionResult: Decodable, Identifiable {
    var id: UUID { user1_loc_id }
    let user1_loc_id: UUID
    let user2_loc_id: UUID
    let intersect_time: Date
    let distance: Double
    let intersect_point: GeoJSONPoint
    
    var coordinate: CLLocationCoordinate2D {
        intersect_point.coordinate
    }
}

struct GeoJSONPoint: Decodable {
    let type: String
    let coordinates: [Double] // [longitude, latitude]
    
    var coordinate: CLLocationCoordinate2D {
        // PostGIS ST_AsGeoJSON returns [longitude, latitude]
        guard coordinates.count >= 2 else {
            return CLLocationCoordinate2D(latitude: 0, longitude: 0)
        }
        return CLLocationCoordinate2D(latitude: coordinates[1], longitude: coordinates[0])
    }
}

// Helper for RPC parameters
struct IntersectionParams: Encodable {
    let user1_id: UUID
    let user2_id: UUID
    let distance_meters: Double
    let time_window_minutes: Int
}
