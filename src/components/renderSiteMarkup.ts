import type { SiteContent } from '../content/siteContent.ts';
import { aboutScene } from './aboutScene.ts';
import { caseChapter } from './caseChapter.ts';
import { contactScene } from './contactScene.ts';
import { heroScene } from './heroScene.ts';
import { githubStrip } from './githubStrip.ts';
import { processStrip } from './processStrip.ts';
import { siteHeader } from './siteHeader.ts';
import { transitionBridge } from './transitionBridge.ts';

export function renderSiteMarkup(content: SiteContent): string {
  const [doner, school, shaurma, telegram] = content.projects;
  if (!doner || !school || !shaurma || !telegram || content.projects.length !== 4) throw new Error('Exactly four projects are required');
  const [toAbout, toDoner, toSchool, toShaurma, toTelegram, toContact] = content.transitions;
  if (!toAbout || !toDoner || !toSchool || !toShaurma || !toTelegram || !toContact || content.transitions.length !== 6) throw new Error('Six transitions are required');

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
      ${transitionBridge(toShaurma)}
      ${caseChapter(shaurma)}
      ${transitionBridge(toTelegram)}
      ${caseChapter(telegram)}
      ${githubStrip(content)}
      ${transitionBridge(toContact)}
      ${contactScene(content)}
    </main>
  </div>`;
}
