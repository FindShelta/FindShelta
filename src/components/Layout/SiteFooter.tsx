import FindSheltaLogo from '../common/FindShelterLogo';

const SiteFooter: React.FC = () => (
  <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
    <div className="section-shell flex flex-col gap-3 pb-28 pt-7 text-sm text-[color:var(--text-muted)] sm:flex-row sm:items-center sm:justify-between sm:py-7">
      <a href="/" className="flex items-center gap-2 font-bold text-[color:var(--text)]" aria-label="FindShelta home">
        <FindSheltaLogo size={34} /> FindShelta
      </a>
      <p>Premium short stays across Nigeria.</p>
    </div>
  </footer>
);

export default SiteFooter;
