import type { ProjectContent, ProjectScreenshot } from '../content/siteContent.ts';

type ScreenshotRole = 'desktop' | 'mobile';

interface ScreenshotOptions {
  readonly role: ScreenshotRole;
  readonly shotId: string;
  readonly assetId: string;
  readonly screenshot: ProjectScreenshot;
  readonly primary: boolean;
  readonly sizes?: string;
}

const projectScreenshot = ({ role, shotId, assetId, screenshot, primary, sizes }: ScreenshotOptions) => {
  const path = `./assets/projects/${assetId}`;
  const candidates = role === 'desktop'
    ? `${path}-720.FORMAT 720w, ${path}-1280.FORMAT 1280w`
    : `${path}-390.FORMAT 390w`;
  const responsiveSizes = sizes ?? (role === 'desktop'
    ? '(max-width: 700px) 86vw, (max-width: 1199px) 74vw, 48vw'
    : '(max-width: 700px) 46vw, (max-width: 1199px) 32vw, 18vw');

  return `<picture class="project-shot project-shot--${role}${primary ? ' project-shot--primary' : ' project-shot--secondary'}" data-project-shot="${shotId}">
    <source type="image/avif" srcset="${candidates.replaceAll('FORMAT', 'avif')}" sizes="${responsiveSizes}">
    <source type="image/webp" srcset="${candidates.replaceAll('FORMAT', 'webp')}" sizes="${responsiveSizes}">
    <img src="${path}-${role === 'desktop' ? '1280' : '390'}.jpg" srcset="${candidates.replaceAll('FORMAT', 'jpg')}" sizes="${responsiveSizes}" width="${screenshot.width}" height="${screenshot.height}" loading="lazy" decoding="async" alt="${screenshot.alt}">
  </picture>`;
};

const projectMedia = (project: ProjectContent) => {
  const presentation = project.presentation;
  const media = presentation.kind === 'phone'
    ? `<div class="case__phone-gallery" data-project-gallery>
        ${projectScreenshot({
          role: 'mobile',
          shotId: 'mobile',
          assetId: `${project.id}-mobile`,
          screenshot: presentation.mobile,
          primary: true,
        })}
        ${presentation.desktopGallery.map((shot) => projectScreenshot({
          role: 'mobile',
          shotId: shot.assetId.slice(project.id.length + 1),
          assetId: shot.assetId,
          screenshot: shot,
          primary: false,
          sizes: '(max-width: 1199px) 0px, 18vw',
        })).join('')}
      </div>`
    : presentation.primary === 'mobile'
      ? `${projectScreenshot({ role: 'mobile', shotId: 'mobile', assetId: `${project.id}-mobile`, screenshot: presentation.mobile, primary: true })}${projectScreenshot({ role: 'desktop', shotId: 'desktop', assetId: `${project.id}-desktop`, screenshot: presentation.desktop, primary: false })}`
      : `${projectScreenshot({ role: 'desktop', shotId: 'desktop', assetId: `${project.id}-desktop`, screenshot: presentation.desktop, primary: true })}${projectScreenshot({ role: 'mobile', shotId: 'mobile', assetId: `${project.id}-mobile`, screenshot: presentation.mobile, primary: false })}`;

  return `<div class="case__media case__media--${presentation.kind} case__media--primary-${presentation.primary}" data-project-media>${media}</div>`;
};

const authoredLines = (lines: readonly string[], attribute: 'data-headline-line' | 'data-accent-line') =>
  lines.map((line) => `<span ${attribute}>${line}</span>`).join(' ');

const projectHeadline = (project: ProjectContent) => {
  const headline = project.headlineLines
    ? authoredLines(project.headlineLines, 'data-headline-line')
    : project.headline;
  const accent = project.accentLines
    ? authoredLines(project.accentLines, 'data-accent-line')
    : project.accent;

  return `${headline} <span class="case__accent">${accent}</span>`;
};

export const caseChapter = (project: ProjectContent) => `
  <section class="scene case case--${project.theme}" id="${project.id}" data-scene="${project.id}" data-project aria-labelledby="${project.id}-title">
    <div class="scene__meta"><span>${project.eyebrow}</span></div>
    <div class="case__layout">
      <div class="case__copy"><h2 id="${project.id}-title" class="case__title">${project.title}</h2><p class="case__headline">${projectHeadline(project)}</p><p>${project.description}</p><a class="case__action" data-project-action href="${project.action.href}" target="_blank" rel="noopener noreferrer">${project.action.label}</a></div>
      ${projectMedia(project)}
    </div>
  </section>`;
