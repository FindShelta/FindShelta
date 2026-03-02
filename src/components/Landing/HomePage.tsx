import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Video,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FindSheltaLogo from '../common/FindShelterLogo';

interface HomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onSignIn }) => {
  const { isDark, toggleTheme } = useTheme();

  const highlights = [
    'Direct agent WhatsApp contact',
    'Video-first property listings',
    'No middleman commission fees',
    'Verified profiles and property details',
  ];

  const features = [
    {
      title: 'Search Built For Real Needs',
      description: 'Filter by location, budget, property type, and amenities without clutter.',
      icon: Search,
    },
    {
      title: 'Talk To Agents Instantly',
      description: 'One tap opens WhatsApp so inquiries move quickly from listing to conversation.',
      icon: MessageCircle,
    },
    {
      title: 'Trust Through Verification',
      description: 'Agent and listing checks reduce fake listings and wasted site visits.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <nav className="section-shell pt-6">
        <div className="panel flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <FindSheltaLogo size={46} />
            <div>
              <p className="text-base font-bold text-[color:var(--text)] sm:text-lg">FindShelta</p>
              <p className="text-xs tracking-[0.16em] text-[color:var(--text-muted)]">PROPERTY MARKETPLACE</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="ghost-button inline-flex h-10 w-10 items-center justify-center rounded-lg"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4 text-[color:var(--accent)]" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={onSignIn} className="ghost-button rounded-lg px-4 py-2 text-sm font-semibold sm:px-5">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <header className="section-shell pt-10 sm:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="appear-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
              <BadgeCheck className="h-4 w-4 text-[color:var(--brand)]" />
              Trusted Homes Across Nigeria
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-[color:var(--text)] sm:text-5xl lg:text-6xl">
              Find rental, sale, and short-stay properties without the usual friction.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-muted)] sm:text-lg">
              FindShelta connects home seekers directly with verified agents using clear listings, video previews, and fast chat workflows.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onGetStarted}
                className="brand-button inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold sm:text-base"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onSignIn}
                className="ghost-button inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold sm:text-base"
              >
                Existing Account
              </button>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--brand)]" />
                  <p className="text-sm text-[color:var(--text-muted)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="appear-up [animation-delay:120ms]">
            <div className="panel rounded-3xl p-5 sm:p-7">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Featured Listing</p>
                    <h3 className="mt-1 text-xl font-bold text-[color:var(--text)]">3 Bedroom Apartment</h3>
                  </div>
                  <div className="rounded-full bg-[color:var(--brand)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
                    For Rent
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                    <MapPin className="h-4 w-4 text-[color:var(--brand)]" />
                    Lekki Phase 1, Lagos
                  </div>
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                    <Video className="h-4 w-4 text-[color:var(--brand)]" />
                    Video tour available
                  </div>
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                    <Building2 className="h-4 w-4 text-[color:var(--brand)]" />
                    Verified by FindShelta team
                  </div>
                </div>

                <p className="mt-6 text-3xl font-bold text-[color:var(--text)]">N2,500,000 / year</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="section-shell mt-14 sm:mt-16">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="panel appear-up rounded-2xl p-6"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-[color:var(--brand)]/15 p-3 text-[color:var(--brand)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-[color:var(--text)]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell mt-14 sm:mt-16">
        <div className="hero-gradient overflow-hidden rounded-3xl p-8 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Agent-friendly Model</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Free renewal available if you do not close sales within 30 days.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            Publish video listings, reach active home seekers, and run conversations through WhatsApp with faster response cycles.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0f544e] sm:text-base"
          >
            Create Account
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="section-shell mt-12">
        <div className="border-t border-[color:var(--border)] pt-6 text-center text-sm text-[color:var(--text-muted)]">
          <p>FindShelta platform for direct property discovery and verified agent connections.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
