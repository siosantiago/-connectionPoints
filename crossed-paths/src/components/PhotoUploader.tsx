'use client';

import { useState, useCallback } from 'react';
import exifr from 'exifr';
import { UploadCloud, Image as ImageIcon, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper function to show a neat format of the lat/long
const formatCoord = (val: number) => val.toFixed(4);

export default function PhotoUploader({ userId, onUploadComplete }: { userId: string, onUploadComplete: () => void }) {
    const [isHovering, setIsHovering] = useState(false);
    const [processingState, setProcessingState] = useState<'idle' | 'parsing' | 'uploading' | 'done'>('idle');
    const [parsedCount, setParsedCount] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);

    const processFiles = async (files: FileList | File[]) => {
        setTotalFiles(files.length);
        setProcessingState('parsing');
        setParsedCount(0);

        const extractedData = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                // Read only the GPS & Timestamp from the EXIF header natively to save memory
                // This does NOT upload the photo anywhere, strictly reads it locally
                const exifData = await exifr.parse(file, {
                    gps: true,
                    DateTimeOriginal: true,
                    pick: ['latitude', 'longitude', 'DateTimeOriginal']
                });

                if (exifData && exifData.latitude && exifData.longitude && exifData.DateTimeOriginal) {
                    extractedData.push({
                        user_id: userId,
                        photo_timestamp: new Date(exifData.DateTimeOriginal).toISOString(),
                        // PostGIS Geometry Point is 'POINT(longitude latitude)' 
                        // Note order: Longitude first for PostGIS!
                        location: `SRID=4326;POINT(${exifData.longitude} ${exifData.latitude})`
                    });
                }
            } catch (error) {
                console.error("Failed to parse", file.name, error);
                // Ignore files that aren't photos or lack EXIF
            }
            setParsedCount(prev => prev + 1);
        }

        if (extractedData.length > 0) {
            setProcessingState('uploading');
            // Batch insert the parsed coordinates to Supabase
            const { error } = await supabase.from('locations').insert(extractedData);
            if (error) {
                console.error('Supabase upload error:', error);
                alert("Error saving locations: " + error.message);
            } else {
                setProcessingState('done');
                setTimeout(() => {
                    setProcessingState('idle');
                    onUploadComplete();
                }, 3000);
            }
        } else {
            setProcessingState('idle');
            alert("No GPS data found in those photos!");
        }
    };

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsHovering(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Drag & Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={onDrop}
                className={`relative w-full p-12 mt-8 transition-all duration-300 border-2 border-dashed rounded-3xl group
            ${isHovering
                        ? 'border-blue-400 bg-blue-500/10 scale-[1.02]'
                        : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-500'}`}
            >
                <div className="flex flex-col items-center justify-center space-y-4 text-center">

                    {processingState === 'idle' && (
                        <>
                            <div className="p-4 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                                <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-zinc-200">Drop your photos here</h3>
                                <p className="mt-2 text-sm text-zinc-400">
                                    We extract the Time & Location locally on your device.<br />
                                    <strong className="text-zinc-300">Your actual photos are never uploaded or saved.</strong>
                                </p>
                            </div>
                            <label className="px-6 py-3 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500">
                                Browse Files
                                <input type="file" multiple accept="image/jpeg, image/png, image/heic" className="hidden" onChange={(e) => e.target.files && processFiles(e.target.files)} />
                            </label>
                        </>
                    )}

                    {processingState === 'parsing' && (
                        <div className="flex flex-col items-center w-full max-w-sm space-y-4">
                            <ImageIcon className="w-8 h-8 animate-pulse text-blue-400" />
                            <h3 className="text-lg font-medium text-zinc-200">Reading Photo Metadata...</h3>
                            <div className="w-full h-2 overflow-hidden rounded-full bg-zinc-800">
                                <div
                                    className="h-full transition-all duration-300 bg-blue-500 rounded-full"
                                    style={{ width: `${(parsedCount / totalFiles) * 100}%` }}
                                />
                            </div>
                            <p className="text-sm font-mono text-zinc-400">{parsedCount} / {totalFiles}</p>
                        </div>
                    )}

                    {processingState === 'uploading' && (
                        <div className="flex flex-col items-center space-y-4">
                            <MapPin className="w-8 h-8 animate-bounce text-emerald-400" />
                            <h3 className="text-lg font-medium text-zinc-200">Saving geographic points securely...</h3>
                        </div>
                    )}

                    {processingState === 'done' && (
                        <div className="flex flex-col items-center space-y-4 text-emerald-400">
                            <CheckCircle2 className="w-12 h-12" />
                            <h3 className="text-lg font-medium">Successfully securely saved!</h3>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
