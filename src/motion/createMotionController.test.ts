import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMotionController, type MotionDependencies } from './createMotionController.ts';

const markup = `
  <section data-scene="hero">
    <span data-rotating-word data-words="цепляют.|продают.|помнят.">цепляют.</span>
  </section>
  <div data-transition="route"><strong>Путь</strong></div>
  <section class="about"><svg class="about__scribble"><path style="stroke-dashoffset: 1100px"></path></svg></section>
  <section data-project><div class="case__copy" style="opacity: 0.25; transform: translateY(70px)">Кейс</div></section>
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
    controller.mount(secondRoot);

    expect(reverts[0]).toHaveBeenCalledOnce();
    expect(firstRoot.hasAttribute('data-motion-ready')).toBe(false);
    expect(secondRoot.hasAttribute('data-motion-ready')).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('fails open when GSAP setup throws', () => {
    const root = createRoot();
    const controller = createMotionController({
      prefersReducedMotion: () => false,
      timeline: () => {
        throw new Error('GSAP unavailable');
      },
      context: (setup) => {
        setup();
        return { revert: vi.fn(), add: vi.fn() };
      },
    });

    expect(() => controller.mount(root)).not.toThrow();

    expect(root.hasAttribute('data-motion-ready')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(root.querySelector<HTMLElement>('.case__copy')?.style.opacity).toBe('');
    expect(root.querySelector<SVGPathElement>('.about__scribble path')?.style.strokeDashoffset).toBe('');
  });
});
