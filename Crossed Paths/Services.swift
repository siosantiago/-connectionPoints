import Photos
import Supabase
import Foundation

class CrossedPathsService: ObservableObject {
    @Published var intersections: [IntersectionResult] = []
    @Published var isSyncing = false
    
    // Replace with your actual Supabase credentials
    let client = SupabaseClient(
        supabaseURL: URL(string: "https://your-project.supabase.co")!,
        supabaseKey: "your-anon-key"
    )
    
    func syncPhotos(userId: UUID) async throws {
        DispatchQueue.main.async { self.isSyncing = true }
        defer { DispatchQueue.main.async { self.isSyncing = false } }
        
        // 1. Request Photo Library Access
        let status = await PHPhotoLibrary.requestAuthorization(for: .readOnly)
        guard status == .authorized || status == .limited else {
            throw NSError(domain: "App", code: 401, userInfo: [NSLocalizedDescriptionKey: "Photo access denied"])
        }
        
        // 2. Fetch Assets with Location
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
        
        // 3. Batch Upload to Supabase
        // We chunk the upload to avoid large payload limits
        let chunkSize = 500
        for i in stride(from: 0, to: locationRecords.count, by: chunkSize) {
            let end = min(i + chunkSize, locationRecords.count)
            let chunk = Array(locationRecords[i..<end])
            
            try await client.database
                .from("locations")
                .insert(chunk)
                .execute()
        }
    }
    
    func fetchIntersections(user1: UUID, user2: UUID) async throws {
        let params: [String: Any] = [
            "user1_id": user1.uuidString,
            "user2_id": user2.uuidString,
            "distance_meters": 50.0, // Configurable distance
            "time_window_minutes": 60 // Configurable time
        ]
        
        let results: [IntersectionResult] = try await client.database
            .rpc("find_intersections", params: params)
            .execute()
            .value
        
        DispatchQueue.main.async {
            self.intersections = results
        }
    }
}
