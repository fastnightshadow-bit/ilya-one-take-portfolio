import type { TransitionContent } from '../content/siteContent.ts';

const decorativeImage = (src: string, width: number, height: number) =>
  `<img src="${src}" width="${width}" height="${height}" loading="lazy" decoding="async" alt="">`;

const artwork: Record<TransitionContent['kind'], string> = {
  'ticker-to-about': `
    <span class="bridge__art bridge__ticker" data-transition-source="story-ticker">
      <span>ИДЕЯ / ДИЗАЙН / КОД / ЗАПУСК</span>
    </span>
    <span class="bridge__art bridge__about-plane" data-transition-target="about-plane"></span>
    <span class="bridge__art bridge__personal-mark" data-transition-morph="personal-mark">ЛИЧНО.</span>`,
  'personal-to-poster': `
    <span class="bridge__art bridge__personal-source" data-transition-source="personal-word">ЛИЧНО.</span>
    <span class="bridge__art bridge__doner-card" data-transition-target="doner-card">
      <span>ПИВНОЙ</span><b>ДОНЕР</b>
    </span>
    <span class="bridge__art bridge__poster-field" data-transition-morph="personal-poster"><i></i></span>`,
  'clean-takeover': `
    <span class="bridge__art bridge__takeover-poster" data-transition-source="doner-poster">
      <i><span>ПИВНОЙ</span><b>ДОНЕР</b></i>
    </span>
    <span class="bridge__art bridge__takeover-road" data-transition-target="school-road"><i></i></span>
    <span class="bridge__art bridge__takeover-field" data-transition-morph="poster-takeover"></span>`,
  'road-to-phone': `
    <span class="bridge__art bridge__road-source" data-transition-source="school-road"><i></i></span>
    <span class="bridge__art bridge__food-phone" data-transition-target="shaurma-phone">
      ${decorativeImage('/assets/projects/shaurma-mobile-mobile-390.webp', 390, 844)}
    </span>
    <span class="bridge__art bridge__road-frame" data-transition-morph="road-frame"></span>`,
  'phone-to-telegram': `
    <span class="bridge__art bridge__food-phone bridge__food-phone--source" data-transition-source="shaurma-phone">
      ${decorativeImage('/assets/projects/shaurma-mobile-mobile-390.webp', 390, 844)}
    </span>
    <span class="bridge__art bridge__telegram-phone" data-transition-target="telegram-phone">
      ${decorativeImage('/assets/projects/telegram-shop-mobile-390.webp', 390, 844)}
    </span>
    <span class="bridge__art bridge__phone-handoff" data-transition-morph="phone-handoff"></span>`,
  'message-to-contact': `
    <span class="bridge__art bridge__message-source" data-transition-source="last-message"><i></i><b>Готово. Запускаем?</b></span>
    <span class="bridge__art bridge__contact-word" data-transition-target="contact-word">ДАВАЙ</span>
    <span class="bridge__art bridge__contact-field" data-transition-morph="message-field"></span>`,
};

export const transitionBridge = (transition: TransitionContent) => `
  <div class="bridge bridge--${transition.kind}" data-transition="${transition.kind}" data-transition-from="${transition.from}" data-transition-to="${transition.to}"${transition.kind === 'clean-takeover' ? ' data-transition-composition="t1-clean-takeover"' : ''} aria-hidden="true">
    <div class="bridge__stage" data-transition-stage>
      <strong class="bridge__copy" data-transition-copy>${transition.phrase}</strong>
      <div class="bridge__carrier" data-transition-carrier>
        ${artwork[transition.kind]}
      </div>
    </div>
  </div>`;
