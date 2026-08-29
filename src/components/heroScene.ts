import type { SiteContent } from '../content/siteContent.ts';

export const heroScene = (content: SiteContent) => `
  <section class="scene hero" id="top" data-scene="hero" aria-labelledby="hero-title">
    <div class="hero__copy">
      <h1 id="hero-title">Сайты, <br>которые <span class="hero__fallback" data-hero-fallback>${content.rotatingWords.map((word) => `<span>${word}</span>`).join(' ')}</span><span class="hero__word" data-rotating-word data-words="${content.rotatingWords.join('|')}" aria-hidden="true">${content.rotatingWords[0]}</span></h1>
      <p>Проектирую и разрабатываю сайты для бизнеса от первой идеи до запуска.</p>
      <div class="hero__actions">
        <a class="button" href="#pivnoy-doner">Смотреть портфолио</a>
        <a class="button button--secondary" href="#about">Обо мне</a>
      </div>
    </div>
  </section>`;
