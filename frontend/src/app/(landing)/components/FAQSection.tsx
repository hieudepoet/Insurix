"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What types of insurance does Insurix support?",
    answer:
      "Insurix supports parametric insurance — claims based on verifiable, binary conditions like flight delays, weather events, and other measurable triggers. No subjective assessments needed.",
  },
  {
    question: "How is my claim verified?",
    answer:
      "Three independent AI agents verify your claim in parallel: Identity Verification, External Data Check, and Fraud Analysis. Each issues an on-chain attestation via Sui blockchain.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All verifications are recorded on the Sui blockchain as encrypted attestations. Your data is never stored centrally — everything is on-chain, immutable, and auditable.",
  },
  {
    question: "How fast is the payout?",
    answer:
      "Minutes, not days or weeks. Once all three attestations are verified, the smart contract automatically releases the escrow. No human intervention required.",
  },
  {
    question: "What happens if verification fails?",
    answer:
      "Your claim is rejected with a clear, specific reason shown. Every failed verification step is recorded on-chain, so you can see exactly which check didn't pass and why.",
  },
];

function FAQItem({ faq, isOpen, onToggle }: { faq: typeof faqs[number]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-gradient transition-all pr-8">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about Insurix.
          </p>
        </div>

        {/* FAQ items */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-8">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
