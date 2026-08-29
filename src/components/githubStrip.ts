import type { SiteContent } from '../content/siteContent.ts';

export const githubStrip = (content: SiteContent) => `
  <aside class="github-strip" aria-labelledby="github-strip-title">
    <div><h2 id="github-strip-title">Посмотрите, как я работаю с кодом</h2><p>Исходный код открытых проектов и новые работы собраны в моём профиле.</p></div>
    <a class="github-strip__link" data-github-link href="${content.githubUrl}" target="_blank" rel="noopener noreferrer">Открыть GitHub</a>
  </aside>`;
