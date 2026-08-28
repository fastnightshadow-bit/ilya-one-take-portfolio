import type { SiteContent } from '../content/siteContent.ts';

const title = 'Илья — веб-разработчик для бизнеса';
const description = 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.';
const socialImagePath = '/social-card.png';
const socialImageAlt = 'Портфолио веб-разработчика Ильи';

type MetadataAttribute = 'name' | 'property';

interface MetadataTag {
  readonly attribute: MetadataAttribute;
  readonly key: string;
  readonly content: string;
}

function metadataTags(imageUrl: string): readonly MetadataTag[] {
  return [
    { attribute: 'name', key: 'description', content: description },
    { attribute: 'property', key: 'og:title', content: title },
    { attribute: 'property', key: 'og:description', content: description },
    { attribute: 'property', key: 'og:type', content: 'profile' },
    { attribute: 'property', key: 'og:locale', content: 'ru_RU' },
    { attribute: 'property', key: 'og:image', content: imageUrl },
    { attribute: 'property', key: 'og:image:width', content: '1200' },
    { attribute: 'property', key: 'og:image:height', content: '630' },
    { attribute: 'property', key: 'og:image:alt', content: socialImageAlt },
    { attribute: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { attribute: 'name', key: 'twitter:title', content: title },
    { attribute: 'name', key: 'twitter:description', content: description },
    { attribute: 'name', key: 'twitter:image', content: imageUrl },
  ];
}

function personJsonLd(content: SiteContent): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Илья',
    jobTitle: 'Веб-разработчик',
    sameAs: [content.telegramUrl],
  }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function upsertMeta(document: Document, tag: MetadataTag): void {
  const selector = `meta[${tag.attribute}="${tag.key}"]`;
  const [element, ...duplicates] = [...document.head.querySelectorAll<HTMLMetaElement>(selector)];
  duplicates.forEach((duplicate) => duplicate.remove());

  const meta = element ?? document.createElement('meta');
  meta.setAttribute(tag.attribute, tag.key);
  meta.content = tag.content;
  if (!element) document.head.append(meta);
}

function upsertFavicon(document: Document): void {
  const [element, ...duplicates] = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')];
  duplicates.forEach((duplicate) => duplicate.remove());

  const icon = element ?? document.createElement('link');
  icon.rel = 'icon';
  icon.href = '/favicon.svg';
  icon.type = 'image/svg+xml';
  if (!element) document.head.append(icon);
}

function upsertPersonJsonLd(document: Document, content: SiteContent): void {
  const [element, ...duplicates] = [...document.head.querySelectorAll<HTMLScriptElement>('script[data-seo-person-jsonld]')];
  duplicates.forEach((duplicate) => duplicate.remove());

  const script = element ?? document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.seoPersonJsonld = '';
  script.textContent = personJsonLd(content);
  if (!element) document.head.append(script);
}

function socialImageUrl(document: Document): string {
  const href = document.location.href;
  const base = href.startsWith('http://') || href.startsWith('https://') ? href : 'http://localhost/';
  return new URL(socialImagePath, base).href;
}

export function renderMetadataMarkup(content: SiteContent): string {
  const tags = metadataTags(socialImagePath)
    .map((tag) => `<meta ${tag.attribute}="${tag.key}" content="${escapeAttribute(tag.content)}" />`)
    .join('\n    ');

  return `<title>${title}</title>
    ${tags}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <script type="application/ld+json" data-seo-person-jsonld>${personJsonLd(content)}</script>`;
}

export function applyMetadata(document: Document, content: SiteContent): void {
  document.title = title;
  metadataTags(socialImageUrl(document)).forEach((tag) => upsertMeta(document, tag));
  upsertFavicon(document);
  upsertPersonJsonLd(document, content);
}
