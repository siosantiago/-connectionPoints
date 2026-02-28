import Foundation
import CoreLocation

// Matches the 'public.locations' table
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
        CLLocationCoordinate2D(latitude: coordinates[1], longitude: coordinates[0])
    }
}
