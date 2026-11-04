import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppTheme = 'light';

const THEME_COLOR_LIGHT = '#2b3751';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSubject = new BehaviorSubject<AppTheme>('light');
  readonly theme$: Observable<AppTheme> = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme();
  }

  get theme(): AppTheme {
    return 'light';
  }

  get isDark(): boolean {
    return false;
  }

  toggle(): void {
    // Modo oscuro eliminado: siempre tema claro
    this.applyTheme();
  }

  setTheme(theme: AppTheme): void {
    this.applyTheme();
  }

  private applyTheme(): void {
    try {
      localStorage.removeItem('app-theme');
    } catch {
      // ignore
    }
    const root = document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    this.updateMetaThemeColor();
  }

  private updateMetaThemeColor(): void {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', THEME_COLOR_LIGHT);
  }
}
