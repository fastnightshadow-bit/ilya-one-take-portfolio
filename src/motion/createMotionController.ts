import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window.matchMedia === 'function') gsap.registerPlugin(ScrollTrigger);

type TimelineLike = {
  to: (...args: unknown[]) => TimelineLike;
  fromTo: (...args: unknown[]) => TimelineLike;
};

type ContextLike = {
  revert: () => void;
  add: (setup: () => void) => unknown;
};

export interface MotionDependencies {
  prefersReducedMotion: () => boolean;
  timeline: (options?: object) => TimelineLike;
  context: (setup: () => void, scope?: Element) => ContextLike;
}

export interface MotionController {
  mount(root: HTMLElement): void;
  destroy(): void;
}

const defaultDependencies: MotionDependencies = {
  prefersReducedMotion: () => typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  timeline: (options) => gsap.timeline(options) as TimelineLike,
  context: (setup, scope) => gsap.context(setup, scope) as unknown as ContextLike,
};

const resetMotionStyles = (root: HTMLElement) => {
  root.querySelectorAll<HTMLElement>('[data-transition] strong, [data-project] .case__copy').forEach((element) => {
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  });
  root.querySelectorAll<SVGPathElement>('.about__scribble path').forEach((path) => {
    path.style.removeProperty('stroke-dasharray');
    path.style.removeProperty('stroke-dashoffset');
  });
  root.querySelector<HTMLElement>('.about__portrait img')?.style.removeProperty('filter');
};

export function createMotionController(dependencies: MotionDependencies = defaultDependencies): MotionController {
  let context: ContextLike | undefined;
  let mountedRoot: HTMLElement | undefined;
  let wordTimer: number | undefined;
  let initialWord = '';

  const teardown = () => {
    if (wordTimer !== undefined) window.clearInterval(wordTimer);
    wordTimer = undefined;
    context?.revert();
    context = undefined;

    if (mountedRoot) {
      mountedRoot.removeAttribute('data-motion-ready');
      resetMotionStyles(mountedRoot);
      const word = mountedRoot.querySelector<HTMLElement>('[data-rotating-word]');
      if (word && initialWord) word.textContent = initialWord;
    }

    mountedRoot = undefined;
    initialWord = '';
  };

  return {
    mount(root) {
      teardown();
      root.removeAttribute('data-motion-ready');
      resetMotionStyles(root);

      if (dependencies.prefersReducedMotion()) return;

      const mobile = (root.ownerDocument.defaultView?.innerWidth ?? 1024) <= 700;
      let setupError: unknown;
      let nextContext: ContextLike | undefined;

      try {
        nextContext = dependencies.context(() => {
          try {
            root.querySelectorAll<HTMLElement>('[data-transition]').forEach((bridge) => {
              const phrase = bridge.querySelector<HTMLElement>('strong');
              if (!phrase) return;
              dependencies.timeline({
                scrollTrigger: {
                  trigger: bridge,
                  start: 'top 90%',
                  end: 'bottom 20%',
                  scrub: 0.7,
                },
              }).fromTo(phrase, { xPercent: mobile ? 4 : 8 }, { xPercent: mobile ? -6 : -12, ease: 'none' });
            });

            root.querySelectorAll<HTMLElement>('[data-project]').forEach((scene) => {
              const copy = scene.querySelector<HTMLElement>('.case__copy');
              if (!copy) return;
              dependencies.timeline({
                scrollTrigger: {
                  trigger: scene,
                  start: 'top 78%',
                  end: 'top 28%',
                  scrub: 0.6,
                },
              }).fromTo(copy, { y: mobile ? 32 : 70, opacity: 0.25 }, { y: 0, opacity: 1, ease: 'none' });
            });

            const about = root.querySelector<HTMLElement>('.about');
            const scribble = about?.querySelectorAll<SVGPathElement>('.about__scribble path');
            if (about && scribble?.length) {
              dependencies.timeline({
                scrollTrigger: {
                  trigger: about,
                  start: 'top 75%',
                  end: 'center 42%',
                  scrub: 0.6,
                },
              }).fromTo(scribble, { strokeDasharray: 1100, strokeDashoffset: 1100 }, { strokeDashoffset: 0, ease: 'none' });
            }
          } catch (error) {
            setupError = error;
          }
        }, root);
      } catch (error) {
        setupError = error;
      }

      if (setupError || !nextContext) {
        nextContext?.revert();
        resetMotionStyles(root);
        return;
      }

      context = nextContext;
      mountedRoot = root;
      root.setAttribute('data-motion-ready', '');

      const word = root.querySelector<HTMLElement>('[data-rotating-word]');
      const words = word?.dataset.words?.split('|').map((value) => value.trim()).filter(Boolean) ?? [];
      if (word && words.length > 1) {
        initialWord = word.textContent?.trim() || words[0] || '';
        let index = Math.max(0, words.indexOf(initialWord));
        wordTimer = window.setInterval(() => {
          index = (index + 1) % words.length;
          word.textContent = words[index] ?? initialWord;
        }, 1900);
      }
    },
    destroy: teardown,
  };
}
