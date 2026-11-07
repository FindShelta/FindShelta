import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
}

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const Seo: React.FC<SeoProps> = ({ title, description, keywords = [], canonicalPath }) => {
  useEffect(() => {
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    if (keywords.length > 0) {
      upsertMeta('name', 'keywords', keywords.join(', '));
    }

    if (canonicalPath) {
      const canonicalUrl = new URL(canonicalPath, window.location.origin).toString();
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
      upsertMeta('property', 'og:url', canonicalUrl);
    }
  }, [canonicalPath, description, keywords, title]);

  return null;
};

export default Seo;
