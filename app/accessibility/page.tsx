import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Orbit Command - Astronomy Hints',
  description:
    'Accessibility statement for Orbit Command 3D Solar System Simulator. Learn about our commitment to WCAG 2.1 AA compliance and accessible astronomy education.',
};

export default function AccessibilityPage() {
  return (
    <main
      id="main-content"
      className="min-h-dvh bg-black text-white p-6 md:p-12"
      tabIndex={-1}
    >
      <div className="max-w-3xl mx-auto">
        <nav className="mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
          >
            &larr; Back to Orbit Command
          </Link>
        </nav>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Accessibility Statement
            </h1>
            <p className="text-white/70">
              Last updated: February 2026
            </p>
          </header>

          <section className="space-y-6 text-white/90 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Our Commitment
              </h2>
              <p>
                Astronomy Hints is committed to ensuring digital accessibility for people
                with disabilities. We are continually improving the user experience for
                everyone and applying the relevant accessibility standards to ensure we
                provide equal access to all users.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Conformance Status
              </h2>
              <p>
                Orbit Command aims to conform to the Web Content Accessibility Guidelines
                (WCAG) 2.1 at Level AA. These guidelines explain how to make web content
                more accessible for people with disabilities and more user-friendly for
                everyone.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Accessibility Features
              </h2>
              <p className="mb-4">
                Orbit Command includes the following accessibility features:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Keyboard Navigation:</strong> Full keyboard support for all
                  interactive elements. Use arrow keys to navigate between planets, and
                  keyboard shortcuts for quick actions.
                </li>
                <li>
                  <strong>Screen Reader Support:</strong> ARIA labels and live regions
                  provide context for screen reader users. A text description of the 3D
                  scene is available.
                </li>
                <li>
                  <strong>Focus Management:</strong> Visible focus indicators and logical
                  tab order. Focus is trapped within dialogs and restored when closed.
                </li>
                <li>
                  <strong>Skip Link:</strong> A &quot;Skip to main content&quot; link allows
                  keyboard users to bypass navigation.
                </li>
                <li>
                  <strong>Reduced Motion:</strong> Animations are disabled when the user
                  has enabled &quot;prefers-reduced-motion&quot; in their system settings.
                </li>
                <li>
                  <strong>High Contrast:</strong> Enhanced contrast mode support for users
                  who prefer higher contrast.
                </li>
                <li>
                  <strong>Resizable Text:</strong> Text can be resized up to 200% without
                  loss of content or functionality.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Keyboard Shortcuts
              </h2>
              <p className="mb-4">
                The following keyboard shortcuts are available:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-2 pr-4 font-semibold">Key</th>
                      <th className="text-left py-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">?</kbd></td>
                      <td className="py-2">Open/close help dialog</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">K</kbd> or <kbd className="ui-kbd">Cmd+K</kbd></td>
                      <td className="py-2">Open command palette</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">O</kbd></td>
                      <td className="py-2">Toggle orbital paths</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">L</kbd></td>
                      <td className="py-2">Toggle planet labels</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">C</kbd></td>
                      <td className="py-2">Start/stop cinematic tour</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">M</kbd></td>
                      <td className="py-2">Open mission control</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">S</kbd></td>
                      <td className="py-2">Take snapshot</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">Space</kbd></td>
                      <td className="py-2">Pause/resume simulation</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">Escape</kbd></td>
                      <td className="py-2">Close dialogs/panels</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">←</kbd> / <kbd className="ui-kbd">→</kbd></td>
                      <td className="py-2">Navigate to previous/next planet</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">↑</kbd> / <kbd className="ui-kbd">↓</kbd></td>
                      <td className="py-2">Navigate to previous/next planet</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-4"><kbd className="ui-kbd">Home</kbd></td>
                      <td className="py-2">Select Mercury (first planet)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4"><kbd className="ui-kbd">End</kbd></td>
                      <td className="py-2">Select Neptune (last planet)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Known Limitations
              </h2>
              <p className="mb-4">
                While we strive for full accessibility, there are some known limitations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>3D Visualization:</strong> The WebGL-based 3D solar system
                  visualization is inherently visual. We provide text descriptions and
                  alternative ways to access planet information for screen reader users.
                </li>
                <li>
                  <strong>Complex Interactions:</strong> Some 3D camera controls (drag to
                  rotate, pinch to zoom) require mouse or touch input. Keyboard
                  alternatives are provided for planet selection.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Browser and Assistive Technology Support
              </h2>
              <p>
                Orbit Command is designed to be compatible with the following:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Modern browsers: Chrome, Firefox, Safari, Edge (latest versions)</li>
                <li>Screen readers: NVDA, JAWS, VoiceOver, TalkBack</li>
                <li>Voice control software</li>
                <li>Screen magnification software</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Feedback
              </h2>
              <p>
                We welcome your feedback on the accessibility of Orbit Command. Please let
                us know if you encounter accessibility barriers:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:hello@astronomyhints.com"
                    className="text-cyan-200 underline hover:text-cyan-100"
                  >
                    hello@astronomyhints.com
                  </a>
                </li>
              </ul>
              <p className="mt-4">
                We try to respond to accessibility feedback within 5 business days.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-200">
                Technical Specifications
              </h2>
              <p>
                Accessibility of Orbit Command relies on the following technologies:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>HTML5</li>
                <li>WAI-ARIA</li>
                <li>CSS</li>
                <li>JavaScript</li>
                <li>WebGL (with text alternatives)</li>
              </ul>
            </div>
          </section>
        </article>

        <footer className="mt-12 pt-8 border-t border-white/10 text-white/60 text-sm">
          <p>
            This statement was created on February 4, 2026 and was last reviewed on
            February 4, 2026.
          </p>
        </footer>
      </div>
    </main>
  );
}
