'use client';

import React from 'react';

// Design 1: Classic Sleek Spinner
export const ClassicSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-12 h-12 border-4 border-gray-100 border-b-indigo-500 rounded-full animate-spin-slow"></div>
        </div>
        <span className="text-sm font-medium text-gray-500 animate-pulse">Loading experience...</span>
    </div>
);

// Design 2: Pulsing App Logo (Placeholder for Logo)
export const PulseLogo = () => (
    <div className="flex flex-col items-center justify-center">
        <div className="relative">
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-ping-slow"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-gentle">
                <span className="text-4xl font-bold text-white">B</span>
            </div>
        </div>
        <div className="mt-8 flex gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        </div>
    </div>
);

// Design 3: Glassmorphic Wave
export const GlassWave = () => (
    <div className="relative w-64 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-wave"></div>
    </div>
);

// Design 4: Morphing Shapes
export const MorphingShapes = () => (
    <div className="flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-500 shadow-lg animate-morph"></div>
    </div>
);

// Design 5: Modern Grid/Skeleton
export const SkeletonShowcase = () => (
    <div className="w-72 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="space-y-2 flex-1">
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
        <div className="h-32 w-full bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse"></div>
        </div>
    </div>
);

// Design 6: Logo Bounce (Beaver Logo)
export const LogoBounce = () => (
    <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative">
            <div className="w-20 h-20 bg-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-xl animate-bounce-gentle overflow-hidden">
                <span className="text-4xl font-bold text-white relative z-10">B</span>
                <div className="absolute bottom-0 left-0 w-full bg-blue-400/30 animate-liquid-fill" style={{ height: '100%' }}></div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-gray-900/10 rounded-full blur-md animate-pulse"></div>
        </div>
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1e3a5f] animate-wave"></div>
        </div>
    </div>
);

// Design 7: Circular Dots Sweep
export const CircularDots = () => (
    <div className="relative w-16 h-16">
        {[...Array(8)].map((_, i) => (
            <div
                key={i}
                className="absolute w-3 h-3 bg-blue-600 rounded-full animate-pulse"
                style={{
                    top: `${50 + 35 * Math.sin((i * 45 * Math.PI) / 180)}%`,
                    left: `${50 + 35 * Math.cos((i * 45 * Math.PI) / 180)}%`,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: `${i * 0.15}s`,
                }}
            ></div>
        ))}
    </div>
);

// Design 8: Glitchy Text
export const GlitchText = () => (
    <div className="relative">
        <span className="text-4xl font-black text-gray-900 uppercase tracking-widest animate-glitch relative z-10">
            Loading
        </span>
        <span className="absolute inset-0 text-red-500 opacity-50 animate-glitch" style={{ animationDelay: '0.1s', left: '1px' }}>
            Loading
        </span>
        <span className="absolute inset-0 text-blue-500 opacity-50 animate-glitch" style={{ animationDelay: '0.2s', left: '-1px' }}>
            Loading
        </span>
    </div>
);

// Design 9: Floating Dots
export const FloatingDots = () => {
    return (
        <div className="relative w-40 h-20 overflow-hidden bg-gray-50 rounded-xl border border-gray-100">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-500/40 rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}
                ></div>
            ))}
            <style jsx>{`
                @keyframes float {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px); }
                }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-900/40 uppercase tracking-tighter">Processing</span>
            </div>
        </div>
    );
};

// Design 10: Neon Line
export const NeonLine = () => (
    <div className="relative w-48 h-12 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-800">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-wave" style={{ animationDuration: '1s' }}></div>
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-purple-400 to-transparent animate-wave" style={{ animationDuration: '1s' }}></div>
        <span className="text-cyan-400 font-mono text-sm tracking-widest">SYSTEM_BOOT</span>
    </div>
);

// Design 11: 3D Cube Flip
export const CubeFlip = () => (
    <div className="perspective-1000">
        <div className="w-12 h-12 relative transform-style-3d animate-cube-rotate">
            <div className="absolute inset-0 bg-blue-600 border border-white/20 origin-center translate-z-6"></div>
            <div className="absolute inset-0 bg-indigo-700 border border-white/20 origin-center -translate-z-6"></div>
            <div className="absolute inset-0 bg-blue-500 border border-white/20 origin-center rotate-y-90 translate-z-6"></div>
            <div className="absolute inset-0 bg-indigo-800 border border-white/20 origin-center -rotate-y-90 translate-z-6"></div>
            <div className="absolute inset-0 bg-blue-400 border border-white/20 origin-center rotate-x-90 translate-z-6"></div>
            <div className="absolute inset-0 bg-indigo-900 border border-white/20 origin-center -rotate-x-90 translate-z-6"></div>
        </div>
        <style jsx>{`
      .perspective-1000 { perspective: 1000px; }
      .transform-style-3d { transform-style: preserve-3d; }
      .translate-z-6 { transform: translateZ(24px); }
      .-translate-z-6 { transform: translateZ(-24px); }
      @keyframes cube-rotate {
        0% { transform: rotateX(0deg) rotateY(0deg); }
        100% { transform: rotateX(360deg) rotateY(360deg); }
      }
      .animate-cube-rotate { animation: cube-rotate 2s linear infinite; }
    `}</style>
    </div>
);

// Design 12: Liquid Fill
export const LiquidFill = () => (
    <div className="relative w-20 h-20 border-4 border-blue-600 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-blue-100"></div>
        <div
            className="absolute bottom-0 left-[-50%] w-[200%] h-[120%] bg-blue-600 rounded-[40%] animate-liquid-wave"
        ></div>
        <style jsx>{`
      @keyframes liquid-wave {
        0% { transform: translateY(100%) rotate(0deg); }
        50% { transform: translateY(40%) rotate(180deg); }
        100% { transform: translateY(100%) rotate(360deg); }
      }
      .animate-liquid-wave { animation: liquid-wave 4s ease-in-out infinite; }
    `}</style>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-white mix-blend-difference">
            %
        </div>
    </div>
);

// Design 13: Staggered Bars
export const StaggeredBars = () => (
    <div className="flex items-end gap-1.5 h-12">
        {[...Array(5)].map((_, i) => (
            <div
                key={i}
                className="w-2.5 bg-gradient-to-t from-blue-700 to-blue-400 rounded-full animate-bar-grow"
                style={{
                    animationDelay: `${i * 0.1}s`,
                    height: '100%',
                }}
            ></div>
        ))}
        <style jsx>{`
      @keyframes bar-grow {
        0%, 100% { height: 20%; }
        50% { height: 100%; }
      }
      .animate-bar-grow { animation: bar-grow 1s ease-in-out infinite; }
    `}</style>
    </div>
);

// Design 14: Radar Sweep
export const RadarSweep = () => (
    <div className="relative w-24 h-24 bg-green-950 rounded-full border border-green-500/50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,197,94,0.1)_0%,transparent_70%)]"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-to-tr from-green-500/40 to-transparent origin-top-left -translate-x-full -translate-y-full animate-radar-sweep"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-green-500/20"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-green-500/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
    </div>
);

// Design 15: Infinity Trace
export const InfinityTrace = () => (
    <div className="flex items-center justify-center">
        <svg width="100" height="50" viewBox="0 0 100 50">
            <path
                d="M25 40C10 40 10 10 25 10C35 10 45 25 50 25C55 25 65 40 75 40C90 40 90 10 75 10C65 10 55 25 50 25C45 25 35 40 25 40Z"
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
                strokeDasharray="300"
                strokeDashoffset="300"
                className="animate-infinity-trace"
            />
        </svg>
    </div>
);

// --- Logo-Based Variants (Isometric Cube) ---

const LogoCubeSVG = ({ className, pathProps = {} }: { className?: string; pathProps?: any }) => (
    <svg viewBox="0 0 100 100" className={className}>
        {/* Outline / All lines */}
        <path
            d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z M50 20 L50 50 M50 50 L20 35 M50 50 L80 35 M50 50 L50 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...pathProps}
        />
    </svg>
);

// Design 16: Logo Line Trace (Drawing the cube)
export const LogoLineTrace = () => (
    <div className="flex items-center justify-center w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#1e3a5f]">
            <path
                d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z M50 20 L50 50 M50 50 L20 35 M50 50 L80 35 M50 50 L50 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="400"
                strokeDashoffset="400"
                className="animate-infinity-trace"
            />
        </svg>
    </div>
);

// Design 17: Logo Pulsing Glow
export const LogoPulsingGlow = () => (
    <div className="flex items-center justify-center w-32 h-32">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500/40 rounded-full blur-2xl animate-pulse scale-150"></div>
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#1e3a5f] relative z-10 animate-bounce-gentle">
                <path
                    d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z"
                    fill="currentColor"
                    fillOpacity="0.1"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinejoin="round"
                />
                <path d="M50 20 L50 50 L20 35 M50 50 L80 35 M50 50 L50 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
        </div>
    </div>
);

// Design 18: Logo Piece Assembly
export const LogoAssembler = () => (
    <div className="flex items-center justify-center w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#1e3a5f]">
            {/* Top Face */}
            <path
                d="M50 20 L80 35 L50 50 L20 35 Z"
                fill="currentColor"
                className="animate-face-assemble"
                style={{ '--tw-enter-translate-y': '-50px', animationDelay: '0s' } as any}
            />
            {/* Left Face */}
            <path
                d="M20 35 L50 50 L50 80 L20 65 Z"
                fill="currentColor"
                fillOpacity="0.8"
                className="animate-face-assemble"
                style={{ '--tw-enter-translate-x': '-50px', animationDelay: '0.2s' } as any}
            />
            {/* Right Face */}
            <path
                d="M50 50 L80 35 L80 65 L50 80 Z"
                fill="currentColor"
                fillOpacity="0.6"
                className="animate-face-assemble"
                style={{ '--tw-enter-translate-x': '50px', animationDelay: '0.4s' } as any}
            />
        </svg>
    </div>
);

// Design 19: Logo Glass Break (Glassmorphicreveal)
export const LogoGlassReveal = () => (
    <div className="relative w-40 h-40 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl overflow-hidden border border-white/50 shadow-inner">
        <LogoCubeSVG className="w-20 h-20 text-[#1e3a5f]/20" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md animate-reveal-glass flex items-center justify-center">
            <LogoCubeSVG className="w-20 h-20 text-[#1e3a5f] animate-pulse" />
        </div>
        <style jsx>{`
      @keyframes reveal-glass {
        0%, 100% { backdrop-filter: blur(12px); background-color: rgba(255,255,255,0.4); }
        50% { backdrop-filter: blur(0px); background-color: rgba(255,255,255,0); }
      }
      .animate-reveal-glass { animation: reveal-glass 3s ease-in-out infinite; }
    `}</style>
    </div>
);

// Design 20: Logo Digital Scan
export const LogoDigitalScan = () => (
    <div className="relative w-32 h-32 flex items-center justify-center">
        <LogoCubeSVG className="w-24 h-24 text-gray-200" />
        <div className="absolute inset-0 flex items-center justify-center clip-path-scan">
            <LogoCubeSVG className="w-24 h-24 text-blue-600" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-line"></div>
        <style jsx>{`
      .clip-path-scan {
        animation: scan-clip 2s ease-in-out infinite;
      }
      @keyframes scan-clip {
        0% { clip-path: inset(0 0 100% 0); }
        50% { clip-path: inset(0 0 0 0); }
        100% { clip-path: inset(100% 0 0 0); }
      }
    `}</style>
    </div>
);
