//
//  ContentView.swift
//  Crossed Paths
//
//  Created by Santiago Jaramillo Franzoni on 2/23/26.
//

import SwiftUI
import MapKit


struct ContentView: View {
    @StateObject private var service = CrossedPathsService()
    @State private var position: MapCameraPosition = .automatic
    
    // NOTE: Replace these with real UUIDs from your Supabase 'users' table.
    // In a real app, these would come from your Auth session or a QR scan.
    let myId = UUID(uuidString: "00000000-0000-0000-0000-000000000000")! 
    let partnerId = UUID(uuidString: "11111111-1111-1111-1111-111111111111")!

    var body: some View {
        ZStack {
            // Using the modern iOS 17+ Map API to show the map immediately
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
            
            // Progress overlay for background processing when the app opens
            if service.isSyncing {
                VStack {
                    ProgressView()
                        .controlSize(.large)
                    Text("Scanning photos & finding paths...")
                        .font(.caption)
                        .padding(.top, 4)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(12)
            }
        }
        .task {
            // Automatically starts the process when the view appears
            do {
                // Ensure you have added 'Privacy - Photo Library Usage Description' to your Info.plist
                try await service.syncPhotos(userId: myId)
                try await service.fetchIntersections(user1: myId, user2: partnerId)
            } catch {
                print("Initialization error: \(error.localizedDescription)")
            }
        }
    }
}

#Preview {
    ContentView()
}
