import type { TransitionContent } from '../content/siteContent.ts';

const artwork: Record<TransitionContent['variant'], string> = {
  portrait: `
    <span class="bridge__object bridge__type" data-transition-source data-transition-shape="type">ИДЕЯ</span>
    <span class="bridge__object bridge__portrait" data-transition-target data-transition-shape="portrait"><i></i><i></i></span>
    <span class="bridge__accent bridge__accent--portrait" data-transition-accent></span>`,
  brand: `
    <span class="bridge__object bridge__line" data-transition-source data-transition-shape="line"></span>
    <span class="bridge__object bridge__frame" data-transition-target data-transition-shape="frame"><i></i></span>
    <span class="bridge__accent bridge__accent--brand" data-transition-accent></span>`,
  route: `
    <span class="bridge__object bridge__frame bridge__frame--departing" data-transition-source data-transition-shape="frame"><i></i></span>
    <span class="bridge__object bridge__road" data-transition-target data-transition-shape="road"><i></i></span>
    <span class="bridge__accent bridge__accent--route" data-transition-accent>GO</span>`,
  mobile: `
    <span class="bridge__object bridge__road bridge__road--departing" data-transition-source data-transition-shape="road"><i></i></span>
    <span class="bridge__object bridge__phone" data-transition-target data-transition-shape="phone"><i></i><b></b></span>
    <span class="bridge__accent bridge__accent--mobile" data-transition-accent>↘</span>`,
  chat: `
    <span class="bridge__object bridge__phone bridge__phone--departing" data-transition-source data-transition-shape="phone"><i></i><b></b></span>
    <span class="bridge__object bridge__chat" data-transition-target data-transition-shape="chat"><i></i><i></i><i></i></span>
    <span class="bridge__accent bridge__accent--chat" data-transition-accent><i></i><i></i><i></i></span>`,
  final: `
    <span class="bridge__object bridge__chat bridge__chat--departing" data-transition-source data-transition-shape="chat"><i></i><i></i><i></i></span>
    <span class="bridge__object bridge__wipe" data-transition-target data-transition-shape="wipe"><i>ДАВАЙ</i></span>
    <span class="bridge__accent bridge__accent--final" data-transition-accent>↘</span>`,
};

export const transitionBridge = (transition: TransitionContent) => `
  <div class="bridge bridge--${transition.variant}" data-transition="${transition.variant}" aria-hidden="true">
    <div class="bridge__stage" data-transition-stage>
      <strong class="bridge__copy" data-transition-copy>${transition.phrase}</strong>
      <div class="bridge__carrier" data-transition-carrier>
        ${artwork[transition.variant]}
      </div>
    </div>
  </div>`;
