import type { TransitionContent } from '../content/siteContent.ts';

export const transitionBridge = (transition: TransitionContent) => `
  <div class="bridge bridge--${transition.variant}" data-transition="${transition.kind}" data-transition-from="${transition.from}" data-transition-to="${transition.to}" data-transition-variant="${transition.variant}" aria-hidden="true">
    <strong data-transition-line>${transition.phrase} → ${transition.phrase}</strong>
  </div>`;
