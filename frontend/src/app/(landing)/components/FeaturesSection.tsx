"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "🤖",
    title: "AI Verification",
    description: "Three independent AI agents verify your claim in parallel",
  },
  {
    icon: "⛓️",
    title: "On-Chain Attestations",
    description: "Every verification recorded on Sui blockchain, immutable and auditable",
  },
  {
    icon: "⚡",
    title: "Instant Settlement",
    description: "Escrow released automatically when all checks pass — no human bottlenecks",
  },
  {
    icon: "🔍",
    title: "Full Transparency",
    description: "Track every step on Sui Explorer. No more calling support for status updates",
  },
  {
    icon: "🛡️",
    title: "Fraud Protection",
    description: "Rule-based fraud detection with real-time cross-reference checks",
  },
  {
    icon: "🌐",
    title: "Parametric Precision",
    description: "Flight delays, weather events — binary conditions verified by real data APIs",
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
    <section id="features" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 bg-grid">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Why <span className="text-gradient">Insurix</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
              className="group p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gradient transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
