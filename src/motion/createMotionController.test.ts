import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMotionController, type MotionDependencies } from './createMotionController.ts';

const transition = (kind: string, from: string, to: string) => `
  <div data-transition="${kind}" data-transition-from="${from}" data-transition-to="${to}">
    <strong data-transition-line>БЕГУЩАЯ СТРОКА → БЕГУЩАЯ СТРОКА</strong>
  </div>`;

const markup = `
  <section data-scene="hero">
    <span data-rotating-word data-words="цепляют.|продают.|помнят.">цепляют.</span>
  </section>
  ${transition('ticker-to-about', 'hero', 'about')}
  <section class="about" data-scene="about">
    <picture class="about__portrait"><img alt=""></picture>
  </section>
  ${transition('personal-to-poster', 'about', 'pivnoy-doner')}
  <section class="case--doner" data-scene="pivnoy-doner" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('clean-takeover', 'pivnoy-doner', 'driving-school')}
  <section class="case--school" data-scene="driving-school" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('road-to-phone', 'driving-school', 'shaurma-mobile')}
  <section class="case--mobile" data-scene="shaurma-mobile" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('phone-to-telegram', 'shaurma-mobile', 'telegram-shop')}
  <section class="case--telegram" data-scene="telegram-shop" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('message-to-contact', 'telegram-shop', 'contact')}
  <section data-scene="contact"><h2>Давай сделаем сайт</h2><a class="button--contact">Написать</a></section>
`;

const createRoot = () => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  return root;
};

const createTimeline = () => ({
  to: vi.fn().mockReturnThis(),
  fromTo: vi.fn().mockReturnThis(),
});

describe('createMotionController', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('creates no motion resources or readiness state for reduced-motion users', () => {
    const root = createRoot();
    const copy = root.querySelector<HTMLElement>('.case__copy');
    const media = root.querySelector<HTMLElement>('[data-project-media]');
    copy?.style.setProperty('opacity', '0.72', 'important');
    copy?.style.setProperty('transform', 'rotate(2deg)', 'important');
    media?.style.setProperty('opacity', '0.81', 'important');
    media?.style.setProperty('transform', 'rotate(-1deg)', 'important');
    const context = vi.fn();
    const timeline = vi.fn(createTimeline);
    const controller = createMotionController({
      prefersReducedMotion: () => true,
      timeline,
      context,
    });

    controller.mount(root);

    expect(context).not.toHaveBeenCalled();
    expect(timeline).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(root.hasAttribute('data-motion-ready')).toBe(false);
    expect(copy?.style.getPropertyValue('opacity')).toBe('0.72');
    expect(copy?.style.getPropertyPriority('opacity')).toBe('important');
    expect(copy?.style.getPropertyValue('transform')).toBe('rotate(2deg)');
    expect(media?.style.getPropertyValue('opacity')).toBe('0.81');
    expect(media?.style.getPropertyValue('transform')).toBe('rotate(-1deg)');
  });

  it('reverts its GSAP context, clears its timer, and removes readiness on destroy', () => {
    const root = createRoot();
    const revert = vi.fn();
    const dependencies: MotionDependencies = {
      prefersReducedMotion: () => false,
      timeline: vi.fn(createTimeline),
      context: (setup) => {
        setup();
        return { revert, add: vi.fn() };
      },
    };
    const controller = createMotionController(dependencies);

    controller.mount(root);
    expect(root.hasAttribute('data-motion-ready')).toBe(true);
    expect(vi.getTimerCount()).toBe(1);

    controller.destroy();

    expect(revert).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    expect(root.hasAttribute('data-motion-ready')).toBe(false);
  });

  it('builds every project handoff and carries the final project into contact', () => {
    const root = createRoot();
    const timelines: ReturnType<typeof createTimeline>[] = [];
    const timeline = vi.fn(() => {
      const instance = createTimeline();
      timelines.push(instance);
      return instance;
    });
    const controller = createMotionController({
      prefersReducedMotion: () => false,
      timeline,
      context: (setup) => {
        setup();
        return { revert: vi.fn(), add: vi.fn() };
      },
    });

    controller.mount(root);

    expect(timeline).toHaveBeenCalledTimes(10);
    const projectScenes = ['pivnoy-doner', 'driving-school', 'shaurma-mobile', 'telegram-shop'];
    projectScenes.forEach((scene, index) => {
      const media = root.querySelector(`[data-scene="${scene}"] [data-project-media]`);
      const calls = timelines[index + 1]?.fromTo.mock.calls ?? [];
      expect(calls.some(([animated]) => animated === media), `${scene} handoff target`).toBe(true);
    });
    const telegramMedia = root.querySelector('[data-scene="telegram-shop"] [data-project-media]');
    expect(timelines[5]?.fromTo.mock.calls.some(([animated]) => animated === telegramMedia), 'contact handoff source').toBe(true);

    controller.destroy();
  });

  it('scrubs every desktop ticker phrase from +8 to -12 percent', () => {
    const root = createRoot();
    const timelines: ReturnType<typeof createTimeline>[] = [];
    const controller = createMotionController({
      prefersReducedMotion: () => false,
      timeline: vi.fn(() => {
        const instance = createTimeline();
        timelines.push(instance);
        return instance;
      }),
      context: (setup) => {
        setup();
        return { revert: vi.fn(), add: vi.fn() };
      },
    });

    controller.mount(root);

    const transitions = [...root.querySelectorAll<HTMLElement>('[data-transition]')];
    expect(transitions).toHaveLength(6);
    expect(transitions.map((transitionNode) => [
      transitionNode.dataset.transition,
      transitionNode.dataset.transitionFrom,
      transitionNode.dataset.transitionTo,
    ])).toEqual([
      ['ticker-to-about', 'hero', 'about'],
      ['personal-to-poster', 'about', 'pivnoy-doner'],
      ['clean-takeover', 'pivnoy-doner', 'driving-school'],
      ['road-to-phone', 'driving-school', 'shaurma-mobile'],
      ['phone-to-telegram', 'shaurma-mobile', 'telegram-shop'],
      ['message-to-contact', 'telegram-shop', 'contact'],
    ]);
    transitions.forEach((transitionNode, index) => {
      const phrase = transitionNode.querySelector('[data-transition-line]');
      const calls = timelines[index]?.fromTo.mock.calls ?? [];
      const phraseCall = calls.find(([animated]) => animated === phrase);
      expect(phraseCall?.[1], `${transitionNode.dataset.transition} start`).toEqual({ xPercent: 8 });
      expect(phraseCall?.[2], `${transitionNode.dataset.transition} end`).toMatchObject({
        xPercent: -12,
        ease: 'none',
        immediateRender: false,
      });
    });

    controller.destroy();
  });

  it('scrubs every mobile ticker phrase from +4 to -6 percent', () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    const root = createRoot();
    const timelines: ReturnType<typeof createTimeline>[] = [];
    const controller = createMotionController({
      prefersReducedMotion: () => false,
      timeline: vi.fn(() => {
        const instance = createTimeline();
        timelines.push(instance);
        return instance;
      }),
      context: (setup) => {
        setup();
        return { revert: vi.fn(), add: vi.fn() };
      },
    });

    controller.mount(root);

    [...root.querySelectorAll<HTMLElement>('[data-transition]')].forEach((transitionNode, index) => {
      const phrase = transitionNode.querySelector('[data-transition-line]');
      const phraseCall = timelines[index]?.fromTo.mock.calls.find(([animated]) => animated === phrase);
      expect(phraseCall?.[1], `${transitionNode.dataset.transition} mobile start`).toEqual({ xPercent: 4 });
      expect(phraseCall?.[2], `${transitionNode.dataset.transition} mobile end`).toMatchObject({
        xPercent: -6,
        ease: 'none',
        immediateRender: false,
      });
    });

    controller.destroy();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
  });

  it('tears down the previous lifecycle before a repeated mount', () => {
    const firstRoot = createRoot();
    const secondRoot = createRoot();
    const firstLayer = firstRoot.querySelector<HTMLElement>('[data-transition-line]');
    const secondLayer = secondRoot.querySelector<HTMLElement>('[data-transition-line]');
    firstLayer?.style.setProperty('transform', 'rotate(1deg)', 'important');
    secondLayer?.style.setProperty('opacity', '0.84', 'important');
    const reverts = [vi.fn(), vi.fn()];
    let contextIndex = 0;
    const controller = createMotionController({
      prefersReducedMotion: () => false,
      timeline: vi.fn(createTimeline),
      context: (setup) => {
        setup();
        const revert = reverts[contextIndex];
        contextIndex += 1;
        if (!revert) throw new Error('Unexpected context');
        return { revert, add: vi.fn() };
      },
    });

    controller.mount(firstRoot);
    firstLayer?.style.setProperty('transform', 'translateX(90px)');
    controller.mount(secondRoot);

    expect(reverts[0]).toHaveBeenCalledOnce();
    expect(firstRoot.hasAttribute('data-motion-ready')).toBe(false);
    expect(secondRoot.hasAttribute('data-motion-ready')).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    expect(firstLayer?.style.getPropertyValue('transform')).toBe('rotate(1deg)');
    expect(firstLayer?.style.getPropertyPriority('transform')).toBe('important');

    secondLayer?.style.setProperty('opacity', '0.2');
    controller.destroy();
    expect(secondLayer?.style.getPropertyValue('opacity')).toBe('0.84');
    expect(secondLayer?.style.getPropertyPriority('opacity')).toBe('important');
  });

  it('restores exact authored styles and readiness state on destroy', () => {
    const root = createRoot();
    const copy = root.querySelector<HTMLElement>('.case__copy');
    const media = root.querySelector<HTMLElement>('[data-project-media]');
    const transitionPhrase = root.querySelector<HTMLElement>('[data-transition-line]');
    root.setAttribute('data-motion-ready', 'authored');
    copy?.style.setProperty('opacity', '0.72', 'important');
    copy?.style.setProperty('transform', 'rotate(2deg)', 'important');
    media?.style.setProperty('opacity', '0.81', 'important');
    media?.style.setProperty('transform', 'rotate(-1deg)', 'important');
    transitionPhrase?.style.setProperty('opacity', '0.67', 'important');
    transitionPhrase?.style.setProperty('transform', 'rotate(7deg)', 'important');
    const controller = createMotionController({
      prefersReducedMotion: () => false,
      timeline: vi.fn(createTimeline),
      context: (setup) => {
        setup();
        return { revert: vi.fn(), add: vi.fn() };
      },
    });

    controller.mount(root);
    copy?.style.setProperty('opacity', '0.2');
    copy?.style.setProperty('transform', 'translateY(70px)');
    media?.style.setProperty('opacity', '0.1');
    media?.style.setProperty('transform', 'translateY(90px)');
    transitionPhrase?.style.setProperty('opacity', '0.1');
    transitionPhrase?.style.setProperty('transform', 'translateX(-40px)');
    controller.destroy();

    expect(root.getAttribute('data-motion-ready')).toBe('authored');
    expect(copy?.style.getPropertyValue('opacity')).toBe('0.72');
    expect(copy?.style.getPropertyPriority('opacity')).toBe('important');
    expect(copy?.style.getPropertyValue('transform')).toBe('rotate(2deg)');
    expect(copy?.style.getPropertyPriority('transform')).toBe('important');
    expect(media?.style.getPropertyValue('opacity')).toBe('0.81');
    expect(media?.style.getPropertyPriority('opacity')).toBe('important');
    expect(media?.style.getPropertyValue('transform')).toBe('rotate(-1deg)');
    expect(media?.style.getPropertyPriority('transform')).toBe('important');
    expect(transitionPhrase?.style.getPropertyValue('opacity')).toBe('0.67');
    expect(transitionPhrase?.style.getPropertyValue('transform')).toBe('rotate(7deg)');
  });

  it('reverts partial setup and restores authored styles when a later timeline throws', () => {
    const root = createRoot();
    const transitionPhrase = root.querySelector<HTMLElement>('[data-transition-line]');
    transitionPhrase?.style.setProperty('transform', 'rotate(1deg)', 'important');
    const revert = vi.fn();
    let timelineCount = 0;
    const controller = createMotionController({
      prefersReducedMotion: () => false,
      timeline: () => {
        timelineCount += 1;
        if (timelineCount === 1) {
          return {
            to: vi.fn().mockReturnThis(),
            fromTo: vi.fn((target: unknown) => {
              if (target instanceof HTMLElement) target.style.transform = 'translateX(90px)';
              return createTimeline();
            }),
          };
        }
        throw new Error('GSAP unavailable');
      },
      context: (setup) => {
        setup();
        return { revert, add: vi.fn() };
      },
    });

    expect(() => controller.mount(root)).not.toThrow();

    expect(root.hasAttribute('data-motion-ready')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(revert).toHaveBeenCalledOnce();
    expect(transitionPhrase?.style.getPropertyValue('transform')).toBe('rotate(1deg)');
    expect(transitionPhrase?.style.getPropertyPriority('transform')).toBe('important');
  });
});
