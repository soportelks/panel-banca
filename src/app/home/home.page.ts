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
    this.isDarkMode = false;
  }
}
