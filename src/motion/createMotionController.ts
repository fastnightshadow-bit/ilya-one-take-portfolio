import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { TransitionContent } from '../content/siteContent.ts';

if (typeof window.matchMedia === 'function') gsap.registerPlugin(ScrollTrigger);

type TimelineLike = {
  to: (...args: unknown[]) => TimelineLike;
  fromTo: (...args: unknown[]) => TimelineLike;
};

type ContextLike = {
  revert: () => void;
  add: (setup: () => void) => unknown;
};

type TweenVars = Record<string, unknown>;

interface ResponsiveTween {
  readonly desktop: TweenVars;
  readonly mobile?: TweenVars;
}

interface HandoffStep {
  readonly scope: 'source' | 'target';
  readonly selector: string;
  readonly from: ResponsiveTween;
  readonly to: ResponsiveTween;
  readonly desktopOnly?: boolean;
}

interface HandoffConfig {
  readonly steps: readonly HandoffStep[];
}

interface TransitionArtConfig {
  readonly source: { readonly from: ResponsiveTween; readonly to: ResponsiveTween };
  readonly target: { readonly from: ResponsiveTween; readonly to: ResponsiveTween };
  readonly accent: { readonly from: ResponsiveTween; readonly to: ResponsiveTween };
}

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

const handoffConfigs: Readonly<Record<string, HandoffConfig>> = {
  about: {
    steps: [
      { scope: 'source', selector: '.hero__word', from: { desktop: { y: 0, opacity: 1 } }, to: { desktop: { y: -14, opacity: 0.7 } }, desktopOnly: true },
      { scope: 'target', selector: '.about__portrait', from: { desktop: { xPercent: 12, y: 24, opacity: 0.72 }, mobile: { xPercent: 5, y: 10, opacity: 0.82 } }, to: { desktop: { xPercent: 0, y: 0, opacity: 1 } } },
    ],
  },
  'pivnoy-doner': {
    steps: [
      { scope: 'target', selector: '[data-project-media]', from: { desktop: { xPercent: 16, y: 28, rotation: 4, opacity: 0.62 }, mobile: { xPercent: 6, y: 12, rotation: 2, opacity: 0.76 } }, to: { desktop: { xPercent: 0, y: 0, rotation: 0, opacity: 1 } } },
    ],
  },
  'driving-school': {
    steps: [
      { scope: 'target', selector: '[data-project-media]', from: { desktop: { xPercent: -10, y: 24, rotation: -3, opacity: 0.54 }, mobile: { xPercent: -4, y: 12, rotation: -1, opacity: 0.72 } }, to: { desktop: { xPercent: 0, y: 0, rotation: 0, opacity: 1 } } },
    ],
  },
  'shaurma-mobile': {
    steps: [
      { scope: 'target', selector: '[data-project-media]', from: { desktop: { y: 52, scale: 0.9, rotation: 3, opacity: 0.52 }, mobile: { y: 20, scale: 0.96, rotation: 1, opacity: 0.72 } }, to: { desktop: { y: 0, scale: 1, rotation: 0, opacity: 1 } } },
    ],
  },
  'telegram-shop': {
    steps: [
      { scope: 'target', selector: '[data-project-media]', from: { desktop: { xPercent: 14, y: 34, rotation: -4, opacity: 0.56 }, mobile: { xPercent: 5, y: 14, rotation: -2, opacity: 0.72 } }, to: { desktop: { xPercent: 0, y: 0, rotation: 0, opacity: 1 } } },
    ],
  },
  contact: {
    steps: [
      { scope: 'source', selector: '[data-project-media]', from: { desktop: { xPercent: 0, yPercent: 0, scale: 1, opacity: 1 } }, to: { desktop: { xPercent: -7, yPercent: 10, scale: 0.86, opacity: 0.62 }, mobile: { xPercent: -3, yPercent: 5, scale: 0.95, opacity: 0.72 } } },
      { scope: 'target', selector: 'h2', from: { desktop: { y: 58, opacity: 0.48 }, mobile: { y: 24, opacity: 0.7 } }, to: { desktop: { y: 0, opacity: 1 } } },
      { scope: 'target', selector: '.button--contact', from: { desktop: { y: 24, opacity: 0.45 } }, to: { desktop: { y: 0, opacity: 1 } }, desktopOnly: true },
    ],
  },
};

const transitionArtConfigs: Readonly<Record<TransitionContent['variant'], TransitionArtConfig>> = {
  portrait: {
    source: {
      from: { desktop: { xPercent: 0, y: 0, scale: 1, opacity: 1 } },
      to: { desktop: { xPercent: -22, y: -14, scale: 0.74, opacity: 0.08 }, mobile: { xPercent: -13, y: -8, scale: 0.82, opacity: 0.14 } },
    },
    target: {
      from: { desktop: { xPercent: 30, y: 30, scale: 0.62, opacity: 0.12 }, mobile: { xPercent: 18, y: 18, scale: 0.72, opacity: 0.18 } },
      to: { desktop: { xPercent: 0, y: 0, scale: 1, opacity: 1 } },
    },
    accent: {
      from: { desktop: { scaleX: 0.06, opacity: 0.28 } },
      to: { desktop: { scaleX: 1, opacity: 1 } },
    },
  },
  brand: {
    source: {
      from: { desktop: { scaleX: 0.12, opacity: 1 } },
      to: { desktop: { xPercent: 24, scaleX: 0.76, opacity: 0.12 }, mobile: { xPercent: 14, scaleX: 0.84, opacity: 0.18 } },
    },
    target: {
      from: { desktop: { xPercent: 24, y: 32, scaleX: 0.18, scaleY: 0.18, opacity: 0.12 }, mobile: { xPercent: 14, y: 20, scaleX: 0.28, scaleY: 0.28, opacity: 0.18 } },
      to: { desktop: { xPercent: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 } },
    },
    accent: {
      from: { desktop: { y: 30, scale: 0.52, opacity: 0.08 }, mobile: { y: 18, scale: 0.64, opacity: 0.14 } },
      to: { desktop: { y: 0, scale: 1, opacity: 1 } },
    },
  },
  route: {
    source: {
      from: { desktop: { xPercent: 0, y: 0, scale: 1, opacity: 1 } },
      to: { desktop: { xPercent: -28, y: 18, scale: 0.72, opacity: 0.1 }, mobile: { xPercent: -17, y: 10, scale: 0.8, opacity: 0.16 } },
    },
    target: {
      from: { desktop: { xPercent: 42, yPercent: -18, scaleY: 0.54, opacity: 0.14 }, mobile: { xPercent: 25, yPercent: -10, scaleY: 0.68, opacity: 0.2 } },
      to: { desktop: { xPercent: 0, yPercent: 0, scaleY: 1, opacity: 1 } },
    },
    accent: {
      from: { desktop: { y: -26, scale: 0.34, opacity: 0.08 }, mobile: { y: -16, scale: 0.5, opacity: 0.14 } },
      to: { desktop: { y: 0, scale: 1, opacity: 1 } },
    },
  },
  mobile: {
    source: {
      from: { desktop: { yPercent: -10, scaleY: 1, opacity: 1 } },
      to: { desktop: { yPercent: 24, scaleY: 0.46, opacity: 0.1 }, mobile: { yPercent: 15, scaleY: 0.58, opacity: 0.16 } },
    },
    target: {
      from: { desktop: { xPercent: 26, y: 36, scale: 0.58, opacity: 0.12 }, mobile: { xPercent: 16, y: 22, scale: 0.7, opacity: 0.18 } },
      to: { desktop: { xPercent: 0, y: 0, scale: 1, opacity: 1 } },
    },
    accent: {
      from: { desktop: { x: -44, y: -30, opacity: 0.08 }, mobile: { x: -26, y: -18, opacity: 0.14 } },
      to: { desktop: { x: 0, y: 0, opacity: 1 } },
    },
  },
  chat: {
    source: {
      from: { desktop: { xPercent: 0, y: 0, scale: 1, opacity: 1 } },
      to: { desktop: { xPercent: -22, y: 20, scale: 0.72, opacity: 0.1 }, mobile: { xPercent: -14, y: 12, scale: 0.8, opacity: 0.16 } },
    },
    target: {
      from: { desktop: { xPercent: 30, y: 24, scale: 0.66, opacity: 0.1 }, mobile: { xPercent: 18, y: 15, scale: 0.75, opacity: 0.16 } },
      to: { desktop: { xPercent: 0, y: 0, scale: 1, opacity: 1 } },
    },
    accent: {
      from: { desktop: { y: -24, scale: 0.48, opacity: 0.06 }, mobile: { y: -14, scale: 0.6, opacity: 0.12 } },
      to: { desktop: { y: 0, scale: 1, opacity: 1 } },
    },
  },
  final: {
    source: {
      from: { desktop: { xPercent: 0, y: 0, scale: 1, opacity: 1 } },
      to: { desktop: { xPercent: -26, y: 18, scale: 0.72, opacity: 0.08 }, mobile: { xPercent: -16, y: 10, scale: 0.8, opacity: 0.14 } },
    },
    target: {
      from: { desktop: { xPercent: 34, scaleX: 0.08, opacity: 0.12 }, mobile: { xPercent: 20, scaleX: 0.16, opacity: 0.18 } },
      to: { desktop: { xPercent: 0, scaleX: 1, opacity: 1 } },
    },
    accent: {
      from: { desktop: { x: 22, y: -32, opacity: 0.08 }, mobile: { x: 14, y: -20, opacity: 0.14 } },
      to: { desktop: { x: 0, y: 0, opacity: 1 } },
    },
  },
};

const isTransitionVariant = (value: string | undefined): value is TransitionContent['variant'] =>
  value !== undefined && value in transitionArtConfigs;

const responsiveVars = (value: ResponsiveTween, mobile: boolean): TweenVars => mobile && value.mobile
  ? { ...value.desktop, ...value.mobile }
  : value.desktop;

const findAdjacentScene = (bridge: HTMLElement, direction: 'previous' | 'next'): HTMLElement | undefined => {
  let sibling = direction === 'previous' ? bridge.previousElementSibling : bridge.nextElementSibling;
  while (sibling) {
    if (sibling instanceof HTMLElement && sibling.matches('[data-scene]')) return sibling;
    sibling = direction === 'previous' ? sibling.previousElementSibling : sibling.nextElementSibling;
  }
  return undefined;
};

const ownedStyleRules = [
  { selector: '[data-scene="hero"] .hero__word, [data-transition-copy], [data-transition-source], [data-transition-target], [data-transition-accent]', properties: ['opacity', 'transform'] },
  { selector: '[data-project] .case__copy', properties: ['opacity', 'transform'] },
  { selector: '.about__portrait, [data-about-promise] .about__promise-line > span', properties: ['opacity', 'transform'] },
  { selector: '.about__portrait img', properties: ['filter'] },
  { selector: '[data-project-media]', properties: ['opacity', 'transform'] },
  { selector: '[data-scene="contact"] h2, [data-scene="contact"] .button--contact', properties: ['opacity', 'transform'] },
] as const;

interface StyleSnapshot {
  readonly element: HTMLElement | SVGElement;
  readonly property: string;
  readonly value: string;
  readonly priority: string;
}

interface MotionSnapshot {
  readonly root: HTMLElement;
  readonly readiness: { readonly present: boolean; readonly value: string | null };
  readonly word: { readonly element: HTMLElement; readonly text: string | null } | undefined;
  readonly styles: readonly StyleSnapshot[];
}

const captureMotionSnapshot = (root: HTMLElement): MotionSnapshot => {
  const styles = ownedStyleRules.flatMap(({ selector, properties }) =>
    [...root.querySelectorAll<HTMLElement | SVGElement>(selector)].flatMap((element) =>
      properties.map((property) => ({
        element,
        property,
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      })),
    ),
  );
  const word = root.querySelector<HTMLElement>('[data-rotating-word]');

  return {
    root,
    readiness: {
      present: root.hasAttribute('data-motion-ready'),
      value: root.getAttribute('data-motion-ready'),
    },
    word: word ? { element: word, text: word.textContent } : undefined,
    styles,
  };
};

const restoreMotionSnapshot = (snapshot: MotionSnapshot) => {
  snapshot.styles.forEach(({ element, property, value, priority }) => {
    if (value) element.style.setProperty(property, value, priority);
    else element.style.removeProperty(property);
  });

  if (snapshot.readiness.present) snapshot.root.setAttribute('data-motion-ready', snapshot.readiness.value ?? '');
  else snapshot.root.removeAttribute('data-motion-ready');
  if (snapshot.word) snapshot.word.element.textContent = snapshot.word.text;
};

export function createMotionController(dependencies: MotionDependencies = defaultDependencies): MotionController {
  let context: ContextLike | undefined;
  let snapshot: MotionSnapshot | undefined;
  let wordTimer: number | undefined;
  let initialWord = '';

  const teardown = () => {
    if (wordTimer !== undefined) window.clearInterval(wordTimer);
    wordTimer = undefined;
    context?.revert();
    context = undefined;
    if (snapshot) restoreMotionSnapshot(snapshot);
    snapshot = undefined;
    initialWord = '';
  };

  return {
    mount(root) {
      teardown();
      if (dependencies.prefersReducedMotion()) return;

      const nextSnapshot = captureMotionSnapshot(root);
      const mobile = (root.ownerDocument.defaultView?.innerWidth ?? 1024) <= 700;
      let setupError: unknown;
      let nextContext: ContextLike | undefined;

      try {
        nextContext = dependencies.context(() => {
          try {
            root.querySelectorAll<HTMLElement>('[data-transition]').forEach((bridge) => {
              const phrase = bridge.querySelector<HTMLElement>('[data-transition-copy]');
              const artSource = bridge.querySelector<HTMLElement | SVGElement>('[data-transition-source]');
              const artTarget = bridge.querySelector<HTMLElement | SVGElement>('[data-transition-target]');
              const artAccent = bridge.querySelector<HTMLElement | SVGElement>('[data-transition-accent]');
              const sourceScene = findAdjacentScene(bridge, 'previous');
              const targetScene = findAdjacentScene(bridge, 'next');
              const config = targetScene ? handoffConfigs[targetScene.dataset.scene ?? ''] : undefined;
              const variant = bridge.dataset.transition;
              const artConfig = isTransitionVariant(variant) ? transitionArtConfigs[variant] : undefined;
              if (!phrase || !artSource || !artTarget || !artAccent || !sourceScene || !targetScene || !config || !artConfig) return;

              const handoff = dependencies.timeline({
                scrollTrigger: {
                  trigger: bridge,
                  start: 'top 90%',
                  end: 'bottom 20%',
                  scrub: 0.7,
                },
              });
              handoff.fromTo(
                phrase,
                { xPercent: mobile ? 4 : 8, y: mobile ? 24 : 46, opacity: 0.16 },
                { xPercent: mobile ? -4 : -8, y: 0, opacity: 1, ease: 'none', immediateRender: false },
                0,
              );
              ([
                ['source', artSource],
                ['target', artTarget],
                ['accent', artAccent],
              ] as const).forEach(([layer, element]) => {
                const tween = artConfig[layer];
                handoff.fromTo(
                  element,
                  responsiveVars(tween.from, mobile),
                  { ...responsiveVars(tween.to, mobile), ease: 'none', immediateRender: false },
                  0,
                );
              });
              config.steps.forEach((step) => {
                if (mobile && step.desktopOnly) return;
                const scope = step.scope === 'source' ? sourceScene : targetScene;
                const targets = [...scope.querySelectorAll<HTMLElement | SVGElement>(step.selector)];
                if (!targets.length) return;
                handoff.fromTo(
                  targets.length === 1 ? targets[0] : targets,
                  responsiveVars(step.from, mobile),
                  { ...responsiveVars(step.to, mobile), ease: 'none', immediateRender: false },
                  0,
                );
              });
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
              }).fromTo(copy, { y: mobile ? 32 : 70, opacity: 0.25 }, { y: 0, opacity: 1, ease: 'none', immediateRender: false });
            });

            const about = root.querySelector<HTMLElement>('.about');
            const promiseLines = about?.querySelectorAll<HTMLElement>('[data-about-promise] .about__promise-line > span');
            const portrait = about?.querySelector<HTMLElement>('.about__portrait img');
            if (about) {
              const aboutTimeline = dependencies.timeline({
                scrollTrigger: {
                  trigger: about,
                  start: 'top 75%',
                  end: 'center 42%',
                  scrub: 0.6,
                },
              });
              if (promiseLines?.length) {
                aboutTimeline.fromTo(
                  promiseLines,
                  { yPercent: 110, opacity: 0 },
                  { yPercent: 0, opacity: 1, stagger: 0.08, ease: 'none', immediateRender: false },
                  0,
                );
              }
              if (portrait) {
                aboutTimeline.fromTo(
                  portrait,
                  { filter: 'grayscale(1) contrast(1.08)' },
                  { filter: 'grayscale(0) contrast(1.02)', ease: 'none', immediateRender: false },
                  0,
                );
              }
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
        restoreMotionSnapshot(nextSnapshot);
        return;
      }

      context = nextContext;
      snapshot = nextSnapshot;
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
