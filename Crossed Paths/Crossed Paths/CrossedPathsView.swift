import SwiftUI
import MapKit

struct CrossedPathsView: View {
    @StateObject private var service = CrossedPathsService()
    @State private var position: MapCameraPosition = .automatic

    // Replace with real IDs from your backend/auth
    @State private var user1Id: UUID = UUID(uuidString: "00000000-0000-0000-0000-000000000000")!
    @State private var user2Id: UUID = UUID(uuidString: "11111111-1111-1111-1111-111111111111")!

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Section 1: Load Your Histories with two upload cards side by side
                VStack(alignment: .leading, spacing: 16) {
                    Text("1. Load Your Histories")
                        .font(.title.bold())
                        .foregroundStyle(.primary)

                    HStack(alignment: .top, spacing: 16) {
                        UploadCardView(title: "User 1 Photos", actionTitle: "Browse Files") {
                            runSync(for: user1Id)
                        }
                        UploadCardView(title: "User 2 Photos", actionTitle: "Browse Files") {
                            runSync(for: user2Id)
                        }
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(red: 0.15, green: 0.15, blue: 0.2))
                )

                // Section 2: Your Map
                VStack(alignment: .leading, spacing: 12) {
                    Text("Your Map")
                        .font(.title2.bold())
                        .foregroundColor(.white)
                    ZStack {
                        Map(position: $position) {
                            ForEach(service.intersections) { item in
                                Annotation("Crossed Path", coordinate: item.coordinate) {
                                    ZStack {
                                        Circle().fill(Color.pink)
                                            .frame(width: 28, height: 28)
                                        Image(systemName: "person.2.fill")
                                            .resizable()
                                            .scaledToFit()
                                            .frame(width: 14, height: 14)
                                            .foregroundStyle(.white)
                                    }
                                    .padding(3)
                                    .background(Circle().fill(.white))
                                    .shadow(radius: 3)
                                }
                            }
                        }
                        .frame(height: 320)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .overlay(alignment: .bottomLeading) {
                            if !service.intersections.isEmpty {
                                Text("\(service.intersections.count) overlapping moments")
                                    .font(.footnote.weight(.semibold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(.ultraThinMaterial, in: Capsule())
                                    .padding(12)
                            }
                        }

                        if service.isSyncing {
                            ProgressView("Scanning Photos…")
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(red: 0.15, green: 0.15, blue: 0.2))
                )

                // Section 3: Where you crossed paths (Intersections List)
                VStack(alignment: .leading, spacing: 12) {
                    Text("Where you crossed paths")
                        .font(.title2.bold())
                        .foregroundColor(.white)

                    IntersectionsListView(intersections: service.intersections)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(red: 0.12, green: 0.12, blue: 0.16))
                        )
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(red: 0.15, green: 0.15, blue: 0.2))
                )
            }
            .padding(20)
        }
        .background(Color(red: 0.1, green: 0.1, blue: 0.14))
        .navigationTitle("Crossed Paths")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await refreshAll() }
                } label: {
                    Label("Refresh", systemImage: "arrow.clockwise")
                }
            }
        }
    }

    private func runSync(for userId: UUID) {
        Task {
            do {
                try await service.syncPhotos(userId: userId)
                try await refreshIfBothSynced()
            } catch {
                print("Sync error: \(error)")
            }
        }
    }

    private func refreshIfBothSynced() async throws {
        // Simple heuristic: attempt intersections if either user has just synced.
        try await service.fetchIntersections(user1: user1Id, user2: user2Id)
    }

    private func refreshAll() async {
        do {
            try await service.fetchIntersections(user1: user1Id, user2: user2Id)
        } catch {
            print("Fetch error: \(error)")
        }
    }
}

struct UploadCardView: View {
    var title: String
    var actionTitle: String
    var action: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundColor(.white)

            // Placeholder thumbnails area
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.gray.opacity(0.3))
                .frame(height: 100)
                .overlay(
                    Text("Thumbnails")
                        .foregroundColor(.white.opacity(0.7))
                        .font(.caption)
                )

            Text("Drop your photos here\nWe extract the Time & Location (only) from your photos. Your actual photos are never uploaded or saved.")
                .font(.footnote)
                .foregroundColor(.white.opacity(0.7))

            HStack {
                Button(action: action) {
                    Label(actionTitle, systemImage: "folder")
                        .bold()
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.blue))
                        .foregroundColor(.white)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(red: 0.12, green: 0.12, blue: 0.16))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
        )
    }
}

struct IntersectionsListView: View {
    var intersections: [IntersectionResult]

    var body: some View {
        VStack(spacing: 0) {
            ForEach(intersections) { item in
                VStack(alignment: .leading, spacing: 6) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(locationTitle(for: item))
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(.white)
                            Text(dateString(item.intersect_time))
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                        }
                        Spacer()
                        Text(distanceString(item.distance))
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.white.opacity(0.15), in: Capsule())
                            .foregroundColor(.white)
                    }
                }
                .padding(12)
                .background(Color.clear)
                .overlay(alignment: .bottom) {
                    Divider().background(Color.white.opacity(0.15)).padding(.leading, 12)
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
        )
    }

    private func dateString(_ date: Date) -> String {
        let df = DateFormatter()
        df.dateStyle = .medium
        df.timeStyle = .short
        return df.string(from: date)
    }

    private func distanceString(_ meters: Double) -> String {
        if meters < 1000 { return String(format: "%.0f m", meters) }
        return String(format: "%.2f km", meters / 1000)
    }

    private func locationTitle(for item: IntersectionResult) -> String {
        // Placeholder: format from coordinates. Replace with reverse geocoding if desired.
        let lat = item.coordinate.latitude
        let lon = item.coordinate.longitude
        return String(format: "Lat %.4f, Lon %.4f", lat, lon)
    }
}

#Preview {
    NavigationStack { CrossedPathsView() }
}
