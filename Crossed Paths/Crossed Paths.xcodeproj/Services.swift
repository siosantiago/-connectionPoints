import SwiftUI
import Photos
import CoreLocation
import Supabase

@MainActor
class CrossedPathsService: ObservableObject {
    @Published var intersections: [IntersectionResult] = []
    @Published var isSyncing = false
    
    // Replace with your actual Supabase credentials
    let client = SupabaseClient(
        supabaseURL: URL(string: "https://your-project.supabase.co")!,
        supabaseKey: "your-anon-key"
    )
    
    func syncPhotos(userId: UUID) async throws {
        isSyncing = true
        defer { isSyncing = false }
        
        let status = await PHPhotoLibrary.requestAuthorization(for: .readOnly)
        guard status == .authorized || status == .limited else {
            throw NSError(domain: "App", code: 401, userInfo: [NSLocalizedDescriptionKey: "Photo access denied"])
        }
        
        let options = PHFetchOptions()
        options.predicate = NSPredicate(format: "location != nil")
        let assets = PHAsset.fetchAssets(with: .image, options: options)
        
        var locationRecords: [PhotoLocation] = []
        
        assets.enumerateObjects { (asset, _, _) in
            if let loc = asset.location, let date = asset.creationDate {
                let wkt = "POINT(\(loc.coordinate.longitude) \(loc.coordinate.latitude))"
                locationRecords.append(PhotoLocation(
                    user_id: userId,
                    photo_timestamp: date,
                    location: wkt
                ))
            }
        }
        
        let chunkSize = 500
        for i in stride(from: 0, to: locationRecords.count, by: chunkSize) {
            let end = min(i + chunkSize, locationRecords.count)
            let chunk = Array(locationRecords[i..<end])
            
            try await client
                .from("locations")
                .insert(chunk)
                .execute()
        }
    }
    
    func fetchIntersections(user1: UUID, user2: UUID) async throws {
        let params = IntersectionParams(
            user1_id: user1,
            user2_id: user2,
            distance_meters: 100.0,
            time_window_minutes: 120
        )
        
        let response = try await client
            .rpc("find_intersections", params: params)
            .execute()
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let results = try decoder.decode([IntersectionResult].self, from: response.data)
        
        self.intersections = results
    }
}
