import type { SiteContent } from '../content/siteContent.ts';

export const contactScene = (content: SiteContent) => `
  <section class="scene contact" id="contact" data-scene="contact" aria-labelledby="contact-title">
    <h2 id="contact-title">Давайте сделаем ваш сайт</h2>
    <p>Расскажите коротко о проекте. Я отвечу лично и предложу, с чего лучше начать.</p>
    <a class="button button--contact" data-primary-cta href="${content.telegramUrl}" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
  </section>`;
