import { Building2, Home, MapPin, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname.startsWith('/short-stay-');

  if (!isPublicRoute) return null;

  const items = [
    { label: 'Home', href: '/', icon: Home, active: location.pathname === '/' },
    { label: 'Lagos', href: '/short-stay-lagos', icon: Building2, active: location.pathname === '/short-stay-lagos' },
    { label: 'Calabar', href: '/short-stay-calabar', icon: MapPin, active: location.pathname === '/short-stay-calabar' },
    { label: 'Account', href: '/login', icon: UserRound, active: false },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
      <div className="mobile-bottom-nav__inner">
        {items.map(({ label, href, icon: Icon, active }) => (
          <Link key={label} to={href} className={`mobile-bottom-nav__item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
            <span className="mobile-bottom-nav__icon"><Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2} /></span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
