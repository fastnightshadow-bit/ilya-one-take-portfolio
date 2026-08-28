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

  it('defines six unique visual handoffs instead of repeated ticker variants', () => {
    expect(siteContent.transitions.map(({ variant, phrase }) => ({ variant, phrase }))).toEqual([
      { variant: 'portrait', phrase: 'ИДЕЯ → ЛИЧНОСТЬ' },
      { variant: 'brand', phrase: 'ЛИНИЯ → РАМКА → БРЕНД' },
      { variant: 'route', phrase: 'РАМКА → МАРШРУТ' },
      { variant: 'mobile', phrase: 'ДОРОГА → ТЕЛЕФОН' },
      { variant: 'chat', phrase: 'ЭКРАН → ДИАЛОГ' },
      { variant: 'final', phrase: 'ПРОЕКТЫ → ТВОЙ САЙТ' },
    ]);
    expect(new Set(siteContent.transitions.map(({ variant }) => variant)).size).toBe(6);
  });
});
