import { AfterViewInit, Component, Inject, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { SessionService } from 'src/app/services/session.service';
import { TesoreriaService } from 'src/app/services/tesoreria.service';


/**
 * Fecha: 26/05/2023
 * @author: José Alexis Martínez Bárcenas
 * @description: Componente que muestra la página de inicio una vez iniciada la sesión
 * @version 2.0
 */

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements AfterViewInit {
  isDarkMode: boolean = false;
  datosCliente: any;
  isModalOpen: boolean = false;
  presentingElement!: HTMLElement | null;
  datosSaldo: any = {
    codigo: 0,
    info: { saldo: 0 },
    mensaje: '',
  };

  constructor(
    @Inject(Router) private router: Router,
    private authService: AuthServiceService,
    private teso: TesoreriaService,
    private sessionService: SessionService
  ) {
    this.detectTheme();

    this.datosSaldo = {
      codigo: '',
      info: { saldo: 0 },
      mensaje: '',
    };
    const storedData = localStorage.getItem('datosCliente');
    if (storedData) {
      this.datosCliente = JSON.parse(storedData);
    }
  }

  detectTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = prefersDark.matches;

    prefersDark.addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
    });
  }


  async ngAfterViewInit() {
    console.log('ngAfterViewInit');
    await this.searchSaldoCliente();
  }

  searchSaldoCliente() {
    const json = {
      datos: {
        numero_cliente: this.datosCliente.numero_cliente
      },
      accion: 1,
    };

    this.teso.saldoCliente(json).subscribe({
      next: (resp: any) => {
        const saldoOriginal = parseFloat(resp.info?.saldo ?? '0') || 0;

        this.teso.getDatosComiciones({ numero_cliente: this.datosCliente.numero_cliente }).subscribe({
          next: (comicionesResp: any) => {

            let saldoMinimo = 0;
            const comisionData = comicionesResp?.info?.[0];

            if (comisionData && comisionData.estatus === true) {
              saldoMinimo = parseFloat(comisionData.saldo_minimo ?? '0') || 0;
            }

            const saldoReal = saldoOriginal - saldoMinimo;

            this.datosSaldo = {
              codigo: resp.codigo,
              info: {
                ...resp.info,
                saldo: saldoReal
              },
              mensaje: resp.mensaje,
            };
          },
          error: (err) => {
            console.error('Error al obtener las comisiones del cliente', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener el saldo del cliente', err);
      }
    });
  }

  /**
   * Metodo redirecciona a otro componente
   * @returns void
   */
  sendDataToComponent(ruta: string) {
    const navigationExtras: NavigationExtras = {
      state: {
        datosCliente: this.datosCliente,
        datosSaldo: this.datosSaldo,
      },
    };
    this.router.navigate([ruta], navigationExtras);
  }

  cerrarSesion() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.limpiarSesionLocal();
      return;
    }

    this.authService.logout().subscribe({
      next: () => {
        this.limpiarSesionLocal();
        this.sessionService.notificarCerrarSesion();
      },
      error: () => {
        this.limpiarSesionLocal();
        this.sessionService.notificarCerrarSesion();
      }
    });
  }

  private limpiarSesionLocal() {
    localStorage.clear();
    this.clearCookies();
    this.router.navigate(['/home']);
  }


  onNotificationClick() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  clearCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    });
  }


}
