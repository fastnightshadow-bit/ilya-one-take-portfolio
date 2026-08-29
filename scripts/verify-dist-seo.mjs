import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const dist = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');
const document = new JSDOM(html).window.document;
const publicSiteUrl = 'https://fastnightshadow-bit.github.io/ilya-one-take-portfolio/';
const socialImageUrl = `${publicSiteUrl}social-card.png`;

const expectOne = (selector) => assert.equal(document.querySelectorAll(selector).length, 1, `${selector} must appear exactly once`);
const expectContent = (selector, content) => assert.equal(document.querySelector(selector)?.getAttribute('content'), content, `${selector} content`);
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
];

assert.equal(document.title, 'Илья — веб-разработчик для бизнеса');
expectContent('meta[name="description"]', 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.');
expectContent('meta[property="og:title"]', 'Илья — веб-разработчик для бизнеса');
expectContent('meta[property="og:description"]', 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.');
expectContent('meta[property="og:type"]', 'profile');
expectContent('meta[property="og:locale"]', 'ru_RU');
expectContent('meta[property="og:url"]', publicSiteUrl);
expectContent('meta[property="og:image"]', socialImageUrl);
expectContent('meta[name="twitter:card"]', 'summary_large_image');
expectContent('meta[name="twitter:title"]', 'Илья — веб-разработчик для бизнеса');
expectContent('meta[name="twitter:description"]', 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.');
expectContent('meta[name="twitter:image"]', socialImageUrl);
ownedMetadataSelectors.forEach(expectOne);
expectOne('link[rel="stylesheet"]');
assert.equal(document.querySelector('link[rel="canonical"]')?.getAttribute('href'), publicSiteUrl, 'canonical URL');
assert.equal(document.querySelector('link[rel="icon"]')?.getAttribute('href'), './favicon.svg', 'relative favicon URL');
assert.doesNotMatch(html, /(?:src|href)="\/(?:assets\/|favicon\.svg|social-card\.png)/, 'owned build assets must not use origin-root URLs');
for (const element of document.querySelectorAll('[src], [srcset]')) {
  const src = element.getAttribute('src');
  if (src) assert.ok(!src.startsWith('/assets/'), `${element.tagName} src must not use /assets/: ${src}`);
  const srcset = element.getAttribute('srcset');
  if (srcset) assert.ok(!srcset.split(',').some((candidate) => candidate.trim().startsWith('/assets/')), `${element.tagName} srcset must not use /assets/: ${srcset}`);
}

const person = JSON.parse(document.querySelector('script[data-seo-person-jsonld]')?.textContent ?? '{}');
assert.deepEqual(person, {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Илья',
  jobTitle: 'Веб-разработчик',
  url: publicSiteUrl,
  sameAs: ['https://t.me/girtopw', 'https://github.com/fastnightshadow-bit'],
});

await access(new URL('favicon.svg', dist));
await access(new URL('robots.txt', dist));
await access(new URL('social-card.png', dist));
await access(new URL('assets/portrait/portrait-720.avif', dist));
await access(new URL('assets/projects/pivnoy-doner-desktop-720.webp', dist));
await access(new URL('sitemap.xml', dist));

const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
const robots = await readFile(new URL('robots.txt', dist), 'utf8');
assert.match(sitemap, new RegExp(`<loc>${publicSiteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`), 'sitemap canonical URL');
assert.equal((sitemap.match(/<url>/g) ?? []).length, 1, 'sitemap contains exactly one URL');
assert.match(robots, new RegExp(`Sitemap: ${publicSiteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}sitemap\\.xml`), 'robots sitemap URL');

console.log('dist SEO metadata verified');
