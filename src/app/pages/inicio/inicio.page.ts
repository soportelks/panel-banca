import { AfterViewInit, Component, Inject, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
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
  mostrarSaldo: boolean = true;

  constructor(
    @Inject(Router) private router: Router,
    private authService: AuthServiceService,
    private teso: TesoreriaService,
    private sessionService: SessionService,
    private navCtrl: NavController
  ) {
    this.detectTheme();

    const storedMostrarSaldo = localStorage.getItem('mostrarSaldo');
    if (storedMostrarSaldo !== null) {
      this.mostrarSaldo = storedMostrarSaldo === 'true';
    } else {
      this.mostrarSaldo = true;
    }

    this.datosSaldo = {
      codigo: '',
      info: { saldo: 0 },
      mensaje: '',
    };
    const storedData = localStorage.getItem('datosCliente');
    if (storedData) {
      this.datosCliente = JSON.parse(storedData);
    }
    this.cargarSaldoDeStorage();

    window.addEventListener('saldoActualizado', (e: any) => {
      if (e?.detail?.saldo !== undefined) {
        this.aplicarSaldo(e.detail.saldo);
      }
    });
  }

  cargarSaldoDeStorage() {
    const saldoGuardado = localStorage.getItem('ultimoSaldoConocido');
    if (saldoGuardado !== null && !isNaN(parseFloat(saldoGuardado))) {
      this.aplicarSaldo(parseFloat(saldoGuardado));
    }
  }

  aplicarSaldo(saldoNum: number) {
    if (!this.datosSaldo) {
      this.datosSaldo = { codigo: 0, info: { saldo: saldoNum }, mensaje: '' };
    } else if (!this.datosSaldo.info) {
      this.datosSaldo.info = { saldo: saldoNum };
    } else {
      this.datosSaldo.info.saldo = saldoNum;
    }
  }

  detectTheme() {
    this.isDarkMode = false;
  }

  ionViewWillEnter() {
    const token = localStorage.getItem('token');
    const datosCliente = localStorage.getItem('datosCliente');
    if (!token || !datosCliente) {
      this.limpiarSesionLocal();
      return;
    }
    this.datosCliente = JSON.parse(datosCliente);
    this.cargarSaldoDeStorage();
    this.searchSaldoCliente();
  }

  async ngAfterViewInit() {
    await this.searchSaldoCliente();
  }

  searchSaldoCliente() {
    if (!this.datosCliente?.numero_cliente) {
      const storedData = localStorage.getItem('datosCliente');
      if (storedData) {
        this.datosCliente = JSON.parse(storedData);
      }
    }
    if (!this.datosCliente?.numero_cliente) return;

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
            localStorage.setItem('ultimoSaldoConocido', saldoReal.toString());
            window.dispatchEvent(new CustomEvent('saldoActualizado', { detail: { saldo: saldoReal } }));

            this.aplicarSaldo(saldoReal);
            this.datosSaldo.codigo = resp.codigo;
            this.datosSaldo.mensaje = resp.mensaje;
          },
          error: (err) => {
            console.error('Error al obtener las comisiones del cliente', err);
            localStorage.setItem('ultimoSaldoConocido', saldoOriginal.toString());
            window.dispatchEvent(new CustomEvent('saldoActualizado', { detail: { saldo: saldoOriginal } }));
            this.aplicarSaldo(saldoOriginal);
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
    const prefMostrarSaldo = localStorage.getItem('mostrarSaldo');
    localStorage.clear();
    if (prefMostrarSaldo !== null) {
      localStorage.setItem('mostrarSaldo', prefMostrarSaldo);
    }
    this.clearCookies();
    this.navCtrl.navigateRoot(['/login'], { replaceUrl: true });
  }

  toggleMostrarSaldo() {
    this.mostrarSaldo = !this.mostrarSaldo;
    localStorage.setItem('mostrarSaldo', String(this.mostrarSaldo));
  }


  clabeCopiada: boolean = false;

  copiarTexto(texto: string) {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      this.clabeCopiada = true;
      setTimeout(() => {
        this.clabeCopiada = false;
      }, 2500);
    }).catch(err => {
      console.error('Error al copiar: ', err);
    });
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
