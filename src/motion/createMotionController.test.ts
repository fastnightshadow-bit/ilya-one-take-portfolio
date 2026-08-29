import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMotionController, type MotionDependencies } from './createMotionController.ts';

const transition = (kind: string, from: string, to: string, label: string) => `
  <div data-transition="${kind}" data-transition-from="${from}" data-transition-to="${to}">
    <div data-transition-stage>
      <strong data-transition-copy>${label}</strong>
      <div data-transition-carrier>
        <i data-transition-source></i>
        <i data-transition-target></i>
        <i data-transition-morph></i>
      </div>
    </div>
  </div>`;

const markup = `
  <section data-scene="hero">
    <span data-rotating-word data-words="цепляют.|продают.|помнят.">цепляют.</span>
  </section>
  ${transition('ticker-to-about', 'hero', 'about', 'Контур')}
  <section class="about" data-scene="about">
    <picture class="about__portrait"><img alt=""></picture>
    <p data-about-promise><span class="about__promise-line"><span>Один человек.</span></span><span class="about__promise-line"><span>Весь сайт.</span></span></p>
  </section>
  ${transition('personal-to-poster', 'about', 'pivnoy-doner', 'Плакат')}
  <section class="case--doner" data-scene="pivnoy-doner" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('clean-takeover', 'pivnoy-doner', 'driving-school', 'Путь')}
  <section class="case--school" data-scene="driving-school" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('road-to-phone', 'driving-school', 'shaurma-mobile', 'Телефон')}
  <section class="case--mobile" data-scene="shaurma-mobile" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('phone-to-telegram', 'shaurma-mobile', 'telegram-shop', 'Диалог')}
  <section class="case--telegram" data-scene="telegram-shop" data-project><div class="case__copy">Кейс</div><div data-project-media></div></section>
  ${transition('message-to-contact', 'telegram-shop', 'contact', 'Контакт')}
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
    const portrait = root.querySelector<HTMLElement>('.about__portrait img');
    const promiseLine = root.querySelector<HTMLElement>('[data-about-promise] .about__promise-line > span');
    copy?.style.setProperty('opacity', '0.72', 'important');
    copy?.style.setProperty('transform', 'rotate(2deg)', 'important');
    media?.style.setProperty('opacity', '0.81', 'important');
    media?.style.setProperty('transform', 'rotate(-1deg)', 'important');
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
    expect(media?.style.getPropertyValue('opacity')).toBe('0.81');
    expect(media?.style.getPropertyValue('transform')).toBe('rotate(-1deg)');
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

    expect(timeline).toHaveBeenCalledTimes(11);
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

  it('animates the selected bridge source, target, and morph layers instead of only moving its copy', () => {
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
      const source = transitionNode.querySelector('[data-transition-source]');
      const target = transitionNode.querySelector('[data-transition-target]');
      const morph = transitionNode.querySelector('[data-transition-morph]');
      const calls = timelines[index]?.fromTo.mock.calls ?? [];
      expect(calls.some(([animated]) => animated === source), `${transitionNode.dataset.transition} source`).toBe(true);
      expect(calls.some(([animated]) => animated === target), `${transitionNode.dataset.transition} target`).toBe(true);
      expect(calls.some(([animated]) => animated === morph), `${transitionNode.dataset.transition} morph`).toBe(true);
    });

    controller.destroy();
  });

  it('expands the clean-takeover poster across the stage before revealing the school target', () => {
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

    const bridge = root.querySelector<HTMLElement>('[data-transition="clean-takeover"]');
    const source = bridge?.querySelector('[data-transition-source]');
    const target = bridge?.querySelector('[data-transition-target]');
    const calls = timelines[2]?.fromTo.mock.calls ?? [];
    const sourceCall = calls.find(([animated]) => animated === source);
    const targetCall = calls.find(([animated]) => animated === target);
    const sourceExitCall = timelines[2]?.to.mock.calls.find(([animated]) => animated === source);
    expect(sourceCall?.[2]).toMatchObject({ scaleX: expect.any(Number), scaleY: expect.any(Number), opacity: 1 });
    expect((sourceCall?.[2] as { scaleX?: number } | undefined)?.scaleX).toBeGreaterThan(3);
    expect((sourceCall?.[2] as { scaleY?: number } | undefined)?.scaleY).toBeGreaterThan(1);
    expect(sourceExitCall?.[1]).toMatchObject({ duration: expect.any(Number), opacity: 0 });
    const sourceExitEnd = (sourceExitCall?.[2] as number)
      + ((sourceExitCall?.[1] as { duration: number }).duration);
    expect(targetCall?.[3]).toBeGreaterThanOrEqual(sourceExitEnd);

    controller.destroy();
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
    const media = root.querySelector<HTMLElement>('[data-project-media]');
    const portrait = root.querySelector<HTMLElement>('.about__portrait img');
    const promiseLine = root.querySelector<HTMLElement>('[data-about-promise] .about__promise-line > span');
    const transitionSource = root.querySelector<HTMLElement>('[data-transition-source]');
    const transitionTarget = root.querySelector<HTMLElement>('[data-transition-target]');
    const transitionMorph = root.querySelector<HTMLElement>('[data-transition-morph]');
    root.setAttribute('data-motion-ready', 'authored');
    copy?.style.setProperty('opacity', '0.72', 'important');
    copy?.style.setProperty('transform', 'rotate(2deg)', 'important');
    media?.style.setProperty('opacity', '0.81', 'important');
    media?.style.setProperty('transform', 'rotate(-1deg)', 'important');
    portrait?.style.setProperty('filter', 'sepia(0.2)', 'important');
    promiseLine?.style.setProperty('opacity', '0.64', 'important');
    promiseLine?.style.setProperty('transform', 'translateY(3px)', 'important');
    transitionSource?.style.setProperty('opacity', '0.67', 'important');
    transitionSource?.style.setProperty('transform', 'rotate(7deg)', 'important');
    transitionTarget?.style.setProperty('opacity', '0.74', 'important');
    transitionTarget?.style.setProperty('transform', 'scale(0.92)', 'important');
    transitionMorph?.style.setProperty('opacity', '0.69', 'important');
    transitionMorph?.style.setProperty('transform', 'translateY(4px)', 'important');
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
    portrait?.style.setProperty('filter', 'grayscale(1)');
    promiseLine?.style.setProperty('opacity', '0.1');
    promiseLine?.style.setProperty('transform', 'translateY(50px)');
    transitionSource?.style.setProperty('opacity', '0.1');
    transitionSource?.style.setProperty('transform', 'translateX(-40px)');
    transitionTarget?.style.setProperty('opacity', '0.2');
    transitionTarget?.style.setProperty('transform', 'translateX(40px)');
    transitionMorph?.style.setProperty('opacity', '0.3');
    transitionMorph?.style.setProperty('transform', 'translateY(40px)');
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
    expect(portrait?.style.getPropertyValue('filter')).toBe('sepia(0.2)');
    expect(portrait?.style.getPropertyPriority('filter')).toBe('important');
    expect(promiseLine?.style.getPropertyValue('opacity')).toBe('0.64');
    expect(promiseLine?.style.getPropertyPriority('opacity')).toBe('important');
    expect(promiseLine?.style.getPropertyValue('transform')).toBe('translateY(3px)');
    expect(promiseLine?.style.getPropertyPriority('transform')).toBe('important');
    expect(transitionSource?.style.getPropertyValue('opacity')).toBe('0.67');
    expect(transitionSource?.style.getPropertyValue('transform')).toBe('rotate(7deg)');
    expect(transitionTarget?.style.getPropertyValue('opacity')).toBe('0.74');
    expect(transitionTarget?.style.getPropertyValue('transform')).toBe('scale(0.92)');
    expect(transitionMorph?.style.getPropertyValue('opacity')).toBe('0.69');
    expect(transitionMorph?.style.getPropertyValue('transform')).toBe('translateY(4px)');
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
