import type { SiteContent } from '../content/siteContent.ts';

export const siteHeader = (content: SiteContent) => `
  <header class="site-header">
    <div class="site-header__identity">
      <a class="site-header__brand" href="#top">ILYA / WEB DEVELOPER</a>
      <a class="site-header__contact" href="${content.telegramUrl}" target="_blank" rel="noopener noreferrer">${content.telegramHandle}</a>
    </div>
    <button class="site-header__toggle" data-mobile-nav-toggle type="button" aria-controls="site-navigation" aria-expanded="false" aria-label="Открыть меню">
      <span class="site-header__toggle-line" aria-hidden="true"></span>
      <span class="site-header__toggle-line" aria-hidden="true"></span>
      <span class="site-header__toggle-line" aria-hidden="true"></span>
    </button>
    <nav class="site-header__nav" id="site-navigation" aria-label="Основная навигация">
      <a class="site-header__link" href="#about">Обо мне</a>
      <a class="site-header__link" href="#process">Как я работаю</a>
      <a class="site-header__link" href="#pivnoy-doner">Кейс 1</a>
      <a class="site-header__link" href="#driving-school">Кейс 2</a>
      <a class="site-header__link" href="#shaurma-mobile">Кейс 3</a>
      <a class="site-header__link" href="#telegram-shop">Кейс 4</a>
      <a class="site-header__link" href="#contact">Контакты</a>
    </nav>
  </header>`;
