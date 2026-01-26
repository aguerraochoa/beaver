'use client';

import React, { useState } from 'react';
import * as Variants from './loading/LoadingVariants';
import RealisticSkeletonDemo from './RealisticSkeletonDemo';

const loadingScreens = [
    { id: 'spinner', name: 'Classic Sleek Spinner', component: Variants.ClassicSpinner, description: 'A dual-ring rotating spinner for a technical, precise feel.' },
    { id: 'logo-pulse', name: 'Pulsing App Logo', component: Variants.PulseLogo, description: 'Brand-focused animation with soft pulses and bouncing accents.' },
    { id: 'wave', name: 'Glassmorphic Wave', component: Variants.GlassWave, description: 'Minimalist progress line with a smooth gradient wave.' },
    { id: 'morph', name: 'Morphing Shapes', component: Variants.MorphingShapes, description: 'Organic, modern morphing background shapes for a creative touch.' },
    { id: 'skeleton', name: 'Skeleton Content', component: Variants.SkeletonShowcase, description: 'Perceived performance booster using content placeholders.' },
    { id: 'logo-bounce', name: 'Beaver Logo Bounce', component: Variants.LogoBounce, description: 'The Beaver "B" logo bouncing on a liquid-filled progress bar.' },
    { id: 'dots-sweep', name: 'Circular Dots Sweep', component: Variants.CircularDots, description: 'Eight dots rotating in a circular motion with staggered pulses.' },
    { id: 'glitch', name: 'Glitchy "Loading"', component: Variants.GlitchText, description: 'Aggressive, high-tech glitch effect for a modern cyber feel.' },
    { id: 'floating', name: 'Floating Particles', component: Variants.FloatingDots, description: 'Softly floating particles in a processing-themed container.' },
    { id: 'neon', name: 'Neon System Boot', component: Variants.NeonLine, description: 'Cyberpunk-inspired dual neon lines with a monospaced terminal font.' },
    { id: 'cube', name: '3D Isometric Cube', component: Variants.CubeFlip, description: 'A fully 3D rotating cube with shaded faces and perspective.' },
    { id: 'liquid', name: 'Liquid Percent', component: Variants.LiquidFill, description: 'A circular container filling up with a waving liquid effect.' },
    { id: 'bars', name: 'Staggered Audio Bars', component: Variants.StaggeredBars, description: 'Dynamic vertical bars that grow and shrink like an equalizer.' },
    { id: 'radar', name: 'Military Radar Scan', component: Variants.RadarSweep, description: 'Tactical radar sweep with glow effects and grid lines.' },
    { id: 'infinity', name: 'Infinity Trace', component: Variants.InfinityTrace, description: 'A mathematical infinity symbol that draws itself continuously.' },
    { id: 'logo-trace', name: 'Logo Line Trace', component: Variants.LogoLineTrace, description: 'The official isometric cube logo being drawn with light.' },
    { id: 'logo-glow', name: 'Logo Pulsating Glow', component: Variants.LogoPulsingGlow, description: 'The logo with an ethereal, rhythmic pulse and shadow.' },
    { id: 'logo-assemble', name: 'Logo Face Assembler', component: Variants.LogoAssembler, description: 'Separate faces of the logo flying into position.' },
    { id: 'logo-reveal', name: 'Logo Glass Reveal', component: Variants.LogoGlassReveal, description: 'Logo appearing behind a shifting glassmorphic sheet.' },
    { id: 'logo-scan', name: 'Logo Digital Scan', component: Variants.LogoDigitalScan, description: 'A digital laser scanning the isometric cube logo.' },
];

export default function LoadingShowcase() {
    const [selected, setSelected] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'gallery' | 'demo'>('gallery');

    const activeVariant = loadingScreens.find(s => s.id === selected);

    return (
        <div className="min-h-screen bg-gray-50 p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Loading Showcase</h1>
                        <p className="text-lg text-gray-600">Premium animations and realistic loading states for high-end web experiences.</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('gallery')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === 'gallery' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Component Gallery
                        </button>
                        <button
                            onClick={() => setViewMode('demo')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${viewMode === 'demo' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Realistic Demo
                        </button>
                    </div>
                </header>

                {viewMode === 'gallery' ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingScreens.map((screen) => (
                            <div
                                key={screen.id}
                                className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center"
                                onClick={() => setSelected(screen.id)}
                            >
                                <div className="h-40 flex items-center justify-center mb-6">
                                    <div className="transform scale-75 group-hover:scale-90 transition-transform">
                                        <screen.component />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{screen.name}</h3>
                                <p className="text-gray-500 text-sm mb-6">{screen.description}</p>
                                <button className="mt-auto px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                                    Preview Full Screen
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <RealisticSkeletonDemo />
                    </div>
                )}
            </div>

            {/* Full Screen Preview Overlay */}
            {selected && activeVariant && (
                <div
                    className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300"
                    onClick={() => setSelected(null)}
                >
                    <div className="flex flex-col items-center">
                        <activeVariant.component />
                        <button
                            className="mt-12 px-8 py-3 bg-gray-900 text-white rounded-full font-medium shadow-lg hover:bg-gray-800 transition-all active:scale-95"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelected(null);
                            }}
                        >
                            Exit Preview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
