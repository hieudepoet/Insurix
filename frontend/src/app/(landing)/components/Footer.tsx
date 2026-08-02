import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Insurix</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
              Docs
            </Link>
            <a
              href="https://github.com/insurix"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          {/* Built on Sui badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.28 17.605A9.961 9.961 0 0022 11c0-5.523-4.477-10-10-10S2 5.477 2 11c0 2.638 1.024 5.037 2.72 6.605C6.511 19.398 9.08 20.5 12 20.5s5.489-1.102 7.28-2.895z" />
            </svg>
            <span className="text-xs text-blue-400 font-medium">Built on Sui</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Insurix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
