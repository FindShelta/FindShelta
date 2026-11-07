import { ArrowDown, ArrowRight, Check, MapPin, Moon, Sun } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Seo from '../common/Seo';
import FindSheltaLogo from '../common/FindShelterLogo';
import InfiniteShortStayGrid from '../Properties/InfiniteShortStayGrid';

const cityDescriptions: Record<string, string> = {
  lagos: 'Browse premium short stay apartments in Lagos, from Lekki to Victoria Island, and book directly with FindShelta hosts.',
  calabar: 'Discover comfortable short stay apartments in Calabar for holidays, business trips, and memorable weekend escapes.',
  abuja: 'Find secure, stylish short stay apartments in Abuja for work trips, city breaks, and extended stays.',
};

const cityImages: Record<string, string> = {
  lagos: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1400',
  calabar: 'https://images.pexels.com/photos/7031408/pexels-photo-7031408.jpeg?auto=compress&cs=tinysrgb&w=1400',
  abuja: 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

const toTitleCase = (value: string) =>
  value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');

const CityLandingPage: React.FC = () => {
  const { city = '' } = useParams();
  const { isDark, toggleTheme } = useTheme();
  const cityKey = city.toLowerCase();
  const cityName = toTitleCase(city);
  const description = cityDescriptions[cityKey] || `Explore available short stay apartments in ${cityName} and contact a FindShelta host directly to book.`;
  const image = cityImages[cityKey] || cityImages.lagos;

  return (
    <div className="min-h-screen bg-[color:var(--bg)]">
      <Seo title={`Short Stay Apartments in ${cityName} | FindShelta`} description={description} />

      <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface-solid)]/95 backdrop-blur-md">
        <div className="section-shell flex h-16 items-center justify-between sm:h-20">
          <Link to="/" className="flex items-center gap-2.5" aria-label="FindShelta home">
            <FindSheltaLogo size={38} />
            <span className="text-lg font-bold tracking-tight text-[color:var(--text)]">FindShelta</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden px-3 py-2 text-sm font-semibold text-[color:var(--text)] sm:block">All cities</Link>
            <button onClick={toggleTheme} className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--text)]" aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/login" className="brand-button px-4 py-2.5 text-sm font-bold sm:px-5">Sign in</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="grid min-h-[620px] lg:grid-cols-2">
          <div className="flex items-center bg-[color:var(--brand-strong)] px-5 py-14 text-white sm:px-10 lg:px-[max(2.5rem,calc((100vw-80rem)/2))] lg:py-20">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-blue-200"><MapPin className="h-4 w-4" /> {cityName}, Nigeria</p>
              <h1 className="mt-5 text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Short Stay Apartments in {cityName}</h1>
              <p className="mt-6 text-lg leading-8 text-blue-100">{description}</p>
              <a href="#available-stays" className="mt-8 inline-flex min-h-14 items-center gap-3 bg-white px-6 py-3 text-base font-bold text-slate-950 hover:bg-blue-50">
                View available stays <ArrowDown className="h-5 w-5" />
              </a>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-blue-100">
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> Clear nightly pricing</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> Direct host contact</span>
              </div>
            </div>
          </div>
          <div className="relative min-h-[420px] bg-slate-200 lg:min-h-full">
            <img src={image} alt={`Furnished short stay apartment in ${cityName}`} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </section>

        <section id="available-stays" className="section-shell scroll-mt-24 py-16 sm:py-24">
          <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">Available in {cityName}</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)] sm:text-5xl">Choose a place that fits.</h2>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--brand)]">Explore another city <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <InfiniteShortStayGrid
            city={cityName}
            emptyTitle={`Coming soon to ${cityName}`}
            emptyMessage={`We’re onboarding quality short stays in ${cityName}. Create an account to save your search and check back soon.`}
          />
        </section>

        <section className="border-y border-[color:var(--border)] bg-[color:var(--surface-solid)]">
          <div className="section-shell grid gap-8 py-12 sm:grid-cols-[1fr_auto] sm:items-center sm:py-16">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.035em] text-[color:var(--text)]">Need help choosing a stay?</h2>
              <p className="mt-2 text-base text-[color:var(--text-muted)]">Open a listing and contact the host directly on WhatsApp.</p>
            </div>
            <a href="#available-stays" className="brand-button inline-flex min-h-14 items-center justify-center gap-2 px-6 text-base font-bold">Browse {cityName} stays <ArrowRight className="h-5 w-5" /></a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CityLandingPage;
