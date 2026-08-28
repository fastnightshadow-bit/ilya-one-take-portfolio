export function elementFromHtml<T extends HTMLElement>(markup: string): T {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  const element = template.content.firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error('Renderer returned no root element');
  return element as T;
}
