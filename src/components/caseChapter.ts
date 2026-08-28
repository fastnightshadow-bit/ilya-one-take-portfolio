import type { ProjectContent } from '../content/siteContent.ts';

const projectVisual = (theme: ProjectContent['theme']) => ({
  doner: '<div class="doner-poster" aria-hidden="true"><b>ПИВНОЙ<br>ДОНЕР</b><small>BRAND × WEB × ORDER</small></div>',
  school: '<div class="school-road" aria-hidden="true"></div><span class="school-sign" aria-hidden="true">START<br>HERE</span>',
  telegram: '<div class="bot-phone" aria-hidden="true"><i>Привет! Что ищем?</i><i>Каталог товаров →</i><i>Добавлено в корзину ✓</i></div>',
})[theme];

export const caseChapter = (project: ProjectContent, index: number) => `
  <section class="scene case case--${project.theme}" id="${project.id}" data-scene="${project.id}" data-project aria-labelledby="${project.id}-title">
    <div class="scene__meta"><span>${project.eyebrow}</span><span>0${index + 3} / Project</span></div>
    ${projectVisual(project.theme)}
    <div class="case__copy"><h2 id="${project.id}-title"><span class="case__title">${project.title}</span><span class="case__headline">${project.headline} <span class="case__accent">${project.accent}</span></span></h2><p>${project.description}</p><span class="case__label">${project.chapterLabel}</span></div>
  </section>`;
