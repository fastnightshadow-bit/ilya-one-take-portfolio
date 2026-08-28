import type { SiteContent } from '../content/siteContent.ts';

export const siteHeader = (content: SiteContent) => `
  <header class="site-header">
    <a class="site-header__brand" href="#top">ILYA / WEB DEVELOPER</a>
    <span class="site-header__position"><i aria-hidden="true"></i>DESIGN × CODE × LAUNCH</span>
    <a class="site-header__contact" data-primary-cta href="${content.telegramUrl}">${content.telegramHandle} ↗</a>
  </header>`;
