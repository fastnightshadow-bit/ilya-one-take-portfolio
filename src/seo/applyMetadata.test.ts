import { beforeEach, describe, expect, it } from 'vitest';
import { siteContent } from '../content/siteContent.ts';
import { applyMetadata, renderMetadataMarkup } from './applyMetadata.ts';

const description = 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.';

describe('portfolio metadata', () => {
  beforeEach(() => {
    document.head.replaceChildren();
    document.title = '';
  });

  it('sets title, Russian description, social tags, favicon, and Person JSON-LD without a fake canonical', () => {
    applyMetadata(document, siteContent);

    expect(document.title).toBe('Илья — веб-разработчик для бизнеса');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(description);
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(document.title);
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(description);
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('profile');
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('ru_RU');
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toMatch(/\/social-card\.png$/);
    expect(document.querySelector('meta[property="og:image:width"]')?.getAttribute('content')).toBe('1200');
    expect(document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')).toBe('630');
    expect(document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content')).toBe('Портфолио веб-разработчика Ильи');
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(document.title);
    expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe(description);
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toMatch(/\/social-card\.png$/);
    expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.svg');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();

    const jsonLd = JSON.parse(document.querySelector('script[data-seo-person-jsonld]')?.textContent ?? '{}');
    expect(jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Илья',
      jobTitle: 'Веб-разработчик',
      sameAs: ['https://t.me/girtopw'],
    });
  });

  it('upserts metadata and JSON-LD without duplicate SEO nodes', () => {
    document.head.innerHTML = renderMetadataMarkup(siteContent);
    applyMetadata(document, siteContent);
    applyMetadata(document, siteContent);

    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[name="twitter:card"]')).toHaveLength(1);
    expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(1);
    expect(document.querySelectorAll('script[data-seo-person-jsonld]')).toHaveLength(1);
  });

  it('renders crawler-visible relative social metadata with one Person JSON-LD block', () => {
    const staticDocument = document.implementation.createHTMLDocument('static SEO');
    staticDocument.head.innerHTML = renderMetadataMarkup(siteContent);

    expect(staticDocument.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('/social-card.png');
    expect(staticDocument.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('/social-card.png');
    expect(staticDocument.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(staticDocument.querySelectorAll('meta[name="twitter:title"]')).toHaveLength(1);
    expect(staticDocument.querySelectorAll('script[data-seo-person-jsonld]')).toHaveLength(1);
    expect(staticDocument.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
