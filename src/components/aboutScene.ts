export const aboutScene = () => `
  <section class="scene about" id="about" data-scene="about" aria-labelledby="about-title">
    <div class="scene__meta"><span>Человек за проектами</span><span>02 / Илья</span></div>
    <div class="about__copy">
      <p class="eyebrow">Привет. Я — Илья.</p>
      <h2 id="about-title">Делаю сайты <span>лично.</span></h2>
      <p>Разбираюсь в задаче, предлагаю идею, проектирую интерфейс и пишу код. Ты общаешься со мной напрямую — от первого разговора до запуска.</p>
    </div>
    <picture class="about__portrait">
      <source type="image/avif" srcset="/assets/portrait/portrait-720.avif 720w, /assets/portrait/portrait-1200.avif 1200w">
      <source type="image/webp" srcset="/assets/portrait/portrait-720.webp 720w, /assets/portrait/portrait-1200.webp 1200w">
      <img src="/assets/portrait/portrait-1200.png" width="1200" height="1500" alt="Илья, веб-разработчик" fetchpriority="high">
    </picture>
    <svg class="about__scribble" viewBox="0 0 550 740" aria-hidden="true"><path class="scribble--coral" d="M500 80 C400 25 290 52 220 126 C150 202 125 330 150 450 C172 560 250 640 400 695"/><path class="scribble--blue" d="M92 170 C180 98 285 88 374 135 C464 184 491 290 455 405 C425 515 335 598 215 630"/></svg>
    <div class="about__facts">
      <p><b>01</b><span>Общение напрямую<small>Без потерянных деталей между людьми</small></span></p>
      <p><b>02</b><span>Дизайн и код в одних руках<small>Идея сохраняется до готового сайта</small></span></p>
      <p><b>03</b><span>Понятный процесс<small>Ты видишь прогресс на каждом этапе</small></span></p>
    </div>
  </section>`;
