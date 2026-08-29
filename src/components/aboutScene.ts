export const aboutScene = () => `
  <section class="scene about" id="about" data-scene="about" aria-labelledby="about-title">
    <div class="about__copy">
      <h2 id="about-title">Делаю сайты лично</h2>
      <p class="about__lede">Я сам разбираюсь в вашей задаче, продумываю структуру, проектирую интерфейс и разрабатываю сайт. Вы общаетесь напрямую со мной — от первого разговора до запуска.</p>
    </div>
    <picture class="about__portrait">
      <source type="image/avif" srcset="./assets/portrait/portrait-720.avif 720w, ./assets/portrait/portrait-1200.avif 1200w" sizes="(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)">
      <source type="image/webp" srcset="./assets/portrait/portrait-720.webp 720w, ./assets/portrait/portrait-1200.webp 1200w" sizes="(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)">
      <img src="./assets/portrait/portrait-1200.png" width="1200" height="1500" sizes="(max-width: 700px) 92vw, min(44vw, 72.652svh, 637.92px)" alt="Илья, веб-разработчик" loading="lazy" decoding="async">
    </picture>
  </section>`;
