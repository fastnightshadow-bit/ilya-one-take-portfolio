import type { SiteContent } from '../content/siteContent.ts';
import { elementFromHtml } from './dom.ts';
import { renderSiteMarkup } from './renderSiteMarkup.ts';

export function createSite(content: SiteContent): HTMLElement {
  return elementFromHtml(renderSiteMarkup(content));
}
