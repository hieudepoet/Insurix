import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/10 p-12 md:p-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Experience<br />
            <span className="text-gradient">Automated Claims</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Submit your first parametric claim and see AI-powered verification in action.
            No paperwork, no waiting.
          </p>
          <Link
            href="/claims"
            className="inline-flex px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg hover:opacity-90 transition-opacity glow"
          >
            Launch App
          </Link>
        </div>
      </div>
    </section>
  );
}
