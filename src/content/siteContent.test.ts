import { describe, expect, it } from 'vitest';
import { siteContent } from './siteContent';

describe('siteContent', () => {
  it('contains the approved contact and four verified project destinations', () => {
    expect(siteContent.telegramUrl).toBe('https://t.me/girtopw');
    expect(siteContent.githubUrl).toBe('https://github.com/fastnightshadow-bit');
    expect(siteContent.projects.map((project) => ({
      id: project.id,
      title: project.title,
      href: project.action.href,
      presentation: project.presentation.kind,
      primary: project.presentation.primary,
    }))).toEqual([
      {
        id: 'pivnoy-doner',
        title: 'Пивной Донер',
        href: 'https://pivdoner.ru/',
        presentation: 'responsive',
        primary: 'desktop',
      },
      {
        id: 'driving-school',
        title: 'Автошкола «Перекрёсток»',
        href: 'https://perekrestok-yaroslavl.netlify.app/',
        presentation: 'responsive',
        primary: 'mobile',
      },
      {
        id: 'shaurma-mobile',
        title: 'Шаурма Халяль 1',
        href: 'https://fastnightshadow-bit.github.io/chaurma/',
        presentation: 'phone',
        primary: 'mobile',
      },
      {
        id: 'telegram-shop',
        title: 'VeachelSell',
        href: 'https://t.me/veachelsell_bot',
        presentation: 'phone',
        primary: 'mobile',
      },
    ]);
  });

  it('contains four process steps and no unverified metrics', () => {
    expect(siteContent.process).toHaveLength(4);
    const serialized = JSON.stringify(siteContent);
    expect(serialized).not.toMatch(/\d+%|отзыв|наград|лет опыта/i);
  });

  it('defines authored Doner headline lines instead of relying on incidental wrapping', () => {
    const doner = siteContent.projects.find((project) => project.id === 'pivnoy-doner') as typeof siteContent.projects[number] & {
      readonly headlineLines?: readonly string[];
      readonly accentLines?: readonly string[];
    };

    expect(doner.headlineLines).toEqual(['Из локального', 'ресторана']);
    expect(doner.accentLines).toEqual(['в узнаваемый', 'бренд']);
    expect([...doner.headlineLines ?? [], ...doner.accentLines ?? []].join(' ')).toBe(
      'Из локального ресторана в узнаваемый бренд',
    );
  });

  it('defines two semantic desktop gallery screens for each phone project', () => {
    type GalleryShot = {
      readonly assetId: string;
      readonly alt: string;
      readonly width: number;
      readonly height: number;
    };
    const phoneProjects = siteContent.projects
      .filter((project) => project.presentation.kind === 'phone')
      .map((project) => ({
        id: project.id,
        desktopGallery: (project.presentation as typeof project.presentation & {
          readonly desktopGallery?: readonly GalleryShot[];
        }).desktopGallery,
      }));

    expect(phoneProjects).toEqual([
      {
        id: 'shaurma-mobile',
        desktopGallery: [
          {
            assetId: 'shaurma-mobile-menu',
            alt: 'Меню сайта «Шаурма Халяль 1» на телефоне',
            width: 390,
            height: 844,
          },
          {
            assetId: 'shaurma-mobile-cart',
            alt: 'Корзина сайта «Шаурма Халяль 1» на телефоне',
            width: 390,
            height: 844,
          },
        ],
      },
      {
        id: 'telegram-shop',
        desktopGallery: [
          {
            assetId: 'telegram-shop-cart',
            alt: 'Корзина Telegram-магазина VeachelSell',
            width: 390,
            height: 844,
          },
          {
            assetId: 'telegram-shop-checkout',
            alt: 'Оформление заказа в Telegram-магазине VeachelSell',
            width: 390,
            height: 844,
          },
        ],
      },
    ]);
  });

  it('defines the six compact ticker handoffs with the exact approved phrases', () => {
    const transitions = siteContent.transitions as ReadonlyArray<{
      kind?: string;
      from?: string;
      to?: string;
      variant?: string;
      phrase?: string;
    }>;

    expect(transitions.map(({ kind, from, to }) => [kind, from, to])).toEqual([
      ['ticker-to-about', 'hero', 'about'],
      ['personal-to-poster', 'about', 'pivnoy-doner'],
      ['clean-takeover', 'pivnoy-doner', 'driving-school'],
      ['road-to-phone', 'driving-school', 'shaurma-mobile'],
      ['phone-to-telegram', 'shaurma-mobile', 'telegram-shop'],
      ['message-to-contact', 'telegram-shop', 'contact'],
    ]);
    expect(transitions.map(({ phrase, variant }) => [phrase, variant])).toEqual([
      ['ИДЕЯ → ДИЗАЙН → КОД → РЕЗУЛЬТАТ', 'ink'],
      ['БИЗНЕС → ВКУС → БРЕНД → ЗАКАЗ', 'ink'],
      ['ОТ ПЕРВОГО КЛИКА → К ПЕРВОЙ ПОЕЗДКЕ', 'route'],
      ['САЙТ → ТЕЛЕФОН → МЕНЮ → ЗАКАЗ', 'mobile'],
      ['САЙТ → ЧАТ → КАТАЛОГ → МАГАЗИН', 'chat'],
      ['ДИЗАЙН × КОД × БИЗНЕС', 'final'],
    ]);
    expect(JSON.stringify(siteContent)).not.toContain('—');
  });
});
