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

  it('renders every primary contact as the approved Telegram URL', () => {
    const site = createSite(siteContent);
    const links = [...site.querySelectorAll<HTMLAnchorElement>('[data-primary-cta]')];
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links.every((link) => link.href === 'https://t.me/girtopw')).toBe(true);
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
});
