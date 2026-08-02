"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "AI Verification",
    description: "Three independent AI agents verify your claim in parallel",
    circle: "bg-emerald-500/10 text-emerald-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    title: "On-Chain Attestations",
    description: "Every verification recorded on Sui blockchain, immutable and auditable",
    circle: "bg-violet-500/10 text-violet-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.342a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    ),
  },
  {
    title: "Instant Settlement",
    description: "Escrow released automatically when all checks pass — no human bottlenecks",
    circle: "bg-emerald-500/10 text-emerald-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
  {
    title: "Full Transparency",
    description: "Track every step on Sui Explorer. No more calling support for status updates",
    circle: "bg-violet-500/10 text-violet-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    ),
  },
  {
    title: "Fraud Protection",
    description: "Rule-based fraud detection with real-time cross-reference checks",
    circle: "bg-emerald-500/10 text-emerald-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    title: "Parametric Precision",
    description: "Flight delays, weather events — binary conditions verified by real data APIs",
    circle: "bg-violet-500/10 text-violet-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z M15 15v2m0 0v-2m0 2H9m6-4V9"
      />
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut" as const,
    },
  }),
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f8fafc] mb-4">
            Why Insurix?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Traditional insurance is slow, opaque, and full of intermediaries.
            Insurix replaces all of that with code, AI, and on-chain proof.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className="group bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-6 sm:p-8 hover:border-emerald-500/20 border border-transparent transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-full ${feature.circle} flex items-center justify-center mb-4`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#f8fafc] mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
