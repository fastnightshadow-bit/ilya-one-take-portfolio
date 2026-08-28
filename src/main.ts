import { createSite } from './components/createSite.ts';
import { siteContent } from './content/siteContent.ts';
import { createMotionController } from './motion/createMotionController.ts';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app was not found');
if (!app.querySelector('[data-site-static]')) app.replaceChildren(createSite(siteContent));

const motion = createMotionController();
motion.mount(app);

if (import.meta.hot) import.meta.hot.dispose(() => motion.destroy());
