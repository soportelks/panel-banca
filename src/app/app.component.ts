import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { AuthServiceService } from './services/auth-service.service';


register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private inactivityTimeout: any;
  private readonly TIMEOUT_DURATION = 5 * 60 * 1000;
  private tokenCheckInterval: any;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private authService: AuthServiceService  // Inyecta el servicio de autenticación
  ) {
    this.resetInactivityTimer();
    this.iniciarVerificacionToken();
  }

  // Escucha eventos de interacción para resetear el temporizador
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:touchstart')
  resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => this.handleInactivity(), this.TIMEOUT_DURATION);
  }

  // Acción cuando el usuario está inactivo
  async handleInactivity() {
    const currentRoute = this.router.url;
    const excludedRoutes = ['/home', '/login', '/register', '/datos-alta', '/photo', '/validacion', '/'];

    if (excludedRoutes.includes(currentRoute)) {
      return;
    }

    // Cerrar todos los modales y alertas abiertas
    await this.closeAllModals();
    await this.closeAllAlerts();

    const datosCliente = JSON.parse(localStorage.getItem('datosCliente') || '{}');

    // Verificar si existe el id
    if (datosCliente && datosCliente.prospecto_id) {
      // Llamar al servicio de logout con el token
      const token = localStorage.getItem('token');
      if (token) {
        this.authService.logout().subscribe({
          next: () => {
            this.limpiarSesionLocal();
          },
          error: () => {
            // Aunque haya error, igual limpiamos sesión local
            this.limpiarSesionLocal();
          }
        });
      } else {
        this.limpiarSesionLocal();
      }
    } else {
      console.error('ID no encontrado en localStorage');
    }
  }

  // Cerrar la ventana o pestaña
  handleWindowClose() {
    this.closeAllModals();
    this.closeAllAlerts();

    const datosCliente = JSON.parse(localStorage.getItem('datosCliente') || '{}');
    if (datosCliente && datosCliente.prospecto_id) {
      const token = localStorage.getItem('token');
      if (token) {
        this.authService.logout().subscribe({
          next: () => {
            this.limpiarSesionLocal();
          },
          error: () => {
            this.limpiarSesionLocal();
          }
        });
      } else {
        this.limpiarSesionLocal();
      }
    }
  }

  private limpiarSesionLocal() {
    localStorage.clear();
    this.clearCookies();
    this.router.navigate(['/home']);
  }

  async closeAllModals() {
    const topModal = await this.modalCtrl.getTop();
    if (topModal) {
      await this.modalCtrl.dismiss();
    }
  }

  async closeAllAlerts() {
    const topAlert = await this.alertCtrl.getTop();
    if (topAlert) {
      await topAlert.dismiss();
    }
  }

  clearCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    }
  }

  iniciarVerificacionToken() {
    this.tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && this.tokenExpirado(token)) {
        console.warn('Token expirado. Cerrando sesión...');
        this.handleInactivity();
      }
    }, 5000);
  }

  tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (e) {
      console.error('Error al decodificar token', e);
      return true;
    }
  }

  ngOnDestroy() {
    window.removeEventListener('beforeunload', this.handleWindowClose);
    clearInterval(this.tokenCheckInterval);
  }

}
