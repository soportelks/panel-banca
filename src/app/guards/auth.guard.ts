import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private navCtrl: NavController
  ) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const datosCliente = localStorage.getItem('datosCliente');

    if (!token || !datosCliente || this.tokenExpirado(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('datosCliente');
      this.navCtrl.navigateRoot(['/login'], { replaceUrl: true });
      return false;
    }

    return true;
  }

  private tokenExpirado(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return true;
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      return typeof payload.exp === 'number' && payload.exp < now;
    } catch {
      return true;
    }
  }
}
