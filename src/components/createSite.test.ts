import { describe, expect, it } from 'vitest';
import { siteContent } from '../content/siteContent.ts';
import { createSite } from './createSite.ts';

describe('createSite', () => {
  it('renders the approved story in order', () => {
    const site = createSite(siteContent);
    document.body.replaceChildren(site);

    expect([...document.querySelectorAll<HTMLElement>('[data-scene]')].map((node) => node.dataset.scene)).toEqual([
      'hero', 'about', 'pivnoy-doner', 'driving-school', 'shaurma-mobile', 'telegram-shop', 'contact',
    ]);
    expect(document.querySelectorAll('[data-project]')).toHaveLength(4);
    expect(document.querySelector('h1')?.textContent).toContain('Сайты, которые');
  });

  it('renders real project media, clean Russian actions, and a single GitHub profile link', () => {
    const site = createSite(siteContent);
    const projectLinks = [...site.querySelectorAll<HTMLAnchorElement>('[data-project-action]')];
    const projectImages = [...site.querySelectorAll<HTMLImageElement>('[data-project-media] img')];
    const schoolMedia = site.querySelector<HTMLElement>('[data-scene="driving-school"] [data-project-media]');
    const githubLinks = [...site.querySelectorAll<HTMLAnchorElement>('[data-github-link]')];
    const githubLink = githubLinks[0];

    expect(projectLinks.map((link) => ({ text: link.textContent?.trim(), href: link.href }))).toEqual([
      { text: 'Открыть сайт', href: 'https://pivdoner.ru/' },
      { text: 'Открыть сайт', href: 'https://perekrestok-yaroslavl.netlify.app/' },
      { text: 'Открыть сайт', href: 'https://fastnightshadow-bit.github.io/chaurma/' },
      { text: 'Открыть магазин', href: 'https://t.me/veachelsell_bot' },
    ]);
    expect(site.querySelectorAll('[data-project-media]')).toHaveLength(4);
    expect(projectImages).toHaveLength(6);
    expect([...site.querySelectorAll('[data-project]')].map((project) =>
      [...project.querySelectorAll<HTMLElement>('[data-project-shot]')].map((shot) => shot.dataset.projectShot),
    )).toEqual([
      ['desktop', 'mobile'],
      ['mobile', 'desktop'],
      ['mobile'],
      ['mobile'],
    ]);
    expect(projectImages.every((image) => Boolean(image.alt.trim()))).toBe(true);
    expect(projectImages.every((image) => image.getAttribute('loading') === 'lazy' && image.getAttribute('decoding') === 'async')).toBe(true);
    expect(projectImages.every((image) => Number(image.getAttribute('width')) > 0 && Number(image.getAttribute('height')) > 0)).toBe(true);
    expect(schoolMedia?.classList.contains('case__media--primary-mobile')).toBe(true);
    expect(schoolMedia?.querySelector('img')?.alt).toBe('Главная страница автошколы «Перекрёсток» на телефоне');
    expect(githubLink?.textContent?.trim()).toBe('Открыть GitHub');
    expect(githubLink?.href).toBe('https://github.com/fastnightshadow-bit');
    expect(githubLinks).toHaveLength(1);
  });

  it('renders one non-semantic Shaurma detail without adding a semantic project image', () => {
    const site = createSite(siteContent);
    const details = [...site.querySelectorAll<HTMLElement>('[data-project-detail]')];
    const shaurma = site.querySelector<HTMLElement>('[data-scene="shaurma-mobile"]');

    expect(details).toHaveLength(1);
    expect(shaurma?.querySelectorAll('[data-project-detail]')).toHaveLength(1);
    expect(details[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(details[0]?.querySelector('img, picture')).toBeNull();
    expect([...site.querySelectorAll('[data-project]:not([data-scene="shaurma-mobile"])')]
      .every((project) => project.querySelector('[data-project-detail]') === null)).toBe(true);
    expect(site.querySelectorAll('[data-project-media] img')).toHaveLength(6);
  });

  it('renders one clear final contact as a safe Telegram link', () => {
    const site = createSite(siteContent);
    const links = [...site.querySelectorAll<HTMLAnchorElement>('[data-primary-cta]')];
    const finalHandle = site.querySelector<HTMLAnchorElement>('.contact__handle');

    expect(links).toHaveLength(1);
    expect(links.every((link) => link.href === 'https://t.me/girtopw')).toBe(true);
    expect(links.every((link) => link.target === '_blank' && link.rel === 'noopener noreferrer')).toBe(true);
    expect(finalHandle).toBeNull();
    expect(site.querySelector('[data-scene="contact"] .scene__meta')).toBeNull();
  });

  it('offers the requested section links in the primary navigation', () => {
    const site = createSite(siteContent);
    const navigation = site.querySelector<HTMLElement>('.site-header__nav');
    const internalLinks = [...(navigation?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]') ?? [])]
      .map((link) => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }));

    expect(internalLinks).toEqual(expect.arrayContaining([
      { text: 'Обо мне', href: '#about' },
      { text: 'Как я работаю', href: '#process' },
      { text: 'Кейс 1', href: '#pivnoy-doner' },
      { text: 'Кейс 2', href: '#driving-school' },
      { text: 'Кейс 3', href: '#shaurma-mobile' },
      { text: 'Кейс 4', href: '#telegram-shop' },
      { text: 'Контакты', href: '#contact' },
    ]));
  });

  it('uses the two approved hero shortcuts', () => {
    const site = createSite(siteContent);
    const actions = [...site.querySelectorAll<HTMLAnchorElement>('[data-scene="hero"] .hero__copy a')]
      .map((link) => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }));

    expect(actions).toEqual([
      { text: 'Смотреть портфолио', href: '#pivnoy-doner' },
      { text: 'Обо мне', href: '#about' },
    ]);
  });

  it('uses respectful first-person Russian copy without third-person self-reference', () => {
    const site = createSite(siteContent);
    const visibleCopy = site.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const github = site.querySelector<HTMLElement>('.github-strip');

    expect(visibleCopy).not.toMatch(/(?:^|[^\p{L}])(?:ты|твой|тебя|давай|напиши)(?=$|[^\p{L}])/iu);
    expect(visibleCopy).not.toContain('Привет. Я — Илья');
    expect(visibleCopy).not.toMatch(/профиль Ильи|GitHub Ильи/iu);
    expect(github?.textContent).toContain('в моём профиле');
    expect(github?.querySelector('[data-github-link]')?.textContent?.trim()).toBe('Открыть GitHub');
  });

  it('omits decorative hero and About chrome', () => {
    const site = createSite(siteContent);

    expect(site.querySelectorAll([
      '[data-scene="hero"] > .scene__meta',
      '[data-scene="hero"] .hero__ghost',
      '[data-scene="hero"] .hero__scroll',
      '[data-scene="about"] > .scene__meta',
      '[data-scene="about"] .about__facts',
    ].join(', '))).toHaveLength(0);
  });

  it('labels every case in Russian and omits the redundant label beside its action', () => {
    const site = createSite(siteContent);
    const projects = [...site.querySelectorAll<HTMLElement>('[data-project]')];
    const eyebrows = [
      'Кейс 1 · Сайт для ресторана',
      'Кейс 2 · Сайт автошколы',
      'Кейс 3 · Сайт для заказа еды',
      'Кейс 4 · Магазин в Telegram',
    ];

    expect(projects).toHaveLength(eyebrows.length);
    for (const [index, project] of projects.entries()) expect(project.textContent).toContain(eyebrows[index]);
    expect(site.querySelectorAll('[data-project] .case__label')).toHaveLength(0);
  });

  it('opens every external link in an isolated new tab', () => {
    const site = createSite(siteContent);
    const externalLinks = [...site.querySelectorAll<HTMLAnchorElement>('a[href^="https://"]')];

    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link.getAttribute('target'), link.href).toBe('_blank');
      expect((link.getAttribute('rel') ?? '').split(/\s+/), link.href).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
    }
  });

  it('does not end headings with a full stop', () => {
    const site = createSite(siteContent);
    const headings = [...site.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')];

    expect(headings.length).toBeGreaterThan(0);
    for (const heading of headings) expect(heading.textContent?.trim(), heading.id || heading.className).not.toMatch(/\.$/u);
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
      { type: 'image/avif', sizes: '(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)' },
      { type: 'image/webp', sizes: '(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)' },
    ]);
    expect(image?.getAttribute('sizes')).toBe('(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.getAttribute('decoding')).toBe('async');
    expect(image?.getAttribute('fetchpriority')).toBeNull();
  });

  it('renders every owned image with a project-path-safe relative URL', () => {
    const site = createSite(siteContent);
    const ownedSources = [...site.querySelectorAll<HTMLSourceElement>('.about__portrait source, [data-project-media] source')];
    const ownedImages = [...site.querySelectorAll<HTMLImageElement>('.about__portrait img, [data-project-media] img')];

    expect(ownedSources.length).toBeGreaterThan(0);
    expect(ownedImages.length).toBeGreaterThan(0);
    for (const source of ownedSources) {
      const candidates = source.getAttribute('srcset')?.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]);
      expect(candidates?.every((candidate) => candidate?.startsWith('./assets/'))).toBe(true);
    }
    for (const image of ownedImages) {
      expect(image.getAttribute('src')?.startsWith('./assets/')).toBe(true);
      const srcset = image.getAttribute('srcset');
      if (srcset) {
        const candidates = srcset.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]);
        expect(candidates.every((candidate) => candidate?.startsWith('./assets/'))).toBe(true);
      }
    }
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

  it('renders six compact running-text strips without full-screen transition artwork', () => {
    const site = createSite(siteContent);
    const transitions = [...site.querySelectorAll<HTMLElement>('[data-transition]')];

    expect(transitions).toHaveLength(6);
    expect(transitions.map((transition) => [
      transition.dataset.transition,
      transition.dataset.transitionFrom,
      transition.dataset.transitionTo,
    ])).toEqual([
      ['ticker-to-about', 'hero', 'about'],
      ['personal-to-poster', 'about', 'pivnoy-doner'],
      ['clean-takeover', 'pivnoy-doner', 'driving-school'],
      ['road-to-phone', 'driving-school', 'shaurma-mobile'],
      ['phone-to-telegram', 'shaurma-mobile', 'telegram-shop'],
      ['message-to-contact', 'telegram-shop', 'contact'],
    ]);
    expect(transitions.map((transition) => transition.querySelector('[data-transition-line]')?.textContent?.trim())).toEqual([
      'ДАЛЬШЕ — ОБО МНЕ → ДАЛЬШЕ — ОБО МНЕ',
      'ДАЛЬШЕ — ПРОЕКТЫ → ДАЛЬШЕ — ПРОЕКТЫ',
      'СЛЕДУЮЩИЙ КЕЙС — АВТОШКОЛА → СЛЕДУЮЩИЙ КЕЙС — АВТОШКОЛА',
      'СЛЕДУЮЩИЙ КЕЙС — ЗАКАЗ ЕДЫ → СЛЕДУЮЩИЙ КЕЙС — ЗАКАЗ ЕДЫ',
      'СЛЕДУЮЩИЙ КЕЙС — МАГАЗИН В TELEGRAM → СЛЕДУЮЩИЙ КЕЙС — МАГАЗИН В TELEGRAM',
      'ЕСТЬ ЗАДАЧА — ДАВАЙТЕ ОБСУДИМ → ЕСТЬ ЗАДАЧА — ДАВАЙТЕ ОБСУДИМ',
    ]);
    expect(transitions.map((transition) => transition.className)).toEqual([
      'bridge bridge--ink',
      'bridge bridge--ink',
      'bridge bridge--route',
      'bridge bridge--mobile',
      'bridge bridge--chat',
      'bridge bridge--final',
    ]);
    expect(site.querySelectorAll('[data-transition-line]')).toHaveLength(6);
    expect(site.querySelectorAll('[data-transition-stage], [data-transition-carrier], [data-transition-source], [data-transition-target], [data-transition-morph]')).toHaveLength(0);
    expect(site.querySelectorAll('[data-transition-accent]')).toHaveLength(0);
    expect(site.querySelectorAll('[data-transition] a, [data-transition] button, [data-transition] [tabindex]')).toHaveLength(0);
    expect(site.querySelectorAll('[data-transition] small')).toHaveLength(0);
  });

  it('keeps project metadata descriptive without redundant project counters', () => {
    const site = createSite(siteContent);
    const projectMetadata = [...site.querySelectorAll<HTMLElement>('[data-project] .scene__meta')];

    expect(projectMetadata).toHaveLength(4);
    expect(projectMetadata.every((metadata) => metadata.children.length === 1)).toBe(true);
    expect(projectMetadata.every((metadata) => !/\bproject\b/i.test(metadata.textContent ?? ''))).toBe(true);
  });

  it('replaces old decorative project mockups with real project showcases', () => {
    const site = createSite(siteContent);
    expect(site.querySelector('.about__scribble')).toBeNull();
    expect(site.querySelector('[data-about-promise]')).toBeNull();
    expect(site.querySelector('.doner-poster')).toBeNull();
    expect(site.querySelector('.school-road')).toBeNull();
    expect(site.querySelector('.bot-phone')).toBeNull();
    expect(site.querySelector('.school-sign')).toBeNull();
  });
});
