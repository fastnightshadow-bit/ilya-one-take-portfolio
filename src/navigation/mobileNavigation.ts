const mobileNavigationQuery = '(max-width: 900px)';

export const mountMobileNavigation = (root: HTMLElement): (() => void) => {
  const header = root.querySelector<HTMLElement>('.site-header');
  const toggle = root.querySelector<HTMLButtonElement>('[data-mobile-nav-toggle]');
  const navigation = root.querySelector<HTMLElement>('#site-navigation');
  const main = root.querySelector<HTMLElement>('main');

  if (!header || !toggle || !navigation || !main) return () => undefined;

  const media = window.matchMedia(mobileNavigationQuery);
  let isOpen = false;
  let animationFrame = 0;

  const setPageLocked = (locked: boolean) => {
    document.documentElement.toggleAttribute('data-mobile-nav-open', locked);
    main.inert = locked;
  };

  const render = () => {
    const mobile = media.matches;
    const open = mobile && isOpen;

    header.toggleAttribute('data-mobile-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    navigation.toggleAttribute('inert', mobile && !open);
    if (mobile && !open) navigation.setAttribute('aria-hidden', 'true');
    else navigation.removeAttribute('aria-hidden');
    setPageLocked(open);
  };

  const close = (restoreFocus = false) => {
    if (!isOpen && media.matches) return;
    isOpen = false;
    render();
    if (restoreFocus && media.matches) toggle.focus();
  };

  const toggleNavigation = () => {
    if (!media.matches) return;
    isOpen = !isOpen;
    render();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !isOpen) return;
    event.preventDefault();
    close(true);
  };

  const handleViewportChange = () => {
    isOpen = false;
    render();
  };

  const handleNavigationClick = (event: MouseEvent) => {
    if ((event.target as Element).closest('a[href]')) close(false);
  };

  header.setAttribute('data-mobile-nav-ready', '');
  document.documentElement.setAttribute('data-mobile-nav-ready', '');
  toggle.addEventListener('click', toggleNavigation);
  document.addEventListener('keydown', handleKeydown);
  media.addEventListener('change', handleViewportChange);
  navigation.addEventListener('click', handleNavigationClick);
  render();
  animationFrame = window.requestAnimationFrame(() => header.setAttribute('data-mobile-nav-animated', ''));

  return () => {
    window.cancelAnimationFrame(animationFrame);
    toggle.removeEventListener('click', toggleNavigation);
    document.removeEventListener('keydown', handleKeydown);
    media.removeEventListener('change', handleViewportChange);
    navigation.removeEventListener('click', handleNavigationClick);
    header.removeAttribute('data-mobile-nav-ready');
    header.removeAttribute('data-mobile-nav-animated');
    header.removeAttribute('data-mobile-nav-open');
    document.documentElement.removeAttribute('data-mobile-nav-ready');
    document.documentElement.removeAttribute('data-mobile-nav-open');
    navigation.removeAttribute('aria-hidden');
    navigation.removeAttribute('inert');
    main.inert = false;
  };
};
