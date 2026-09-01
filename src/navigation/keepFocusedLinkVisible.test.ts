import { describe, expect, it, vi } from 'vitest';
import { keepFocusedLinkVisible } from './keepFocusedLinkVisible.ts';

const bounds = (left: number, right: number, top = 0, bottom = 44) => ({ left, right, top, bottom } as DOMRect);

describe('keepFocusedLinkVisible', () => {
  it('scrolls the mobile navigation just enough to reveal a focused link and its outline', () => {
    document.body.innerHTML = '<main><nav class="site-header__nav"><a href="#case">Кейс 4</a></nav></main>';
    const root = document.querySelector('main')!;
    const navigation = root.querySelector<HTMLElement>('nav')!;
    const link = root.querySelector<HTMLAnchorElement>('a')!;
    vi.spyOn(navigation, 'getBoundingClientRect').mockReturnValue(bounds(0, 390));
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue(bounds(364, 402));

    const stop = keepFocusedLinkVisible(root);
    link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(navigation.scrollLeft).toBe(20);
    stop();
  });

  it('scrolls a short full-screen menu enough to keep the complete focus ring visible', () => {
    document.body.innerHTML = '<main><nav class="site-header__nav"><a href="#contact">Контакты</a></nav></main>';
    const root = document.querySelector('main')!;
    const navigation = root.querySelector<HTMLElement>('nav')!;
    const link = root.querySelector<HTMLAnchorElement>('a')!;
    vi.spyOn(navigation, 'getBoundingClientRect').mockReturnValue(bounds(0, 844, 64, 390));
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue(bounds(22, 822, 334, 386));

    const stop = keepFocusedLinkVisible(root);
    link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(navigation.scrollTop).toBe(4);
    stop();
  });

  it('removes its focus listener during cleanup', () => {
    document.body.innerHTML = '<main><nav class="site-header__nav"><a href="#about">Обо мне</a></nav></main>';
    const root = document.querySelector('main')!;
    const navigation = root.querySelector<HTMLElement>('nav')!;
    const link = root.querySelector<HTMLAnchorElement>('a')!;
    vi.spyOn(navigation, 'getBoundingClientRect').mockReturnValue(bounds(0, 390));
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue(bounds(-12, 40));

    const stop = keepFocusedLinkVisible(root);
    stop();
    link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(navigation.scrollLeft).toBe(0);
  });
});
