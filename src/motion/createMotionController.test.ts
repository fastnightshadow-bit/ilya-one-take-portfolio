import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMotionController, type MotionDependencies } from './createMotionController.ts';

const markup = `
  <section data-scene="hero">
    <span data-rotating-word data-words="цепляют.|продают.|помнят.">цепляют.</span>
  </section>
  <div data-transition="ink"><strong>Контур</strong></div>
  <section class="about" data-scene="about">
    <picture class="about__portrait"><img alt=""></picture>
    <p data-about-promise><span class="about__promise-line"><span>Один человек.</span></span><span class="about__promise-line"><span>Весь сайт.</span></span></p>
  </section>
  <div data-transition="ink"><strong>Плакат</strong></div>
  <section class="case--doner" data-scene="pivnoy-doner" data-project><div class="case__copy">Кейс</div><div class="doner-poster"></div></section>
  <div data-transition="route"><strong>Путь</strong></div>
  <section class="case--school" data-scene="driving-school" data-project><div class="case__copy">Кейс</div><div class="school-road"></div></section>
  <div data-transition="chat"><strong>Диалог</strong></div>
  <section class="case--telegram" data-scene="telegram-shop" data-project><div class="case__copy">Кейс</div><div class="bot-phone"><i></i></div></section>
  <div data-transition="final"><strong>Контакт</strong></div>
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
    const portrait = root.querySelector<HTMLElement>('.about__portrait img');
    const promiseLine = root.querySelector<HTMLElement>('[data-about-promise] .about__promise-line > span');
    copy?.style.setProperty('opacity', '0.72', 'important');
    copy?.style.setProperty('transform', 'rotate(2deg)', 'important');
    portrait?.style.setProperty('filter', 'sepia(0.2)', 'important');
    promiseLine?.style.setProperty('opacity', '0.64', 'important');
    promiseLine?.style.setProperty('transform', 'translateY(3px)', 'important');
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
    expect(portrait?.style.getPropertyValue('filter')).toBe('sepia(0.2)');
    expect(promiseLine?.style.getPropertyValue('opacity')).toBe('0.64');
    expect(promiseLine?.style.getPropertyValue('transform')).toBe('translateY(3px)');
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

  it('tears down the previous lifecycle before a repeated mount', () => {
    const firstRoot = createRoot();
    const secondRoot = createRoot();
    const firstPhrase = firstRoot.querySelector<HTMLElement>('[data-transition] strong');
    const secondPhrase = secondRoot.querySelector<HTMLElement>('[data-transition] strong');
    firstPhrase?.style.setProperty('transform', 'rotate(1deg)', 'important');
    secondPhrase?.style.setProperty('opacity', '0.84', 'important');
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
    firstPhrase?.style.setProperty('transform', 'translateX(90px)');
    controller.mount(secondRoot);

    expect(reverts[0]).toHaveBeenCalledOnce();
    expect(firstRoot.hasAttribute('data-motion-ready')).toBe(false);
    expect(secondRoot.hasAttribute('data-motion-ready')).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    expect(firstPhrase?.style.getPropertyValue('transform')).toBe('rotate(1deg)');
    expect(firstPhrase?.style.getPropertyPriority('transform')).toBe('important');

    secondPhrase?.style.setProperty('opacity', '0.2');
    controller.destroy();
    expect(secondPhrase?.style.getPropertyValue('opacity')).toBe('0.84');
    expect(secondPhrase?.style.getPropertyPriority('opacity')).toBe('important');
  });

  it('restores exact authored styles and readiness state on destroy', () => {
    const root = createRoot();
    const copy = root.querySelector<HTMLElement>('.case__copy');
    const portrait = root.querySelector<HTMLElement>('.about__portrait img');
    const promiseLine = root.querySelector<HTMLElement>('[data-about-promise] .about__promise-line > span');
    root.setAttribute('data-motion-ready', 'authored');
    copy?.style.setProperty('opacity', '0.72', 'important');
    copy?.style.setProperty('transform', 'rotate(2deg)', 'important');
    portrait?.style.setProperty('filter', 'sepia(0.2)', 'important');
    promiseLine?.style.setProperty('opacity', '0.64', 'important');
    promiseLine?.style.setProperty('transform', 'translateY(3px)', 'important');
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
    portrait?.style.setProperty('filter', 'grayscale(1)');
    promiseLine?.style.setProperty('opacity', '0.1');
    promiseLine?.style.setProperty('transform', 'translateY(50px)');
    controller.destroy();

    expect(root.getAttribute('data-motion-ready')).toBe('authored');
    expect(copy?.style.getPropertyValue('opacity')).toBe('0.72');
    expect(copy?.style.getPropertyPriority('opacity')).toBe('important');
    expect(copy?.style.getPropertyValue('transform')).toBe('rotate(2deg)');
    expect(copy?.style.getPropertyPriority('transform')).toBe('important');
    expect(portrait?.style.getPropertyValue('filter')).toBe('sepia(0.2)');
    expect(portrait?.style.getPropertyPriority('filter')).toBe('important');
    expect(promiseLine?.style.getPropertyValue('opacity')).toBe('0.64');
    expect(promiseLine?.style.getPropertyPriority('opacity')).toBe('important');
    expect(promiseLine?.style.getPropertyValue('transform')).toBe('translateY(3px)');
    expect(promiseLine?.style.getPropertyPriority('transform')).toBe('important');
  });

  it('reverts partial setup and restores authored styles when a later timeline throws', () => {
    const root = createRoot();
    const phrase = root.querySelector<HTMLElement>('[data-transition] strong');
    phrase?.style.setProperty('transform', 'rotate(1deg)', 'important');
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
    expect(phrase?.style.getPropertyValue('transform')).toBe('rotate(1deg)');
    expect(phrase?.style.getPropertyPriority('transform')).toBe('important');
  });
});
