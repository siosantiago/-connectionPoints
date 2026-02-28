'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Download, MousePointer2, CheckSquare, Square, ChevronRight, ChevronLeft } from 'lucide-react';

export default function HowToDownload({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState(0);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset step when closed
            setTimeout(() => setStep(0), 300);
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Go to Google Takeout",
            description: "Visit takeout.google.com to export your Google Photos data. Make sure you are logged into your primary Google account.",
            actionText: "Open Takeout",
            actionUrl: "https://takeout.google.com/",
            visual: (
                <div className="relative w-full h-48 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 flex items-center justify-center dashboard-mockup">
                    <div className="absolute top-0 w-full h-8 bg-zinc-900 border-b border-zinc-700 flex items-center px-4 space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="ml-4 flex-1 h-5 bg-zinc-800 rounded-md text-[10px] text-zinc-400 flex items-center px-2">takeout.google.com</div>
                    </div>
                    <div className="mt-8 flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-full mb-3 flex items-center justify-center">
                            <Download className="text-white w-6 h-6" />
                        </div>
                        <div className="text-lg font-medium text-white mb-1">Google Takeout</div>
                        <div className="text-xs text-zinc-400">Export a copy of your content</div>
                    </div>
                    {/* Animated Cursor */}
                    <div className="absolute top-1/2 left-1/2 -ml-20 -mt-20 w-6 h-6 animate-[moveCursor_3s_ease-in-out_infinite]">
                        <MousePointer2 className="text-white w-5 h-5 drop-shadow-lg" fill="currentColor" />
                    </div>
                </div>
            )
        },
        {
            title: "Deselect Everything",
            description: "By default, all your Google data is selected. Click 'Deselect all' at the top of the list so you don't download gigabytes of unnecessary data.",
            visual: (
                <div className="relative w-full h-48 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 p-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
                        <div className="text-sm font-medium text-white">Select data to include</div>
                        <div className="text-xs text-blue-400 font-medium cursor-pointer relative group">
                            <span className="relative z-10 animate-pulse">Deselect all</span>
                            <div className="absolute -inset-1 bg-blue-500/20 rounded-md -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between opacity-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-zinc-700 rounded-md"></div>
                                    <div className="w-24 h-3 bg-zinc-700 rounded-md"></div>
                                </div>
                                <Square className="w-5 h-5 text-zinc-500" />
                            </div>
                        ))}
                    </div>
                    {/* Animated Cursor */}
                    <div className="absolute top-6 right-6 w-6 h-6 animate-bounce">
                        <MousePointer2 className="text-white w-5 h-5 drop-shadow-lg" fill="currentColor" />
                    </div>
                </div>
            )
        },
        {
            title: "Select Google Photos",
            description: "Scroll down the list until you find 'Google Photos' and check its box. Then scroll to the very bottom and click 'Next step'.",
            visual: (
                <div className="relative w-full h-48 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 p-4 transform translate-y-[-10px]">
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-2 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 flex items-center justify-center bg-transparent rounded-md text-3xl">🏞️</div>
                                    <div className="text-sm font-medium text-white">Google Photos</div>
                                </div>
                                <CheckSquare className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-xs text-zinc-400 pl-11">Photos and videos from Google Photos</div>
                        </div>
                        <div className="flex items-center justify-between opacity-30">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-zinc-700 rounded-md"></div>
                                <div className="w-24 h-3 bg-zinc-700 rounded-md"></div>
                            </div>
                            <Square className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div className="flex justify-end pt-2 border-t border-zinc-700 mt-2">
                            <div className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-md font-medium">Next step</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Export & Download",
            description: "Choose 'Export once', keep the file type as '.zip', and configure the file size (50GB recommended so it's fewer files). Click 'Create export'. Wait for the email, download, and extract!",
            visual: (
                <div className="relative w-full h-48 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 p-6 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-[spin_4s_linear_infinite] border-t-transparent"></div>
                        <Download className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-white font-medium">Export in progress</div>
                        <div className="text-xs text-zinc-400">Google is creating a copy of your files.</div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Download className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">How to Get Your Photos</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Visual Area */}
                    <div className="mb-8">
                        {steps[step].visual}
                    </div>

                    {/* Text Area */}
                    <div className="min-h-[120px]">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700">
                                {step + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-white">{steps[step].title}</h3>
                        </div>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            {steps[step].description}
                        </p>

                        {steps[step].actionUrl && (
                            <a
                                href={steps[step].actionUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center mt-4 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                {steps[step].actionText} <ExternalLink className="w-4 h-4 ml-1.5" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex justify-between items-center">
                    <div className="flex space-x-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === 0
                                    ? 'text-zinc-600 bg-zinc-800/50 cursor-not-allowed'
                                    : 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </button>
                        <button
                            onClick={() => {
                                if (step === steps.length - 1) {
                                    onClose();
                                } else {
                                    setStep(Math.min(steps.length - 1, step + 1));
                                }
                            }}
                            className="flex items-center px-4 py-2 bg-white text-black hover:bg-blue-50 rounded-full text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] focus:ring-2 focus:ring-white/50"
                        >
                            {step === steps.length - 1 ? 'Got it!' : 'Next'}
                            {step !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes moveCursor {
                    0% { transform: translate(0, 0); }
                    50% { transform: translate(40px, -20px); }
                    100% { transform: translate(0, 0); }
                }
            `}} />
        </div>
    );
}
