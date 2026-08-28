import { describe, expect, it } from 'vitest';

describe('application entry point', () => {
  it('preserves the statically rendered site in #app', async () => {
    document.body.innerHTML = '<div id="app"><div data-site-static><main><h1>Илья — веб-разработчик</h1></main></div></div>';

    await import('./main');

    expect(document.querySelector('#app')?.innerHTML).toBe('<div data-site-static=""><main><h1>Илья — веб-разработчик</h1></main></div>');
  });
});
