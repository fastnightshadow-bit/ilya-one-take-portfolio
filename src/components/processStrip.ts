import type { SiteContent } from '../content/siteContent.ts';

export const processStrip = (content: SiteContent) => `
  <section class="process" aria-label="Процесс работы">
    ${content.process.map((step) => `<article><em>${step.number}</em><h2>${step.title}</h2><p>${step.detail}</p></article>`).join('')}
  </section>`;
