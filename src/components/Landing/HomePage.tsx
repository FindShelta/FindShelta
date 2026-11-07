import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bath, BedDouble, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Loader2, MapPin, Moon, Pause, Play, ShieldCheck, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import useFeaturedCityListings from '../../hooks/useFeaturedCityListings';
import { AVAILABLE_CITIES } from '../../lib/cities';
import { formatNightlyPrice } from '../../lib/listings';
import FindSheltaLogo from '../common/FindShelterLogo';
import Seo from '../common/Seo';
import InfiniteShortStayGrid from '../Properties/InfiniteShortStayGrid';

interface HomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onCitySearch: (city: string) => void;
}

const cities = AVAILABLE_CITIES;

const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onSignIn, onCitySearch }) => {
  const { isDark, toggleTheme } = useTheme();
  const [selectedCity, setSelectedCity] = useState('Lagos');
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { listings: propertyShowcases, loading: featuredLoading, error: featuredError } = useFeaturedCityListings(cities);
  const showcase = propertyShowcases[activeShowcase];
  const pageTitle = import.meta.env.VITE_HOME_TITLE || 'Short Stay Apartments in Nigeria | FindShelta';
  const pageDescription =
    import.meta.env.VITE_HOME_DESCRIPTION ||
    'Find premium short stay apartments in Lagos, Abuja, and Enugu. Browse quality stays and book directly on FindShelta.';
  const pageHeading = import.meta.env.VITE_HOME_H1 || 'Find Your Perfect Short Stay in Nigeria';

  useEffect(() => {
    if (carouselPaused || carouselHovered || propertyShowcases.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveShowcase((current) => (current + 1) % propertyShowcases.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [carouselHovered, carouselPaused, propertyShowcases.length]);

  useEffect(() => {
    if (activeShowcase >= propertyShowcases.length) setActiveShowcase(0);
  }, [activeShowcase, propertyShowcases.length]);

  const chooseCity = (city: string) => {
    setSelectedCity(city);
    const showcaseIndex = propertyShowcases.findIndex((item) => item.city === city);
    if (showcaseIndex >= 0) setActiveShowcase(showcaseIndex);
  };

  const moveShowcase = (direction: number) => {
    if (propertyShowcases.length === 0) return;
    setActiveShowcase((current) => (current + direction + propertyShowcases.length) % propertyShowcases.length);
  };

  const handleMediaPointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const media = mediaRef.current;
    if (!media) return;
    const bounds = media.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    media.style.setProperty('--hero-shift-x', `${x}px`);
    media.style.setProperty('--hero-shift-y', `${y}px`);
  };

  const resetMediaPointer = () => {
    mediaRef.current?.style.setProperty('--hero-shift-x', '0px');
    mediaRef.current?.style.setProperty('--hero-shift-y', '0px');
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[color:var(--bg)]">
      <Seo title={pageTitle} description={pageDescription} />

      <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface-solid)]/95 backdrop-blur-md">
        <div className="section-shell flex h-16 items-center justify-between sm:h-20">
          <button type="button" className="flex items-center gap-2.5" aria-label="FindShelta home">
            <FindSheltaLogo size={38} />
            <span className="text-lg font-bold tracking-tight text-[color:var(--text)]">FindShelta</span>
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            <a href="#stays" className="text-sm font-semibold text-[color:var(--text)] hover:text-[color:var(--brand)]">Stays</a>
            <a href="#cities" className="text-sm font-semibold text-[color:var(--text)] hover:text-[color:var(--brand)]">Cities</a>
            <a href="#how-it-works" className="text-sm font-semibold text-[color:var(--text)] hover:text-[color:var(--brand)]">How it works</a>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--text)]" aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={onSignIn} className="hidden px-3 py-2 text-sm font-bold text-[color:var(--text)] sm:block">Sign in</button>
            <button onClick={onGetStarted} className="brand-button px-4 py-2.5 text-sm font-bold sm:px-5">
              <span className="sm:hidden">Join</span><span className="hidden sm:inline">Create account</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[color:var(--brand-strong)] text-white">
          <div className="hero-orbit pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border border-white/10 sm:h-[30rem] sm:w-[30rem]" aria-hidden="true" />
          <div className="section-shell relative pb-12 pt-14 sm:pb-20 sm:pt-20 lg:pt-24">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="hero-reveal text-[clamp(3.25rem,8vw,7.5rem)] font-bold leading-[0.86] tracking-[-0.07em] text-white">
                {pageHeading}
              </h1>
              <p className="hero-reveal hero-reveal-delay-1 mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-xl sm:leading-8">
                Discover quality apartments, see the details that matter, and speak directly with the host.
              </p>
            </div>

            <div className="hero-reveal hero-reveal-delay-2 relative mt-10 min-w-0 bg-white text-slate-950 shadow-[0_28px_80px_rgba(8,24,54,0.28)] sm:mt-14 lg:grid lg:grid-cols-[0.76fr_1.24fr]">
              <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:p-10 xl:p-12">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-blue-700">Find a short stay</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">Where are you going?</h2>
                  </div>
                  <span className="hidden h-11 w-11 items-center justify-center bg-blue-50 text-blue-700 sm:inline-flex">
                    <MapPin className="h-5 w-5" />
                  </span>
                </div>

                <label className="relative mt-7 block min-w-0 border-2 border-slate-900 bg-white px-4 pb-2 pt-6 focus-within:border-blue-700">
                  <span className="absolute left-4 top-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Destination</span>
                  <select value={selectedCity} onChange={(event) => chooseCity(event.target.value)} className="min-w-0 max-w-full appearance-none bg-transparent pr-10 text-lg font-bold text-slate-950 outline-none">
                    {cities.map((city) => <option key={city}>{city}, Nigeria</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />
                </label>

                <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Available destinations">
                  {cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => chooseCity(city)}
                      aria-pressed={selectedCity === city}
                      className={`min-h-11 border px-3 text-sm font-bold transition-colors ${selectedCity === city ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-950'}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <button type="button" onClick={() => onCitySearch(selectedCity)} className="group mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 bg-[color:var(--brand-strong)] px-6 text-base font-bold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                  Show stays in {selectedCity} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                </button>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-700" /> Clear pricing</span>
                  <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-blue-700" /> Direct host contact</span>
                </div>
              </div>

              <div
                ref={mediaRef}
                className="hero-media relative min-h-[390px] overflow-hidden bg-slate-200 sm:min-h-[520px] lg:min-h-[610px]"
                onMouseEnter={() => setCarouselHovered(true)}
                onMouseLeave={() => { setCarouselHovered(false); resetMediaPointer(); }}
                onMouseMove={handleMediaPointerMove}
              >
                {featuredLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm font-bold text-slate-600"><Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-700" /> Loading featured stays…</div>
                ) : showcase ? (
                  <>
                    <div key={showcase.property.id} className="hero-media-layer absolute -inset-3">
                      <img src={showcase.property.images[0]} alt={showcase.property.title} className="hero-media-image h-full w-full object-cover" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-5 pt-32 text-white sm:p-8 sm:pt-44">
                      <div className="flex items-end justify-between gap-5">
                        <div key={showcase.property.id} className="hero-showcase-copy" aria-live="polite">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Featured in {showcase.city}</p>
                          <p className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{showcase.property.title}</p>
                          <p className="mt-2 text-lg font-bold text-white">{formatNightlyPrice(showcase.property.price)}</p>
                          <div className="mt-3 flex items-center gap-4 text-sm font-semibold text-white/80">
                            <span className="inline-flex items-center gap-1.5"><BedDouble className="h-4 w-4" /> {showcase.property.bedrooms ?? '—'} bedrooms</span>
                            <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4" /> {showcase.property.bathrooms ?? '—'} bathrooms</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => onCitySearch(showcase.city)} className="group hidden h-14 w-14 shrink-0 items-center justify-center bg-white text-slate-950 transition hover:bg-blue-50 sm:inline-flex" aria-label={`View stays in ${showcase.city}`}>
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="hero-float-card absolute right-4 top-4 bg-white px-4 py-3 text-slate-950 shadow-lg sm:right-6 sm:top-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Live on FindShelta</p>
                      <p className="mt-1 text-sm font-bold">Real listing details</p>
                    </div>

                    {propertyShowcases.length > 1 && (
                      <div className="absolute left-4 top-4 flex items-center gap-1.5 sm:left-6 sm:top-6">
                        <button type="button" onClick={() => moveShowcase(-1)} className="inline-flex h-10 w-10 items-center justify-center bg-white/95 text-slate-950 shadow-sm transition hover:bg-white" aria-label="Previous featured stay"><ChevronLeft className="h-4 w-4" /></button>
                        <button type="button" onClick={() => moveShowcase(1)} className="inline-flex h-10 w-10 items-center justify-center bg-white/95 text-slate-950 shadow-sm transition hover:bg-white" aria-label="Next featured stay"><ChevronRight className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setCarouselPaused((paused) => !paused)} className="inline-flex h-10 w-10 items-center justify-center bg-white/95 text-slate-950 shadow-sm transition hover:bg-white" aria-label={carouselPaused ? 'Play featured stays' : 'Pause featured stays'}>{carouselPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
                      </div>
                    )}

                    <div className="absolute inset-x-4 bottom-3 flex gap-1.5 sm:inset-x-8 sm:bottom-4" aria-label={`Featured stay ${activeShowcase + 1} of ${propertyShowcases.length}`}>
                      {propertyShowcases.map((item, index) => (
                        <button key={item.property.id} type="button" onClick={() => setActiveShowcase(index)} className="h-1 flex-1 overflow-hidden bg-white/35" aria-label={`Show ${item.property.title} in ${item.city}`}>
                          {index === activeShowcase && <span className="hero-progress block h-full origin-left bg-white" style={{ animationPlayState: carouselPaused || carouselHovered ? 'paused' : 'running' }} />}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 px-8 text-center text-slate-700">
                    <Building2 className="h-9 w-9 text-blue-700" />
                    <p className="mt-4 text-xl font-bold">No featured stays yet</p>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">{featuredError || 'New verified listings from Lagos, Abuja, and Enugu will appear here.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[color:var(--border)] bg-[color:var(--surface-solid)]">
          <div className="section-shell grid divide-y divide-[color:var(--border)] py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-8">
            {[
              ['3 cities', 'Focused coverage in Lagos, Abuja, and Enugu'],
              ['Direct booking', 'Speak to the listing host yourself'],
              ['Clear details', 'Room counts, pricing, and amenities upfront'],
            ].map(([value, label]) => (
              <div key={value} className="px-0 py-5 sm:px-8 sm:py-1 first:pl-0">
                <p className="text-2xl font-bold text-[color:var(--text)]">{value}</p>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="stays" className="section-shell scroll-mt-24 py-16 sm:py-24">
          <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">Available now</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)] sm:text-5xl">Find your next stay</h2>
            </div>
            <button onClick={() => onCitySearch('Lagos')} className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--brand)]">View Lagos stays <ArrowRight className="h-4 w-4" /></button>
          </div>
          <InfiniteShortStayGrid limit={8} />
        </section>

        <section id="cities" className="bg-[color:var(--brand-strong)] py-16 text-white sm:py-24">
          <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-200">Explore by city</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Go where you need to be.</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-blue-100">Dedicated city collections make it quicker to find relevant, available short stays.</p>
            </div>
            <div className="grid border-t border-white/30 sm:grid-cols-2">
              {cities.map((city) => (
                <button key={city} onClick={() => onCitySearch(city)} className="group flex min-h-24 items-center justify-between border-b border-white/30 px-1 text-left sm:px-6 sm:odd:border-r">
                  <span className="text-xl font-bold">{city}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section-shell scroll-mt-24 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">How it works</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)] sm:text-5xl">From search to stay in three steps.</h2>
          </div>
          <div className="mt-12 grid border-t border-[color:var(--border)] md:grid-cols-3">
            {[
              ['01', 'Choose a city', 'Start with the place you are visiting and see only short stays in that city.'],
              ['02', 'Compare the details', 'Review photos, nightly price, room counts, location, and amenities.'],
              ['03', 'Contact the host', 'Use WhatsApp to ask questions, confirm availability, and arrange your booking.'],
            ].map(([number, title, text]) => (
              <article key={number} className="border-b border-[color:var(--border)] py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <p className="text-sm font-bold text-[color:var(--brand)]">{number}</p>
                <h3 className="mt-8 text-2xl font-bold text-[color:var(--text)]">{title}</h3>
                <p className="mt-3 text-base leading-7 text-[color:var(--text-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell pb-16 sm:pb-24">
          <div className="grid gap-6 bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <ShieldCheck className="h-7 w-7 text-blue-300" />
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Ready to find a better short stay?</h2>
              <p className="mt-3 text-base text-slate-300">Create an account to save stays and return to your search anytime.</p>
            </div>
            <button onClick={onGetStarted} className="bg-white px-6 py-4 text-base font-bold text-slate-950 hover:bg-slate-100">Create your account</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
