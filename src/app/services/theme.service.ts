import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';
const THEME_COLOR_LIGHT = '#2b3751';
const THEME_COLOR_DARK = '#0b1220';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSubject: BehaviorSubject<AppTheme>;
  readonly theme$: Observable<AppTheme>;

  constructor() {
    const initialTheme = this.getInitialTheme();
    this.themeSubject = new BehaviorSubject<AppTheme>(initialTheme);
    this.theme$ = this.themeSubject.asObservable();
    this.applyTheme(initialTheme);
  }

  get theme(): AppTheme {
    return this.themeSubject.value;
  }

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  toggle(): void {
    this.setTheme(this.isDark ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Almacenamiento no disponible: se mantiene el tema en memoria.
    }
    this.applyTheme(theme);
  }

  private getInitialTheme(): AppTheme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Sin acceso a localStorage.
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    this.updateMetaThemeColor(theme);
  }

  private updateMetaThemeColor(theme: AppTheme): void {
    const color = theme === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', color);
  }
}
