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

export type TransitionVariant = 'ink' | 'route' | 'mobile' | 'chat' | 'final';

export interface TransitionContent {
  readonly kind: TransitionKind;
  readonly from: SceneId;
  readonly to: SceneId;
  readonly phrase: string;
  readonly variant: TransitionVariant;
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
  { kind: 'ticker-to-about', from: 'hero', to: 'about', phrase: 'ИДЕЯ → ДИЗАЙН → КОД → РЕЗУЛЬТАТ', variant: 'ink' },
  { kind: 'personal-to-poster', from: 'about', to: 'pivnoy-doner', phrase: 'БИЗНЕС → ВКУС → БРЕНД → ЗАКАЗ', variant: 'ink' },
  { kind: 'clean-takeover', from: 'pivnoy-doner', to: 'driving-school', phrase: 'ОТ ПЕРВОГО КЛИКА → К ПЕРВОЙ ПОЕЗДКЕ', variant: 'route' },
  { kind: 'road-to-phone', from: 'driving-school', to: 'shaurma-mobile', phrase: 'САЙТ → ТЕЛЕФОН → МЕНЮ → ЗАКАЗ', variant: 'mobile' },
  { kind: 'phone-to-telegram', from: 'shaurma-mobile', to: 'telegram-shop', phrase: 'САЙТ → ЧАТ → КАТАЛОГ → МАГАЗИН', variant: 'chat' },
  { kind: 'message-to-contact', from: 'telegram-shop', to: 'contact', phrase: 'ДИЗАЙН × КОД × БИЗНЕС', variant: 'final' },
] as const satisfies readonly TransitionContent[];

export const siteContent: SiteContent = {
  telegramUrl: 'https://t.me/girtopw',
  telegramHandle: '@GIRTOPW',
  githubUrl: 'https://github.com/fastnightshadow-bit',
  rotatingWords: ['цепляют', 'продают', 'работают'],
  process: [
    {
      number: '01',
      title: 'Знакомство',
      detail: 'Обсуждаем ваш бизнес, задачу и аудиторию. Определяем цель сайта и нужное действие посетителя.',
    },
    {
      number: '02',
      title: 'Концепция',
      detail: 'Продумываю структуру, содержание и визуальное направление. Согласовываем концепцию до начала разработки.',
    },
    {
      number: '03',
      title: 'Разработка',
      detail: 'Собираю сайт и адаптирую его под разные экраны. Проверяю скорость, доступность и работу всех функций.',
    },
    {
      number: '04',
      title: 'Запуск',
      detail: 'Подключаю домен и аналитику, затем провожу финальную проверку. Передаю готовый сайт и объясняю, как им пользоваться.',
    },
  ],
  projects: [
    {
      id: 'pivnoy-doner',
      title: 'Пивной Донер',
      eyebrow: 'Кейс 1 · Сайт для ресторана',
      headline: 'Из локального ресторана',
      accent: 'в узнаваемый бренд',
      description: 'Сайт с ярким образом, понятным меню и быстрым переходом к заказу.',
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
      eyebrow: 'Кейс 2 · Сайт автошколы',
      headline: 'Понятный путь',
      accent: 'к первым правам',
      description: 'Сайт понятно рассказывает об обучении, отвечает на основные вопросы и помогает записаться.',
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
      eyebrow: 'Кейс 3 · Сайт для заказа еды',
      headline: 'Заказ еды',
      accent: 'с телефона',
      description: 'Меню, корзина, адрес точки и маршрут собраны без лишних экранов.',
      theme: 'mobile',
      action: { href: 'https://fastnightshadow-bit.github.io/chaurma/', label: 'Открыть сайт' },
      presentation: {
        kind: 'phone',
        primary: 'mobile',
        mobile: { alt: 'Главная страница «Шаурма Халяль 1» на телефоне', width: 390, height: 844 },
      },
    },
    {
      id: 'telegram-shop',
      title: 'VeachelSell',
      eyebrow: 'Кейс 4 · Магазин в Telegram',
      headline: 'Покупки прямо',
      accent: 'в Telegram',
      description: 'Каталог, поиск, фильтры, избранное и корзина доступны прямо в Telegram.',
      theme: 'telegram',
      action: { href: 'https://t.me/veachelsell_bot', label: 'Открыть магазин' },
      presentation: {
        kind: 'phone',
        primary: 'mobile',
        mobile: { alt: 'Каталог Telegram-магазина VeachelSell', width: 390, height: 844 },
      },
    },
  ],
  transitions,
};
