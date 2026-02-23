//
//  Services.swift
//  Crossed Paths
//
//  Created by Santiago Jaramillo Franzoni on 2/23/26.
//

import SwiftUI
import Photos
import CoreLocation
import Combine
#if canImport(Supabase)
import Supabase
import Combine
#endif

@MainActor
class CrossedPathsService: ObservableObject {
    let objectWillChange = ObservableObjectPublisher()
    
    init() {}
    
    @Published var intersections: [IntersectionResult] = []
    @Published var isSyncing = false
    
#if canImport(Supabase)
    let client = SupabaseClient(
        supabaseURL: URL(string: "https://your-project.supabase.co")!,
        supabaseKey: "your-anon-key"
    )
#else
    // Fallback stub when Supabase package isn't available
    struct _UnavailableSupabaseClient {}
    let client = _UnavailableSupabaseClient()
#endif
    
    func syncPhotos(userId: UUID) async throws {
        isSyncing = true
        defer { isSyncing = false }
        
        let status = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
        guard status == .authorized || status == .limited else {
            throw NSError(domain: "App", code: 401, userInfo: [NSLocalizedDescriptionKey: "Photo access denied"])
        }
        
        let options = PHFetchOptions()
        // Sort by creation date descending to process recent photos first
        options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        let assets = PHAsset.fetchAssets(with: .image, options: options)

        var locationRecords: [PhotoLocation] = []

        assets.enumerateObjects { (asset, _, _) in
            guard let loc = asset.location, let date = asset.creationDate else { return }
            let wkt = "POINT(\(loc.coordinate.longitude) \(loc.coordinate.latitude))"
            locationRecords.append(PhotoLocation(
                user_id: userId,
                photo_timestamp: date,
                location: wkt
            ))
        }
        
#if canImport(Supabase)
        let chunkSize = 500
        for i in stride(from: 0, to: locationRecords.count, by: chunkSize) {
            let end = min(i + chunkSize, locationRecords.count)
            let chunk = Array(locationRecords[i..<end])

            try await client
                .from("locations")
                .insert(chunk)
                .execute()
        }
#else
        // Supabase package not available; provide a clear error
        throw NSError(domain: "App", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Supabase package not integrated. Add the Supabase Swift package to enable syncing."])
#endif
    }
    
    func fetchIntersections(user1: UUID, user2: UUID) async throws {
#if canImport(Supabase)
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
#else
        throw NSError(domain: "App", code: 1002, userInfo: [NSLocalizedDescriptionKey: "Supabase package not integrated. Add the Supabase Swift package to enable fetching intersections."])
#endif
    }
}

