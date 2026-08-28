import { defineConfig } from 'vitest/config';
import { renderSiteMarkup } from './src/components/renderSiteMarkup.ts';
import { siteContent } from './src/content/siteContent.ts';
import { renderMetadataMarkup } from './src/seo/applyMetadata.ts';

export default defineConfig({
  plugins: [{
    name: 'static-portfolio-markup',
    transformIndexHtml(html) {
      return html
        .replace('<!-- static-seo -->', renderMetadataMarkup(siteContent))
        .replace('<div id="app"></div>', `<div id="app">${renderSiteMarkup(siteContent)}</div>`);
    },
  }],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
});
