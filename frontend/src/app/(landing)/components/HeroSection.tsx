"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] sm:min-h-[75vh] lg:min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <HeroScene />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e27] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24 pb-12">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm text-gray-300">Powered by Sui Blockchain & AI Agents</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6">
          <span className="text-white">Insurance Claims,</span>
          <br />
          <span className="text-gradient">Automated by AI</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Parametric claims verified in minutes, not weeks.
          Powered by AI agents and Sui blockchain attestations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/claims"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity glow text-center"
          >
            Submit a Claim
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full border border-white/20 text-white font-semibold text-base sm:text-lg hover:bg-white/5 transition-colors text-center"
          >
            Learn How It Works
          </Link>
        </div>

        {/* Scroll indicator — hidden on small screens */}
        <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
