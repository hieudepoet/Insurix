"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function HeroSection() {
  return (
    <section className="relative min-h-[55vh] sm:min-h-[75vh] lg:min-h-screen flex items-center justify-center overflow-hidden font-sans">
      {/* 3D Background */}
      <HeroScene />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060818] pointer-events-none" />

      {/* Subtle gradient mesh glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center pt-28 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d1126] border border-white/5 mb-8">
          <span className="text-xs sm:text-sm text-slate-400">Powered by Sui Blockchain & AI Agents</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
          <span className="text-[#f8fafc]">Insurance Claims,</span>
          <br />
          <span className="text-emerald-400">Automated by AI</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed px-2">
          Parametric claims verified in minutes, not weeks.
          Powered by AI agents and Sui blockchain attestations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/claims"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 rounded-full h-14 px-8 text-white font-semibold text-base sm:text-lg transition-colors text-center flex items-center justify-center"
          >
            Get Started
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto border border-white/10 hover:border-white/20 rounded-full h-14 px-8 text-[#f8fafc] font-semibold text-base sm:text-lg transition-colors text-center flex items-center justify-center"
          >
            Learn More
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-slate-500">Scroll to explore</span>
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
