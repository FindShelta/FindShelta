import { ArrowDown, ArrowRight, Check, MapPin, Moon, Sun } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Seo from '../common/Seo';
import FindSheltaLogo from '../common/FindShelterLogo';
import InfiniteShortStayGrid from '../Properties/InfiniteShortStayGrid';

const cityImages: Record<string, string> = {
  lagos: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1400',
  abuja: 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=1400',
  enugu: 'https://images.pexels.com/photos/7031601/pexels-photo-7031601.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

interface CityContent {
  name: string;
  title: string;
  headline: string;
  description: string;
  intro: string;
  cta: string;
  keywords: string[];
  benefits: string[];
  neighbourhoods: Array<{ name: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

const cityContent: Record<string, CityContent> = {
  enugu: {
    name: 'Enugu',
    title: 'Short Stay Apartments in Enugu — Book Without an Agent',
    headline: 'Your Enugu escape, ready when you are.',
    description: 'Find quality short stay apartments in Enugu with flexible daily and weekly rates. Compare listings and contact hosts directly on FindShelta.',
    intro: 'Comfortable furnished apartments for work trips, family visits, and easy weekend escapes.',
    cta: 'Browse Enugu stays',
    keywords: ['short stay apartments Enugu', 'Enugu short let', 'serviced apartment Enugu', 'furnished apartments Enugu short let'],
    benefits: ['Approved listings', 'Flexible stays', 'Direct host contact', 'Clear pricing'],
    neighbourhoods: [
      { name: 'GRA Enugu', description: 'A central, established area with convenient access to business and leisure spots.' },
      { name: 'Independence Layout', description: 'A well-connected neighbourhood suited to work trips and longer visits.' },
      { name: 'New Haven', description: 'A lively city base with shops, restaurants, and everyday essentials nearby.' },
      { name: 'Trans Ekulu', description: 'A quieter residential option for guests who want a relaxed stay.' },
    ],
    faqs: [
      { question: 'How much is a short stay apartment in Enugu?', answer: 'Nightly prices vary by location, size, and amenities. Each FindShelta listing shows its current nightly rate so you can compare before contacting the host.' },
      { question: 'Can I book for two nights?', answer: 'Stay requirements are set by each host. Open a listing and contact the host directly to confirm your dates and minimum stay.' },
      { question: 'Do I need to pay an agent?', answer: 'No agent is needed to browse FindShelta. You contact the listing host directly to ask questions and arrange your stay.' },
    ],
  },
  abuja: {
    name: 'Abuja',
    title: 'Short Stay Apartments in Abuja — Premium, Direct, Flexible',
    headline: 'Abuja’s finest short stays, at your fingertips.',
    description: 'Browse quality short stay apartments in Abuja, including Maitama, Wuse, Garki, and Jabi. Compare daily and weekly rates on FindShelta.',
    intro: 'Furnished apartments for executives, families, event guests, and travellers who want more room than a hotel.',
    cta: 'Explore Abuja stays',
    keywords: ['short stay apartments Abuja', 'Abuja short let', 'serviced apartment Abuja', 'short stay Maitama Abuja', 'short stay Wuse Abuja'],
    benefits: ['Direct host contact', 'Transparent pricing', 'Approved properties', 'Daily and weekly options'],
    neighbourhoods: [
      { name: 'Maitama', description: 'A premium district close to embassies, offices, and many of Abuja’s key destinations.' },
      { name: 'Wuse 2', description: 'A busy, central base for dining, meetings, shopping, and city life.' },
      { name: 'Garki', description: 'A practical location for government, business, and event travel.' },
      { name: 'Jabi', description: 'A modern neighbourhood with convenient links to the airport road and city centre.' },
      { name: 'Asokoro', description: 'A calm, well-positioned district suited to executive and diplomatic stays.' },
      { name: 'Utako', description: 'A connected option for guests who value easy movement around the city.' },
    ],
    faqs: [
      { question: 'How do I book a short stay in Abuja?', answer: 'Browse available Abuja listings, compare the details, then use the contact option on the listing to confirm availability directly with the host.' },
      { question: 'Which Abuja areas have short stays?', answer: 'FindShelta listings may include Maitama, Wuse, Garki, Jabi, Asokoro, Utako, and other available Abuja neighbourhoods.' },
      { question: 'Can I stay for a week?', answer: 'Many hosts support flexible stays. Contact the host from the listing page to confirm weekly availability and the final rate.' },
    ],
  },
  lagos: {
    name: 'Lagos',
    title: 'Short Stay Apartments in Lagos — Lekki, VI, Ikoyi & More',
    headline: 'Lagos living, on your terms.',
    description: 'Find quality short stay apartments in Lagos, including Lekki, Victoria Island, Ikoyi, and Ajah. Compare daily or weekly stays on FindShelta.',
    intro: 'Furnished short stays across Lagos Island and Mainland, with the details you need before you contact a host.',
    cta: 'Find Lagos stays',
    keywords: ['short stay apartments Lagos', 'Lagos short let', 'serviced apartment Lagos', 'Lekki short stay apartment', 'VI short let Lagos', 'Ikoyi short stay'],
    benefits: ['Approved listings', 'Direct host contact', 'Flexible stays', 'Clear property details'],
    neighbourhoods: [
      { name: 'Lekki', description: 'A popular base for beaches, restaurants, nightlife, and business across the peninsula.' },
      { name: 'Victoria Island', description: 'A central choice for corporate travel, events, dining, and Lagos nightlife.' },
      { name: 'Ikoyi', description: 'A premium, quieter location close to the commercial heart of Lagos.' },
      { name: 'Ajah', description: 'A growing part of the city with spacious stays and access to the Lekki corridor.' },
      { name: 'Surulere', description: 'A well-connected Mainland option for events, work, and local city life.' },
      { name: 'Yaba', description: 'A lively Mainland hub with easy access to technology, education, and commercial districts.' },
    ],
    faqs: [
      { question: 'Which Lagos areas have the best short stays?', answer: 'The right area depends on your plans. Lekki, Victoria Island, and Ikoyi are convenient for Island activities, while Yaba and Surulere can work well for Mainland trips.' },
      { question: 'How do I book without an agent on FindShelta?', answer: 'Choose a listing and contact the host directly through its listing page to ask questions, confirm availability, and arrange your stay.' },
      { question: 'Can I book for just two nights in Lagos?', answer: 'Minimum stays vary by host. Check the listing details and contact the host to confirm your dates.' },
    ],
  },
};

const CityLandingPage: React.FC = () => {
  const { city = '' } = useParams();
  const { isDark, toggleTheme } = useTheme();
  const cityKey = city.toLowerCase();
  const content = cityContent[cityKey];
  const image = cityImages[cityKey] || cityImages.lagos;

  if (!content) return <Navigate to="/" replace />;

  const cityName = content.name;

  return (
    <div className="min-h-screen bg-[color:var(--bg)]">
      <Seo
        title={`${content.title} | FindShelta`}
        description={content.description}
        keywords={content.keywords}
        canonicalPath={`/short-stay-${cityKey}`}
      />

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
              <h1 className="mt-5 font-bold">
                <span className="block text-sm uppercase tracking-[0.14em] text-blue-200">Short stay apartments in {cityName}</span>
                <span className="mt-4 block text-5xl leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{content.headline}</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-blue-100">{content.intro}</p>
              <a href="#available-stays" className="mt-8 inline-flex min-h-14 items-center gap-3 bg-white px-6 py-3 text-base font-bold text-slate-950 hover:bg-blue-50">
                {content.cta} <ArrowDown className="h-5 w-5" />
              </a>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-blue-100">
                {content.benefits.slice(0, 2).map((benefit) => (
                  <span key={benefit} className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> {benefit}</span>
                ))}
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
          <div className="section-shell py-16 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">Why FindShelta</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)] sm:text-5xl">A clearer way to find a stay.</h2>
            </div>
            <div className="mt-10 grid border-t border-[color:var(--border)] sm:grid-cols-2 lg:grid-cols-4">
              {content.benefits.map((benefit, index) => (
                <div key={benefit} className="border-b border-[color:var(--border)] py-7 sm:px-6 sm:odd:border-r lg:border-r lg:odd:border-r lg:first:pl-0 lg:last:border-r-0">
                  <p className="text-xs font-bold text-[color:var(--brand)]">0{index + 1}</p>
                  <p className="mt-5 text-xl font-bold text-[color:var(--text)]">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell py-16 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">Popular neighbourhoods</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)] sm:text-5xl">Stay close to what matters.</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[color:var(--text-muted)]">Explore available short stays across well-known parts of {cityName}. Listing availability changes as hosts add new properties.</p>
            </div>
            <div className="grid border-t border-[color:var(--border)] sm:grid-cols-2">
              {content.neighbourhoods.map((area) => (
                <article key={area.name} className="border-b border-[color:var(--border)] py-6 sm:px-6 sm:odd:border-r">
                  <h3 className="text-xl font-bold text-[color:var(--text)]">{area.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{area.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[color:var(--border)] bg-[color:var(--surface-solid)]">
          <div className="section-shell grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">Good to know</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)] sm:text-5xl">{cityName} short stay FAQs.</h2>
            </div>
            <div className="border-t border-[color:var(--border)]">
              {content.faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-[color:var(--border)] py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-bold text-[color:var(--text)] marker:content-none">
                    {faq.question}
                    <span className="text-2xl font-medium text-[color:var(--brand)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-2xl pt-4 text-base leading-7 text-[color:var(--text-muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
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
