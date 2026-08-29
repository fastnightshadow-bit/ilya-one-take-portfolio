export const aboutScene = () => `
  <section class="scene about" id="about" data-scene="about" aria-labelledby="about-title">
    <div class="scene__meta"><span>Человек за проектами</span><span>02 / Илья</span></div>
    <div class="about__copy">
      <p class="eyebrow">Привет. Я — Илья.</p>
      <h2 id="about-title">Делаю сайты <span>лично.</span></h2>
      <p class="about__lede">Разбираюсь в задаче, предлагаю идею, проектирую интерфейс и пишу код. Ты общаешься со мной напрямую — от первого разговора до запуска.</p>
      <p class="about__promise" data-about-promise><span class="about__promise-line"><span>ОДИН ЧЕЛОВЕК.</span></span> <span class="about__promise-line"><span>ВЕСЬ САЙТ.</span></span></p>
    </div>
    <picture class="about__portrait">
      <source type="image/avif" srcset="/assets/portrait/portrait-720.avif 720w, /assets/portrait/portrait-1200.avif 1200w" sizes="(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)">
      <source type="image/webp" srcset="/assets/portrait/portrait-720.webp 720w, /assets/portrait/portrait-1200.webp 1200w" sizes="(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)">
      <img src="/assets/portrait/portrait-1200.png" width="1200" height="1500" sizes="(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)" alt="Илья, веб-разработчик" loading="lazy" decoding="async">
    </picture>
    <div class="about__facts">
      <p><b>01</b><span>Общение напрямую<small>Без потерянных деталей между людьми</small></span></p>
      <p><b>02</b><span>Дизайн и код в одних руках<small>Идея сохраняется до готового сайта</small></span></p>
      <p><b>03</b><span>Понятный процесс<small>Ты видишь прогресс на каждом этапе</small></span></p>
    </div>
  </section>`;
