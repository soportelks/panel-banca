import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  isDarkMode: boolean = false;


  constructor() {
    this.detectTheme();
  }

  detectTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = prefersDark.matches;

    prefersDark.addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
    });
  }
}
