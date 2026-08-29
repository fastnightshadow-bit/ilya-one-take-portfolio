import { createSite } from './components/createSite.ts';
import { siteContent } from './content/siteContent.ts';
import { createMotionController } from './motion/createMotionController.ts';
import { keepFocusedLinkVisible } from './navigation/keepFocusedLinkVisible.ts';
import { applyMetadata } from './seo/applyMetadata.ts';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app was not found');
applyMetadata(document, siteContent);
if (!app.querySelector('[data-site-static]')) app.replaceChildren(createSite(siteContent));

const motion = createMotionController();
motion.mount(app);
const stopKeepingNavigationFocusVisible = keepFocusedLinkVisible(app);

if (import.meta.hot) import.meta.hot.dispose(() => {
  motion.destroy();
  stopKeepingNavigationFocusVisible();
});
