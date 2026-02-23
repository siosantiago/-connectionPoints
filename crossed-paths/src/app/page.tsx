'use client';

import PhotoUploader from '@/components/PhotoUploader';
import MapVisualizer from '@/components/MapVisualizer';
import HowToDownload from '@/components/HowToDownload';
import { useState } from 'react';

export default function Home() {
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  // Hardcoded test users for the prototype
  // In a real app, you'd use NextAuth/Supabase Auth to login 
  // User 1 = Santiago, User 2 = Girlfriend
  const USER_1 = "d1b5a5ef-2e8c-4a34-b258-000000000001";
  const USER_2 = "d1b5a5ef-2e8c-4a34-b258-000000000002";

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-8">

      {/* Header */}
      <div className="w-full max-w-5xl px-4 py-8 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 text-center">
          Crossed Paths
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl text-center max-w-2xl font-light">
          Upload your photos to discover the exact moments and places where your histories overlapped before you even knew each other.
        </p>

        <button
          onClick={() => setIsHowToOpen(true)}
          className="mt-8 px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-sm transition-all border border-zinc-700 shadow-sm flex items-center space-x-2"
        >
          <span>How do I get my photos?</span>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs">?</span>
        </button>
      </div>

      <div className="w-full max-w-5xl px-4 space-y-12">

        {/* Upload Section - Two Users */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <h2 className="text-2xl font-semibold text-white border-b border-zinc-800 pb-4">
            1. Load Your Histories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg text-blue-400 font-medium">User 1 Photos</h3>
              <PhotoUploader
                userId={USER_1}
                onUploadComplete={() => console.log("User 1 ready")}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg text-emerald-400 font-medium">User 2 Photos</h3>
              <PhotoUploader
                userId={USER_2}
                onUploadComplete={() => console.log("User 2 ready")}
              />
            </div>
          </div>
        </section>

        {/* Visualization Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <MapVisualizer user1={USER_1} user2={USER_2} />
        </section>

      </div>

      <HowToDownload isOpen={isHowToOpen} onClose={() => setIsHowToOpen(false)} />
    </main>
  );
}
