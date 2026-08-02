import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),rgba(16,185,129,0.02))] border border-emerald-500/10 p-8 sm:p-12 md:p-16 text-center overflow-hidden">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f8fafc] mb-4">
            Ready to Experience
            <br />
            Automated Claims?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-8">
            Submit your first parametric claim and see AI-powered verification in action.
            No paperwork, no waiting.
          </p>
          <Link
            href="/claims"
            className="inline-flex w-full sm:w-auto justify-center bg-white text-[#060818] rounded-full h-14 px-8 font-semibold text-base sm:text-lg hover:bg-slate-200 transition-colors"
          >
            Launch App
          </Link>
        </div>
      </div>
    </section>
  );
}
