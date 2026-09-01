const focusRingSpace = 8;

export const keepFocusedLinkVisible = (root: ParentNode): (() => void) => {
  const navigation = root.querySelector<HTMLElement>('.site-header__nav');
  if (!navigation) return () => undefined;

  const revealFocusedLink = (event: FocusEvent) => {
    if (!(event.target instanceof HTMLElement)) return;
    const link = event.target.closest<HTMLElement>('a');
    if (!link || !navigation.contains(link)) return;

    const navigationBounds = navigation.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    const leftOverflow = linkBounds.left - navigationBounds.left - focusRingSpace;
    const rightOverflow = linkBounds.right - navigationBounds.right + focusRingSpace;
    const topOverflow = linkBounds.top - navigationBounds.top - focusRingSpace;
    const bottomOverflow = linkBounds.bottom - navigationBounds.bottom + focusRingSpace;

    if (leftOverflow < 0) navigation.scrollLeft += leftOverflow;
    else if (rightOverflow > 0) navigation.scrollLeft += rightOverflow;
    if (topOverflow < 0) navigation.scrollTop += topOverflow;
    else if (bottomOverflow > 0) navigation.scrollTop += bottomOverflow;
  };

  navigation.addEventListener('focusin', revealFocusedLink);
  return () => navigation.removeEventListener('focusin', revealFocusedLink);
};
