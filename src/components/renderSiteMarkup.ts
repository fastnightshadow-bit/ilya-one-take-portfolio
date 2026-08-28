import type { SiteContent } from '../content/siteContent.ts';
import { aboutScene } from './aboutScene.ts';
import { caseChapter } from './caseChapter.ts';
import { contactScene } from './contactScene.ts';
import { heroScene } from './heroScene.ts';
import { processStrip } from './processStrip.ts';
import { siteHeader } from './siteHeader.ts';
import { transitionBridge } from './transitionBridge.ts';

export function renderSiteMarkup(content: SiteContent): string {
  const [doner, school, telegram] = content.projects;
  if (!doner || !school || !telegram) throw new Error('Exactly three projects are required');
  const [toAbout, toDoner, toSchool, toTelegram, toContact] = content.transitions;
  if (!toAbout || !toDoner || !toSchool || !toTelegram || !toContact) throw new Error('Five transitions are required');

  return `<div class="site-shell" data-site-static>
    ${siteHeader(content)}
    <main>
      ${heroScene(content)}
      ${transitionBridge(toAbout)}
      ${aboutScene()}
      ${processStrip(content)}
      ${transitionBridge(toDoner)}
      ${caseChapter(doner)}
      ${transitionBridge(toSchool)}
      ${caseChapter(school)}
      ${transitionBridge(toTelegram)}
      ${caseChapter(telegram)}
      ${transitionBridge(toContact)}
      ${contactScene(content)}
    </main>
  </div>`;
}
