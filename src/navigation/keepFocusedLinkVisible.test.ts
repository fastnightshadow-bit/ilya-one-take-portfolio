import { describe, expect, it, vi } from 'vitest';
import { keepFocusedLinkVisible } from './keepFocusedLinkVisible.ts';

const bounds = (left: number, right: number) => ({ left, right } as DOMRect);

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
