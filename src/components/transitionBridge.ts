import type { TransitionContent } from '../content/siteContent.ts';

export const transitionBridge = (transition: TransitionContent) => `
  <div class="bridge bridge--${transition.variant}" data-transition="${transition.variant}" aria-hidden="true">
    <strong>${transition.phrase} → ${transition.phrase}</strong>
  </div>`;
