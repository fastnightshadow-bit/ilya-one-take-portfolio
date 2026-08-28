import { describe, expect, it } from 'vitest';
import { siteContent } from '../content/siteContent.ts';
import { createSite } from './createSite.ts';

describe('createSite', () => {
  it('renders the approved story in order', () => {
    const site = createSite(siteContent);
    document.body.replaceChildren(site);

    expect([...document.querySelectorAll<HTMLElement>('[data-scene]')].map((node) => node.dataset.scene)).toEqual([
      'hero', 'about', 'pivnoy-doner', 'driving-school', 'telegram-shop', 'contact',
    ]);
    expect(document.querySelectorAll('[data-project]')).toHaveLength(3);
    expect(document.querySelector('h1')?.textContent).toContain('Сайты, которые');
  });

  it('renders all three primary contacts as safe Telegram links', () => {
    const site = createSite(siteContent);
    const links = [...site.querySelectorAll<HTMLAnchorElement>('[data-primary-cta]')];
    const finalHandle = site.querySelector<HTMLAnchorElement>('.contact__handle');

    expect(links).toHaveLength(3);
    expect(links.every((link) => link.href === 'https://t.me/girtopw')).toBe(true);
    expect(links.every((link) => !link.hasAttribute('target'))).toBe(true);
    expect(finalHandle?.tagName).toBe('A');
    expect(finalHandle?.textContent?.trim()).toBe('@girtopw');
    expect(finalHandle?.href).toBe('https://t.me/girtopw');
  });

  it('renders the approved title for every case chapter', () => {
    const site = createSite(siteContent);

    const headings = [...site.querySelectorAll<HTMLElement>('[data-project] h2')];
    const headlines = [...site.querySelectorAll<HTMLElement>('[data-project] .case__headline')];

    expect(headings.map((heading) => heading.textContent?.trim())).toEqual(siteContent.projects.map((project) => project.title));
    expect(headlines.map((headline) => headline.textContent?.trim())).toEqual(
      siteContent.projects.map((project) => `${project.headline} ${project.accent}`),
    );
  });

  it('delivers the below-fold portrait responsively without high-priority loading', () => {
    const site = createSite(siteContent);
    const portrait = site.querySelector<HTMLPictureElement>('.about__portrait');
    const sources = [...(portrait?.querySelectorAll('source') ?? [])];
    const image = portrait?.querySelector('img');

    expect(sources.map((source) => ({ type: source.getAttribute('type'), sizes: source.getAttribute('sizes') }))).toEqual([
      { type: 'image/avif', sizes: '(max-width: 700px) 98vw, 47vw' },
      { type: 'image/webp', sizes: '(max-width: 700px) 98vw, 47vw' },
    ]);
    expect(image?.getAttribute('sizes')).toBe('(max-width: 700px) 98vw, 47vw');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.getAttribute('decoding')).toBe('async');
    expect(image?.getAttribute('fetchpriority')).toBeNull();
  });

  it('renders every hero idea as stable semantic fallback content', () => {
    const site = createSite(siteContent);
    const heading = site.querySelector<HTMLElement>('#hero-title');
    const fallback = site.querySelector<HTMLElement>('[data-hero-fallback]');
    const rotatingWord = site.querySelector<HTMLElement>('[data-rotating-word]');

    expect(heading?.hasAttribute('aria-label')).toBe(false);
    expect(fallback?.getAttribute('aria-hidden')).toBeNull();
    expect(fallback?.textContent?.trim().replace(/\s+/g, ' ')).toBe(siteContent.rotatingWords.join(' '));
    for (const word of siteContent.rotatingWords) expect(heading?.textContent).toContain(word);
    expect(rotatingWord?.getAttribute('aria-hidden')).toBe('true');
    expect(rotatingWord?.textContent).toBe(siteContent.rotatingWords[0]);
  });

  it('renders clean typographic story handoffs without detached ornaments or captions', () => {
    const site = createSite(siteContent);

    expect(site.querySelectorAll('[data-transition]')).toHaveLength(5);
    expect(site.querySelectorAll('[data-transition] strong')).toHaveLength(5);
    expect(site.querySelectorAll('[data-transition-carrier]')).toHaveLength(0);
    expect(site.querySelectorAll('[data-transition] small')).toHaveLength(0);
  });

  it('keeps project metadata descriptive without redundant project counters', () => {
    const site = createSite(siteContent);
    const projectMetadata = [...site.querySelectorAll<HTMLElement>('[data-project] .scene__meta')];

    expect(projectMetadata).toHaveLength(3);
    expect(projectMetadata.every((metadata) => metadata.children.length === 1)).toBe(true);
    expect(projectMetadata.every((metadata) => !/\bproject\b/i.test(metadata.textContent ?? ''))).toBe(true);
  });

  it('replaces the portrait scribble and school sticker with purposeful visuals', () => {
    const site = createSite(siteContent);
    const promise = site.querySelector<HTMLElement>('[data-about-promise]');

    expect(site.querySelector('.about__scribble')).toBeNull();
    expect(promise?.textContent?.trim().replace(/\s+/g, ' ')).toBe('ОДИН ЧЕЛОВЕК. ВЕСЬ САЙТ.');
    expect(promise?.getAttribute('aria-hidden')).toBeNull();
    expect(site.querySelector('.school-road')).not.toBeNull();
    expect(site.querySelector('.school-sign')).toBeNull();
  });
});
