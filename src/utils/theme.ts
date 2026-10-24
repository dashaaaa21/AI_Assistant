export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'ai-assistant.theme';

/** Reads the saved theme, or follows the system setting the first time. */
export function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage can be blocked – fall back to the system setting.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not critical – the theme just won't be remembered.
  }
}

/** Switches the CSS variables in index.css and the browser UI color. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  const color = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}
