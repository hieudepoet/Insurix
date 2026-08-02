"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const attestations = [
  { id: 1, label: "Identity Verification", agent: "Agent Alpha" },
  { id: 2, label: "External Data Check", agent: "Agent Beta" },
  { id: 3, label: "Fraud Analysis", agent: "Agent Gamma" },
];

export default function DemoSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="demo" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            See It in <span className="text-gradient">Action</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Watch how attestations are verified one by one, leading to automatic claim settlement.
          </p>
        </div>

        {/* Mock claim card */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            {/* Claim header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Flight Delay Claim</h3>
                  <p className="text-sm text-gray-400 mt-1">Policy #FL-2024-0847 · SUI Testnet</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className={`w-2 h-2 rounded-full ${activeStep >= 4 ? "bg-green-500" : "bg-yellow-500"} transition-colors duration-500`} />
                  <span className={`text-xs font-medium ${activeStep >= 4 ? "text-green-400" : "text-yellow-400"} transition-colors duration-500`}>
                    {activeStep >= 4 ? "Approved" : "Processing"}
                  </span>
                </div>
              </div>
            </div>

            {/* Claim details */}
            <div className="p-6 border-b border-white/5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Flight</span>
                  <p className="text-white font-medium">LH 4521</p>
                </div>
                <div>
                  <span className="text-gray-500">Delay</span>
                  <p className="text-white font-medium">3h 42min</p>
                </div>
                <div>
                  <span className="text-gray-500">Claim Amount</span>
                  <p className="text-white font-medium">250 USDC</p>
                </div>
                <div>
                  <span className="text-gray-500">Escrow</span>
                  <p className="text-white font-mono text-xs">0x57bc…c502</p>
                </div>
              </div>
            </div>

            {/* Attestations */}
            <div className="p-6 space-y-4">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Attestation Verification
              </h4>

              {attestations.map((att, i) => {
                const isVerified = activeStep > i;
                const isProcessing = activeStep === i;

                return (
                  <motion.div
                    key={att.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    animate={{
                      borderColor: isVerified
                        ? "rgba(34, 197, 94, 0.3)"
                        : isProcessing
                        ? "rgba(234, 179, 8, 0.3)"
                        : "rgba(255, 255, 255, 0.05)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isVerified
                            ? "bg-green-500/20"
                            : isProcessing
                            ? "bg-yellow-500/20"
                            : "bg-white/5"
                        }`}
                        animate={isProcessing ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        {isVerified ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isProcessing ? (
                          <svg className="w-4 h-4 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-500" />
                        )}
                      </motion.div>

                      <div>
                        <p className="text-sm font-medium text-white">{att.label}</p>
                        <p className="text-xs text-gray-500">{att.agent}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        isVerified
                          ? "bg-green-500/10 text-green-400"
                          : isProcessing
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {isVerified ? "Verified" : isProcessing ? "Verifying..." : "Pending"}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Settlement */}
            <motion.div
              className="p-6 border-t border-white/5"
              animate={{
                opacity: activeStep >= 4 ? 1 : 0.4,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Settlement</span>
                <motion.span
                  className={`text-sm font-semibold ${activeStep >= 4 ? "text-green-400" : "text-gray-500"}`}
                  animate={activeStep >= 4 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: activeStep >= 4 ? 2 : 0, duration: 0.5 }}
                >
                  {activeStep >= 4 ? "250 USDC Released ✓" : "Awaiting verification..."}
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* Transaction info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>Attestation Package:</span>
            <code className="px-2 py-0.5 rounded bg-white/5 text-gray-400 font-mono">0x921c…a5f5</code>
            <span className="text-gray-600">·</span>
            <span>Sui Testnet</span>
          </div>
        </div>
      </div>
    </section>
  );
}
