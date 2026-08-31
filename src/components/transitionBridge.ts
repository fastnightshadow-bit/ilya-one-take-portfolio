import type { TransitionContent } from '../content/siteContent.ts';

const runningText = (text: string) => text.split('→').map((segment, index) => [
  index > 0 ? '<span data-transition-arrow aria-hidden="true">→</span>' : '',
  `<span data-transition-copy>${segment}</span>`,
].join('')).join('');

export const transitionBridge = (transition: TransitionContent) => `
  <div class="bridge bridge--${transition.variant}" data-transition="${transition.kind}" data-transition-from="${transition.from}" data-transition-to="${transition.to}" data-transition-variant="${transition.variant}" aria-hidden="true">
    <strong data-transition-line>${runningText(transition.phrase)} <span data-transition-arrow aria-hidden="true">→</span> ${runningText(transition.phrase)}</strong>
  </div>`;
