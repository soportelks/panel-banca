import { Component, HostListener, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { filter } from 'rxjs/operators';
import { AuthServiceService } from './services/auth-service.service';
import { ThemeService } from './services/theme.service';
import { SingleTabService } from './services/single-tab.service';


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
  public isPestanaBloqueada$ = this.singleTabService.isBloqueada$;
  public verificandoPestana = false;
  public mensajeErrorPestana: string | null = null;
  private errorPestanaTimeout: any;

  private readonly publicRoutes = [
    '',
    '/',
    '/home',
    '/login',
    '/register',
    '/phone-code',
    '/photo',
    '/datos-alta',
    '/validacion',
    '/recover-passw',
    '/confirm-code',
    '/changue-passwd'
  ];

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private authService: AuthServiceService,
    private navCtrl: NavController,
    private themeService: ThemeService,
    private singleTabService: SingleTabService
  ) {
    this.resetInactivityTimer();
    this.iniciarVerificacionToken();
    this.iniciarMonitoreoNavegacion();
  }

  async reintentarConexionPestana() {
    if (this.verificandoPestana) {
      return;
    }

    this.verificandoPestana = true;
    this.mensajeErrorPestana = null;

    // Descartar cualquier alerta previa abierta para evitar pantallas oscuras o superpuestas
    await this.closeAllAlerts();

    const reanudado = await this.singleTabService.intentarReanudar();
    this.verificandoPestana = false;

    if (reanudado) {
      this.mensajeErrorPestana = null;
      await this.closeAllAlerts();
    } else {
      // Mostrar advertencia directamente en la tarjeta (sin popups ni capas oscuras acumulables)
      this.mensajeErrorPestana = 'Tu sesión sigue activa en la otra pestaña. Ciérrala primero para continuar en esta ventana.';
      clearTimeout(this.errorPestanaTimeout);
      this.errorPestanaTimeout = setTimeout(() => {
        this.mensajeErrorPestana = null;
      }, 5000);
    }
  }

  cerrarSesionDesdeBloqueo() {
    this.limpiarSesionLocal();
  }

  @HostListener('window:popstate')
  @HostListener('window:pageshow', ['$event'])
  handleBrowserNavigation(event?: any) {
    this.validarRutaProtegida();
  }

  private iniciarMonitoreoNavegacion() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.validarRutaProtegida();
      });
  }

  private validarRutaProtegida() {
    const rawUrl = (this.router.url || window.location.pathname || '').split('?')[0].replace(/\/$/, '') || '/';
    const isPublic = this.publicRoutes.includes(rawUrl);

    if (!isPublic) {
      const token = localStorage.getItem('token');
      const datosCliente = localStorage.getItem('datosCliente');
      if (!token || !datosCliente || this.tokenExpirado(token)) {
        this.limpiarSesionLocal();
      }
    }
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
    localStorage.removeItem('token');
    localStorage.removeItem('datosCliente');
    this.clearCookies();
    this.navCtrl.navigateRoot(['/login'], { replaceUrl: true });
  }

  async closeAllModals() {
    const topModal = await this.modalCtrl.getTop();
    if (topModal) {
      await this.modalCtrl.dismiss();
    }
  }

  async closeAllAlerts() {
    let topAlert = await this.alertCtrl.getTop();
    while (topAlert) {
      await topAlert.dismiss();
      topAlert = await this.alertCtrl.getTop();
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
