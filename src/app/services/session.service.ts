import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private channel = new BroadcastChannel('sesion_channel');

  constructor(private navCtrl: NavController) {
    this.channel.onmessage = (event) => {
      if (event.data === 'cerrar_sesion') {
        this.forzarCierreSesion();
      }
    };
  }

  notificarCerrarSesion() {
    this.channel.postMessage('cerrar_sesion');
  }

  forzarCierreSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('datosCliente');
    this.clearCookies();
    this.navCtrl.navigateRoot(['/login'], { replaceUrl: true });
  }

  private clearCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    });
  }
}
