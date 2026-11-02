import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <button
      type="button"
      class="theme-toggle"
      (click)="toggle()"
      [attr.aria-label]="isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
      [attr.title]="isDark ? 'Modo claro' : 'Modo oscuro'"
    >
      <ion-icon [name]="isDark ? 'sunny-outline' : 'moon-outline'"></ion-icon>
    </button>
  `,
  styleUrls: ['./theme-toggle.component.scss'],
})
export class ThemeToggleComponent {
  constructor(private themeService: ThemeService) {}

  get isDark(): boolean {
    return this.themeService.isDark;
  }

  toggle(): void {
    this.themeService.toggle();
  }
}
