import Photos
import CoreLocation

class PhotoManager: ObservableObject {
    @Published var isProcessing = false
    @Published var progress: Float = 0.0
    
    func fetchPhotoMetadata() async throws -> [PhotoLocation] {
        // 1. Request Permission
        let status = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
        guard status == .authorized || status == .limited else {
            throw NSError(domain: "PhotoManager", code: 1, userInfo: [NSLocalizedDescriptionKey: "Photo access denied"])
        }
        
        // 2. Fetch Assets with Location
        let fetchOptions = PHFetchOptions()
        // Optimization: Only fetch photos that actually have location data
        fetchOptions.predicate = NSPredicate(format: "location != nil")
        
        let assets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
        var results: [PhotoLocation] = []
        
        // In a real app, you'd get the current user's ID from Supabase Auth
        let dummyUserId = UUID() 
        
        assets.enumerateObjects { (asset, index, stop) in
            if let loc = asset.location, let date = asset.creationDate {
                // PostGIS Point format: POINT(longitude latitude)
                let wktLocation = "POINT(\(loc.coordinate.longitude) \(loc.coordinate.latitude))"
                
                results.append(PhotoLocation(
                    user_id: dummyUserId,
                    photo_timestamp: date,
                    location: wktLocation
                ))
            }
        }
        
        return results
    }
}
