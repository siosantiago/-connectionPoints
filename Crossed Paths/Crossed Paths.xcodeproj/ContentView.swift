import SwiftUI
import MapKit

struct ContentView: View {
    @StateObject private var service = CrossedPathsService()
    @State private var position: MapCameraPosition = .automatic
    
    // Example IDs - Replace with real UUIDs from your 'users' table
    let myId = UUID(uuidString: "YOUR-USER-UUID-HERE") ?? UUID()
    let partnerId = UUID(uuidString: "PARTNER-USER-UUID-HERE") ?? UUID()

    var body: some View {
        ZStack {
            Map(position: $position) {
                ForEach(service.intersections) { item in
                    Annotation("Crossed Path", coordinate: item.coordinate) {
                        ZStack {
                            Circle()
                                .fill(Color.pink)
                                .frame(width: 30, height: 30)
                            
                            Image(systemName: "person.2.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 15, height: 15)
                                .foregroundColor(.white)
                        }
                        .padding(4)
                        .background(Circle().fill(.white))
                        .shadow(radius: 4)
                    }
                }
            }
            .mapStyle(.standard(elevation: .realistic))
            .ignoresSafeArea()
            
            VStack {
                Spacer()
                
                VStack(spacing: 16) {
                    if service.isSyncing {
                        VStack {
                            ProgressView()
                                .controlSize(.large)
                            Text("Scanning Photos...")
                                .font(.caption)
                                .padding(.top, 4)
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)
                    } else {
                        Button(action: {
                            Task {
                                do {
                                    try await service.syncPhotos(userId: myId)
                                    try await service.fetchIntersections(user1: myId, user2: partnerId)
                                } catch {
                                    print("Sync failed: \(error.localizedDescription)")
                                }
                            }
                        }) {
                            HStack {
                                Image(systemName: "location.magnifyingglass")
                                Text("Find Intersections")
                            }
                            .bold()
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .padding(.horizontal, 30)
                    }
                }
                .padding(.bottom, 50)
            }
        }
    }
}
