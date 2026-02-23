import SwiftUI
import MapKit

struct ContentView: View {
    @StateObject private var service = CrossedPathsService()
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194), // Default SF
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    
    // Example IDs - in a real app, these come from your Auth system or a QR scan
    let myId = UUID(uuidString: "YOUR-USER-UUID-HERE")!
    let partnerId = UUID(uuidString: "PARTNER-USER-UUID-HERE")!

    var body: some View {
        ZStack {
            Map(coordinateRegion: $region, annotationItems: service.intersections) { item in
                MapAnnotation(coordinate: item.coordinate) {
                    Circle()
                        .fill(Color.pink)
                        .frame(width: 15, height: 15)
                        .overlay(Circle().stroke(Color.white, lineWidth: 2))
                        .shadow(radius: 3)
                }
            }
            .ignoresSafeArea()
            
            VStack {
                Spacer()
                
                VStack(spacing: 16) {
                    if service.isSyncing {
                        ProgressView("Scanning Photos...")
                            .padding()
                            .background(.ultraThinMaterial)
                            .cornerRadius(12)
                    } else {
                        Button(action: {
                            Task {
                                try? await service.syncPhotos(userId: myId)
                                try? await service.fetchIntersections(user1: myId, user2: partnerId)
                            }
                        }) {
                            Text("Scan & Find Crossings")
                                .bold()
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                }
                .padding(30)
            }
        }
    }
}
