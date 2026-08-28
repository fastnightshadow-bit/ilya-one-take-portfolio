import type { SiteContent } from '../content/siteContent.ts';

export const heroScene = (content: SiteContent) => `
  <section class="scene hero" id="top" data-scene="hero" aria-labelledby="hero-title">
    <div class="scene__meta"><span>Independent web developer</span><span>01 / Intro</span></div>
    <span class="hero__ghost" aria-hidden="true">01</span>
    <div class="hero__copy">
      <h1 id="hero-title">Сайты, <br>которые <span class="hero__word" data-rotating-word data-words="${content.rotatingWords.join('|')}">${content.rotatingWords[0]}</span></h1>
      <p>Я Илья. Придумываю, проектирую и разрабатываю сайты для бизнеса — от первой идеи до запуска.</p>
      <a class="button" href="#about">Смотреть дальше ↓</a>
    </div>
    <span class="hero__scroll" aria-hidden="true">SCROLL TO TRANSFORM</span>
  </section>`;
