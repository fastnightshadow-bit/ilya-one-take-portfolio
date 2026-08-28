import type { SiteContent } from '../content/siteContent.ts';

export const githubStrip = (content: SiteContent) => `
  <aside class="github-strip" aria-labelledby="github-strip-title">
    <div><h2 id="github-strip-title">Код тоже можно посмотреть.</h2><p>Публичные репозитории и новые работы — в профиле Ильи.</p></div>
    <a class="github-strip__link" data-github-link href="${content.githubUrl}">GitHub Ильи <span aria-hidden="true">↗</span></a>
  </aside>`;
