import { Link } from 'react-router-dom'

const STEPS = [
  ['01', 'You hear it', 'A glowing five-star review. You take it at face value and go.'],
  ['02', "But it's only hearsay", 'One rave proves nothing. A rating is easy to fake.'],
  ['03', 'So you cross-check', 'Hearsay pulls every platform at once and lines them up side by side.'],
  ['04', 'The truth cracks through', 'When they disagree, you finally see what people really think.'],
]

const FEATURES = [
  ['Seven platforms, one search', 'Google, Yelp, Reddit, YouTube, TripAdvisor and more, pulled in parallel.'],
  ['Knows where you are', 'Surfaces the platforms people actually use in your region, not just the global defaults.'],
  ['Divergence radar', 'Flags when platforms disagree by 1.5★ or more, so you can stop and ask why.'],
  ['Live, never cached', 'Reviews are fetched in real time. Nothing is stored on our end.'],
  ['No keys in your browser', 'Every API call is proxied through a Cloudflare Worker.'],
  ['No AI in the middle', 'Divergence is plain math, not a model guessing on your behalf.'],
]

function Eyebrow({ children }) {
  return <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--accent)' }}>{children}</p>
}

export default function AboutPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 sm:py-14">
      <Link to="/" className="text-sm transition-colors inline-flex items-center gap-1 mb-8" style={{ color: 'var(--mut)' }}>
        ← Back
      </Link>

      {/* Hero */}
      <Eyebrow>About</Eyebrow>
      <h1 className="font-display font-semibold text-white leading-[1.05] mb-4" style={{ fontSize: 'clamp(30px,6vw,52px)', letterSpacing: '-0.02em' }}>
        A rave from a stranger is just <em className="italic" style={{ color: 'var(--accent)' }}>hearsay</em>.
      </h1>
      <p className="text-base sm:text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--ink-2)' }}>
        The tool you use shapes the answer you get. Yelp gives you Yelp's crowd and incentives;
        Reddit gives you a different crowd entirely; Google gives you a third. None are wrong. All are
        partial. And most people only ever check one.
      </p>

      {/* Definition card */}
      <div className="panel-glass p-6 sm:p-7 mt-8">
        <div className="font-display text-2xl sm:text-3xl font-semibold">
          hearsay
          <span className="font-mono text-sm font-normal ml-3" style={{ color: 'var(--mut)' }}>/ˈhɪəseɪ/</span>
        </div>
        <div className="font-mono text-xs mt-1 mb-3" style={{ color: 'var(--accent)' }}>noun · law</div>
        <p className="leading-relaxed" style={{ color: 'var(--ink-2)' }}>
          information received from other people that <span style={{ color: 'var(--warm)' }}>cannot be substantiated</span>.
          A review you can't trust until you check it against the others yourself. That's the whole idea:
          Hearsay makes the disagreement visible instead of hiding it behind one number.
        </p>
      </div>

      {/* How it works */}
      <section className="mt-12">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-display text-2xl font-semibold text-white mb-5">Hear it, doubt it, cross-check it.</h2>
        <div className="space-y-4">
          {STEPS.map(([n, title, desc]) => (
            <div key={n} className="flex gap-4 items-start">
              <div className="font-mono text-sm font-medium shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: 'var(--accent)', background: '#4df0d012', border: '1px solid #4df0d040' }}>{n}</div>
              <div className="min-w-0">
                <div className="font-semibold text-white">{title}</div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Oscar Wilde */}
      <figure className="my-12 text-center">
        <blockquote className="font-display italic text-xl sm:text-2xl text-white" style={{ letterSpacing: '-0.01em' }}>
          “The truth is rarely pure and never simple.”
        </blockquote>
        <figcaption className="font-mono text-xs mt-2" style={{ color: 'var(--mut)' }}>Oscar Wilde</figcaption>
      </figure>

      {/* Features */}
      <section className="mt-4">
        <Eyebrow>What it does</Eyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {FEATURES.map(([title, desc]) => (
            <div key={title} className="panel-glass p-4 transition-colors hover:border-[color:var(--line-2)]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <p className="text-sm font-semibold text-white">{title}</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--mut)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical notes */}
      <section className="mt-12">
        <Eyebrow>Under the hood</Eyebrow>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--ink-2)' }}>
          <li>• Reviews fetched live, never stored or cached on our end.</li>
          <li>• API calls proxied through Cloudflare Workers, so no keys live in your browser.</li>
          <li>• Built with Vite + React 19, hosted on GitHub Pages.</li>
          <li>• Open source:{' '}
            <a href="https://github.com/parisa-singh/hearsay-v2" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
              github.com/parisa-singh/hearsay-v2
            </a>
          </li>
        </ul>
      </section>

      {/* Builder */}
      <section className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--line)' }}>
        <Eyebrow>Who made this</Eyebrow>
        <p className="leading-relaxed" style={{ color: 'var(--ink-2)' }}>
          Built by{' '}
          <a href="https://www.linkedin.com/in/parisa-singh/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white transition-colors" style={{ color: 'var(--ink)' }}>
            Parisa Singh
          </a>
          {' '}— working at the intersection of information systems, AI transparency, and product design.
          Hearsay started as a simple itch: why does the same place get wildly different ratings depending
          on where you look, and why does nobody put them next to each other?
        </p>
      </section>
    </main>
  )
}
