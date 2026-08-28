import type { SiteContent } from '../content/siteContent.ts';

export const contactScene = (content: SiteContent) => `
  <section class="scene contact" data-scene="contact" aria-labelledby="contact-title">
    <div class="scene__meta"><span>Есть задача?</span><span>06 / Contact</span></div>
    <h2 id="contact-title">Давай сделаем <span>твой сайт.</span></h2>
    <p>Напиши пару слов о проекте. Я отвечу лично и предложу, с чего лучше начать.</p>
    <a class="button button--contact" data-primary-cta href="${content.telegramUrl}">Написать в Telegram →</a>
    <strong class="contact__handle" aria-hidden="true">${content.telegramHandle}</strong>
  </section>`;
