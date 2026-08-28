import type { ProjectContent } from '../content/siteContent.ts';

const projectVisual = (theme: ProjectContent['theme']) => ({
  doner: '<div class="doner-poster" aria-hidden="true"><b>ПИВНОЙ<br>ДОНЕР</b><small>BRAND × WEB × ORDER</small></div>',
  school: '<svg class="school-road" viewBox="0 0 320 420" aria-hidden="true" focusable="false"><path class="school-road__track" d="M260 36 C80 118 290 248 74 384"/><path class="school-road__marks" d="M260 36 C80 118 290 248 74 384"/></svg>',
  telegram: '<div class="bot-phone" aria-hidden="true"><i>Привет! Что ищем?</i><i>Каталог товаров →</i><i>Добавлено в корзину ✓</i></div>',
})[theme];

export const caseChapter = (project: ProjectContent) => `
  <section class="scene case case--${project.theme}" id="${project.id}" data-scene="${project.id}" data-project aria-labelledby="${project.id}-title">
    <div class="scene__meta"><span>${project.eyebrow}</span></div>
    ${projectVisual(project.theme)}
    <div class="case__copy"><h2 id="${project.id}-title" class="case__title">${project.title}</h2><p class="case__headline">${project.headline} <span class="case__accent">${project.accent}</span></p><p>${project.description}</p><span class="case__label">${project.chapterLabel}</span></div>
  </section>`;
