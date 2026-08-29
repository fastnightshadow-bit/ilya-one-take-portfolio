import type { ProjectContent } from '../content/siteContent.ts';

const screenshotPath = (project: ProjectContent, role: 'desktop' | 'mobile') =>
  `./assets/projects/${project.id}-${role}`;

const projectScreenshot = (project: ProjectContent, role: 'desktop' | 'mobile', primary: boolean) => {
  const screenshot = project.presentation.kind === 'responsive'
    ? project.presentation[role]
    : project.presentation.mobile;
  const path = screenshotPath(project, role);
  const candidates = role === 'desktop'
    ? `${path}-720.FORMAT 720w, ${path}-1280.FORMAT 1280w`
    : `${path}-390.FORMAT 390w`;
  const sizes = role === 'desktop'
    ? '(max-width: 700px) 86vw, (max-width: 1199px) 74vw, 48vw'
    : '(max-width: 700px) 46vw, (max-width: 1199px) 32vw, 22vw';

  return `<picture class="project-shot project-shot--${role}${primary ? ' project-shot--primary' : ' project-shot--secondary'}" data-project-shot="${role}">
    <source type="image/avif" srcset="${candidates.replaceAll('FORMAT', 'avif')}" sizes="${sizes}">
    <source type="image/webp" srcset="${candidates.replaceAll('FORMAT', 'webp')}" sizes="${sizes}">
    <img src="${path}-${role === 'desktop' ? '1280' : '390'}.jpg" srcset="${candidates.replaceAll('FORMAT', 'jpg')}" sizes="${sizes}" width="${screenshot.width}" height="${screenshot.height}" loading="lazy" decoding="async" alt="${screenshot.alt}">
  </picture>`;
};

const projectMedia = (project: ProjectContent) => {
  const presentation = project.presentation;
  const detail = project.theme === 'mobile'
    ? '<div class="case__detail" data-project-detail aria-hidden="true"></div>'
    : '';
  const media = presentation.kind === 'phone'
    ? `${detail}${projectScreenshot(project, 'mobile', true)}`
    : presentation.primary === 'mobile'
      ? `${projectScreenshot(project, 'mobile', true)}${projectScreenshot(project, 'desktop', false)}`
      : `${projectScreenshot(project, 'desktop', true)}${projectScreenshot(project, 'mobile', false)}`;

  return `<div class="case__media case__media--${presentation.kind} case__media--primary-${presentation.primary}" data-project-media>${media}</div>`;
};

export const caseChapter = (project: ProjectContent) => `
  <section class="scene case case--${project.theme}" id="${project.id}" data-scene="${project.id}" data-project aria-labelledby="${project.id}-title">
    <div class="scene__meta"><span>${project.eyebrow}</span></div>
    <div class="case__layout">
      <div class="case__copy"><h2 id="${project.id}-title" class="case__title">${project.title}</h2><p class="case__headline">${project.headline} <span class="case__accent">${project.accent}</span></p><p>${project.description}</p><a class="case__action" data-project-action href="${project.action.href}" target="_blank" rel="noopener noreferrer">${project.action.label}</a></div>
      ${projectMedia(project)}
    </div>
  </section>`;
