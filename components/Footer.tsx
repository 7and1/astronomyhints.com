export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="flex items-center justify-between px-4 py-3 text-xs text-white/40">
        <div className="pointer-events-auto">
          <span>&copy; {currentYear} </span>
          <a
            href="https://astronomyhints.com"
            className="hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:rounded"
            aria-label="Astronomy Hints homepage"
          >
            Astronomy Hints
          </a>
          <span> - Orbit Command</span>
        </div>
        <nav className="pointer-events-auto flex items-center gap-4" aria-label="Footer navigation">
          <a
            href="mailto:hello@astronomyhints.com"
            className="hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:rounded"
            aria-label="Contact us via email"
          >
            hello@astronomyhints.com
          </a>
          <a
            href="https://astronomyhints.com/privacy"
            className="hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:rounded"
          >
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
