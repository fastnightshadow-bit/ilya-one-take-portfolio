export type ProjectTheme = 'doner' | 'school' | 'mobile' | 'telegram';

export interface ProjectScreenshot {
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export type ProjectPresentation =
  | {
      readonly kind: 'responsive';
      readonly primary: 'desktop' | 'mobile';
      readonly desktop: ProjectScreenshot;
      readonly mobile: ProjectScreenshot;
    }
  | {
      readonly kind: 'phone';
      readonly primary: 'mobile';
      readonly mobile: ProjectScreenshot;
    };

export interface ProjectAction {
  readonly href: `https://${string}`;
  readonly label: string;
}

export interface ProjectContent {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly headline: string;
  readonly accent: string;
  readonly description: string;
  readonly chapterLabel: string;
  readonly theme: ProjectTheme;
  readonly action: ProjectAction;
  readonly presentation: ProjectPresentation;
}

export type SceneId =
  | 'hero'
  | 'about'
  | 'pivnoy-doner'
  | 'driving-school'
  | 'shaurma-mobile'
  | 'telegram-shop'
  | 'contact';

export type TransitionKind =
  | 'ticker-to-about'
  | 'personal-to-poster'
  | 'clean-takeover'
  | 'road-to-phone'
  | 'phone-to-telegram'
  | 'message-to-contact';

export interface TransitionContent {
  readonly kind: TransitionKind;
  readonly from: SceneId;
  readonly to: SceneId;
  readonly phrase: string;
}

export interface SiteContent {
  readonly telegramUrl: string;
  readonly telegramHandle: string;
  readonly githubUrl: `https://${string}`;
  readonly rotatingWords: readonly string[];
  readonly process: readonly { number: string; title: string; detail: string }[];
  readonly projects: readonly ProjectContent[];
  readonly transitions: readonly TransitionContent[];
}

const transitions = [
  { kind: 'ticker-to-about', from: 'hero', to: 'about', phrase: 'ИДЕЯ / ДИЗАЙН / КОД / ЗАПУСК' },
  { kind: 'personal-to-poster', from: 'about', to: 'pivnoy-doner', phrase: 'ЛИЧНО. → ПИВНОЙ ДОНЕР' },
  { kind: 'clean-takeover', from: 'pivnoy-doner', to: 'driving-school', phrase: 'ПИВНОЙ ДОНЕР → АВТОШКОЛА' },
  { kind: 'road-to-phone', from: 'driving-school', to: 'shaurma-mobile', phrase: 'ДОРОГА → ТЕЛЕФОН' },
  { kind: 'phone-to-telegram', from: 'shaurma-mobile', to: 'telegram-shop', phrase: 'ШАУРМА → TELEGRAM' },
  { kind: 'message-to-contact', from: 'telegram-shop', to: 'contact', phrase: 'СООБЩЕНИЕ → ДАВАЙ' },
] as const satisfies readonly TransitionContent[];

export const siteContent: SiteContent = {
  telegramUrl: 'https://t.me/girtopw',
  telegramHandle: '@girtopw',
  githubUrl: 'https://github.com/fastnightshadow-bit',
  rotatingWords: ['цепляют.', 'продают.', 'помнят.'],
  process: [
    { number: '01', title: 'Знакомство', detail: 'Цель, бизнес, аудитория' },
    { number: '02', title: 'Концепция', detail: 'Структура и сильная идея' },
    { number: '03', title: 'Разработка', detail: 'Код, адаптив, проверка' },
    { number: '04', title: 'Запуск', detail: 'Домен, аналитика, передача' },
  ],
  projects: [
    {
      id: 'pivnoy-doner',
      title: 'Пивной Донер',
      eyebrow: 'Case 01 · Food / Commerce',
      headline: 'Из локального места',
      accent: 'в цифровой бренд.',
      description: 'Сайт для «Пивного Донера»: сильный образ, понятное меню и короткий путь до заказа.',
      chapterLabel: 'Brand × Web × Order',
      theme: 'doner',
      action: { href: 'https://pivdoner.ru/', label: 'Открыть сайт' },
      presentation: {
        kind: 'responsive',
        primary: 'desktop',
        desktop: { alt: 'Главная страница «Пивного Донера» на компьютере', width: 1280, height: 720 },
        mobile: { alt: 'Главная страница «Пивного Донера» на телефоне', width: 390, height: 844 },
      },
    },
    {
      id: 'driving-school',
      title: 'Автошкола «Перекрёсток»',
      eyebrow: 'Case 02 · Service / Education',
      headline: 'Понятный путь',
      accent: 'к первым правам.',
      description: 'Сайт автошколы, который объясняет обучение, снимает сомнения и ведёт к записи.',
      chapterLabel: 'Service × Education',
      theme: 'school',
      action: { href: 'https://perekrestok-yaroslavl.netlify.app/', label: 'Открыть сайт' },
      presentation: {
        kind: 'responsive',
        primary: 'mobile',
        desktop: { alt: 'Главная страница автошколы «Перекрёсток» на компьютере', width: 1280, height: 720 },
        mobile: { alt: 'Главная страница автошколы «Перекрёсток» на телефоне', width: 390, height: 844 },
      },
    },
    {
      id: 'shaurma-mobile',
      title: 'Шаурма Халяль 1',
      eyebrow: 'Case 03 · Mobile / Commerce',
      headline: 'Заказ еды',
      accent: 'с телефона.',
      description: 'Mobile-first сайт с меню, корзиной, точкой продаж и маршрутом без лишних экранов.',
      chapterLabel: 'Mobile × Menu × Cart',
      theme: 'mobile',
      action: { href: 'https://fastnightshadow-bit.github.io/chaurma/', label: 'Открыть mobile-сайт' },
      presentation: {
        kind: 'phone',
        primary: 'mobile',
        mobile: { alt: 'Главная страница «Шаурма Халяль 1» на телефоне', width: 390, height: 844 },
      },
    },
    {
      id: 'telegram-shop',
      title: 'VeachelSell',
      eyebrow: 'Case 04 · Telegram / Commerce',
      headline: 'Магазин внутри',
      accent: 'Telegram.',
      description: 'Telegram-магазин техники, одежды и обуви с поиском, фильтрами, избранным и корзиной.',
      chapterLabel: 'Bot × Catalog × Order',
      theme: 'telegram',
      action: { href: 'https://t.me/veachelsell_bot', label: 'Запустить бота' },
      presentation: {
        kind: 'phone',
        primary: 'mobile',
        mobile: { alt: 'Каталог Telegram-магазина VeachelSell', width: 390, height: 844 },
      },
    },
  ],
  transitions,
};
