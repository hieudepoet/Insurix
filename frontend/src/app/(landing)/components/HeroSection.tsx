"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <HeroScene />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e27] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="text-sm text-gray-300">Powered by Sui Blockchain & AI Agents</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          <span className="text-white">Insurance Claims,</span>
          <br />
          <span className="text-gradient">Automated by AI</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Parametric claims verified in minutes, not weeks.
          Powered by AI agents and Sui blockchain attestations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/claims"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg hover:opacity-90 transition-opacity glow"
          >
            Submit a Claim
          </Link>
          <Link
            href="#how-it-works"
            className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-colors"
          >
            Learn How It Works
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
