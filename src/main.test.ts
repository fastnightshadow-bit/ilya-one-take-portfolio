import { describe, expect, it } from 'vitest';

describe('application entry point', () => {
  it('preserves the no-script fallback content in #app', async () => {
    document.body.innerHTML = '<div id="app"><main><h1>Илья — веб-разработчик</h1></main></div>';

    await import('./main');

    expect(document.querySelector('#app')?.innerHTML).toBe('<main><h1>Илья — веб-разработчик</h1></main>');
  });
});
