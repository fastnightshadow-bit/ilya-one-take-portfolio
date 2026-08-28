export type ProjectTheme = 'doner' | 'school' | 'telegram';

export interface ProjectContent {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly headline: string;
  readonly accent: string;
  readonly description: string;
  readonly chapterLabel: string;
  readonly theme: ProjectTheme;
}

export interface TransitionContent {
  readonly label: string;
  readonly phrase: string;
  readonly variant: 'ink' | 'route' | 'chat' | 'final';
}

export interface SiteContent {
  readonly telegramUrl: string;
  readonly telegramHandle: string;
  readonly rotatingWords: readonly string[];
  readonly process: readonly { number: string; title: string; detail: string }[];
  readonly projects: readonly ProjectContent[];
  readonly transitions: readonly TransitionContent[];
}

export const siteContent: SiteContent = {
  telegramUrl: 'https://t.me/girtopw',
  telegramHandle: '@girtopw',
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
    },
    {
      id: 'driving-school',
      title: 'Автошкола',
      eyebrow: 'Case 02 · Service / Education',
      headline: 'Понятный путь',
      accent: 'к первым правам.',
      description: 'Сайт автошколы, который объясняет обучение, снимает сомнения и ведёт к записи.',
      chapterLabel: 'Service × Education',
      theme: 'school',
    },
    {
      id: 'telegram-shop',
      title: 'Telegram-бот-магазин',
      eyebrow: 'Case 03 · Product / Telegram',
      headline: 'Магазин, который живёт',
      accent: 'в диалоге.',
      description: 'Telegram-бот с каталогом, корзиной и оформлением заказа внутри привычного мессенджера.',
      chapterLabel: 'Bot × Catalog × Order',
      theme: 'telegram',
    },
  ],
  transitions: [
    { label: 'Буквы становятся линиями портрета', phrase: 'ИДЕЯ → ДИЗАЙН → КОД → РЕЗУЛЬТАТ', variant: 'ink' },
    { label: 'Линия становится графикой кейса', phrase: 'БИЗНЕС → ВКУС → БРЕНД → ЗАКАЗ', variant: 'ink' },
    { label: 'Красная линия становится дорогой', phrase: 'ОТ ПЕРВОГО КЛИКА — К ПЕРВОЙ ПОЕЗДКЕ', variant: 'route' },
    { label: 'Дорожные метки становятся сообщениями', phrase: 'ROAD → FLOW → CHAT → SHOP', variant: 'chat' },
    { label: 'Проекты становятся приглашением', phrase: 'DESIGN × CODE × BUSINESS', variant: 'final' },
  ],
};
