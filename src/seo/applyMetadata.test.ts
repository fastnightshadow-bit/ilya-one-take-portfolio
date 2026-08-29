import { beforeEach, describe, expect, it } from 'vitest';
import { siteContent } from '../content/siteContent.ts';
import { applyMetadata, renderMetadataMarkup } from './applyMetadata.ts';

const description = 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.';
const publicSiteUrl = 'https://fastnightshadow-bit.github.io/ilya-one-take-portfolio/';
const socialImageUrl = `${publicSiteUrl}social-card.png`;
const ownedMetadataSelectors = [
  'title',
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:type"]',
  'meta[property="og:locale"]',
  'meta[property="og:url"]',
  'meta[property="og:image"]',
  'meta[property="og:image:width"]',
  'meta[property="og:image:height"]',
  'meta[property="og:image:alt"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
  'link[rel="canonical"]',
  'link[rel="icon"]',
  'script[data-seo-person-jsonld]',
] as const;

describe('portfolio metadata', () => {
  beforeEach(() => {
    document.head.replaceChildren();
    document.title = '';
  });

  it('sets exact public canonical, social metadata, favicon, and Person JSON-LD', () => {
    applyMetadata(document, siteContent);

    expect(document.title).toBe('Илья — веб-разработчик для бизнеса');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(description);
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(document.title);
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(description);
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('profile');
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('ru_RU');
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(publicSiteUrl);
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(socialImageUrl);
    expect(document.querySelector('meta[property="og:image:width"]')?.getAttribute('content')).toBe('1200');
    expect(document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')).toBe('630');
    expect(document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content')).toBe('Портфолио веб-разработчика Ильи');
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(document.title);
    expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe(description);
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(socialImageUrl);
    expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('./favicon.svg');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(publicSiteUrl);

    const jsonLd = JSON.parse(document.querySelector('script[data-seo-person-jsonld]')?.textContent ?? '{}');
    expect(jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Илья',
      jobTitle: 'Веб-разработчик',
      url: publicSiteUrl,
      sameAs: ['https://t.me/girtopw', 'https://github.com/fastnightshadow-bit'],
    });
  });

  it('upserts metadata and JSON-LD without duplicate SEO nodes', () => {
    document.head.innerHTML = renderMetadataMarkup(siteContent);
    applyMetadata(document, siteContent);
    applyMetadata(document, siteContent);

    for (const selector of ownedMetadataSelectors) expect(document.head.querySelectorAll(selector)).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[property="og:url"]')).toHaveLength(1);
  });

  it('renders crawler-visible absolute public metadata with one Person JSON-LD block', () => {
    const staticDocument = document.implementation.createHTMLDocument('static SEO');
    staticDocument.head.innerHTML = renderMetadataMarkup(siteContent);

    expect(staticDocument.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(publicSiteUrl);
    expect(staticDocument.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(socialImageUrl);
    expect(staticDocument.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(socialImageUrl);
    expect(staticDocument.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(staticDocument.querySelectorAll('meta[name="twitter:title"]')).toHaveLength(1);
    expect(staticDocument.querySelectorAll('script[data-seo-person-jsonld]')).toHaveLength(1);
    expect(staticDocument.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(publicSiteUrl);
    expect(staticDocument.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('./favicon.svg');
  });
});
