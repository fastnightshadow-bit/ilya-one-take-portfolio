import type { TransitionContent } from '../content/siteContent.ts';

export const transitionBridge = (transition: TransitionContent) => `
  <div class="bridge bridge--${transition.variant}" data-transition="${transition.variant}" aria-hidden="true">
    <small>${transition.label}</small><strong>${transition.phrase} → ${transition.phrase}</strong><i></i>
  </div>`;
