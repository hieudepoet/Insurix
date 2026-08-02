"use client";

import dynamic from "next/dynamic";

const HowItWorksScene = dynamic(() => import("./HowItWorksScene"), { ssr: false });

const steps = [
  {
    number: "01",
    title: "Submit Claim",
    description: "Customer submits a parametric claim — flight delay, heavy rain, or any binary condition.",
  },
  {
    number: "02",
    title: "AI Agents Verify",
    description: "3 agents run in parallel: Identity, External Data, and Fraud Check.",
  },
  {
    number: "03",
    title: "Attestations Issued",
    description: "Each agent issues an on-chain attestation via Sui blockchain.",
  },
  {
    number: "04",
    title: "Instant Payout",
    description: "Smart contract verifies 3-of-3 attestations, releases escrow automatically.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From claim submission to payout — fully automated, fully on-chain.
          </p>
        </div>

        {/* 3D Visualization */}
        <div className="mb-16 rounded-2xl overflow-hidden border border-white/5">
          <HowItWorksScene />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative group">
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Number badge */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-gradient">{step.number}</span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
