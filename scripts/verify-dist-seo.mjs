import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const dist = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');
const document = new JSDOM(html).window.document;

const expectOne = (selector) => assert.equal(document.querySelectorAll(selector).length, 1, `${selector} must appear exactly once`);
const expectContent = (selector, content) => assert.equal(document.querySelector(selector)?.getAttribute('content'), content, `${selector} content`);
const ownedMetadataSelectors = [
  'title',
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:type"]',
  'meta[property="og:locale"]',
  'meta[property="og:image"]',
  'meta[property="og:image:width"]',
  'meta[property="og:image:height"]',
  'meta[property="og:image:alt"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
  'link[rel="icon"]',
  'script[data-seo-person-jsonld]',
];

assert.equal(document.title, 'Илья — веб-разработчик для бизнеса');
expectContent('meta[name="description"]', 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.');
expectContent('meta[property="og:title"]', 'Илья — веб-разработчик для бизнеса');
expectContent('meta[property="og:description"]', 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.');
expectContent('meta[property="og:type"]', 'profile');
expectContent('meta[property="og:locale"]', 'ru_RU');
expectContent('meta[property="og:image"]', '/social-card.png');
expectContent('meta[name="twitter:card"]', 'summary_large_image');
expectContent('meta[name="twitter:title"]', 'Илья — веб-разработчик для бизнеса');
expectContent('meta[name="twitter:description"]', 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.');
expectContent('meta[name="twitter:image"]', '/social-card.png');
ownedMetadataSelectors.forEach(expectOne);
expectOne('link[rel="stylesheet"]');
assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 0, 'canonical is deferred until a public domain exists');
assert.equal(document.querySelectorAll('meta[property="og:url"]').length, 0, 'og:url is deferred until a public domain exists');

const person = JSON.parse(document.querySelector('script[data-seo-person-jsonld]')?.textContent ?? '{}');
assert.deepEqual(person, {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Илья',
  jobTitle: 'Веб-разработчик',
  sameAs: ['https://t.me/girtopw', 'https://github.com/fastnightshadow-bit'],
});

await access(new URL('favicon.svg', dist));
await access(new URL('robots.txt', dist));
await assert.rejects(access(new URL('sitemap.xml', dist)));

console.log('dist SEO metadata verified');
