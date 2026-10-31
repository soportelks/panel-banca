import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { DispersionesMasivasService } from 'src/app/services/dispersiones-masivas.service';
import { SpeiService } from 'src/app/services/spei.service';
import { TesoreriaService } from 'src/app/services/tesoreria.service';
import { environment } from 'src/environments/environment';

/**
 * Autor: José Alexis Martínez Bárcenas
 * Fecha: 07/06/2023
 * Descripcion: Componente que muestra el saldo y movimientos de ahorro del cliente
 */

@Component({
  selector: 'app-ahorro',
  templateUrl: './ahorro.page.html',
  styleUrls: ['./ahorro.page.scss'],
})
export class AhorroPage implements AfterViewInit {
  datosCliente!: any;
  isLoading: boolean = false;
  datosMovimientos: any;
  movimientosSELECT: any;
  isModalOpen: boolean = false;
  presentingElement!: HTMLElement | null;
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;
  fechaOperacion: string = "";
  datosSaldo: {
    codigo: '';
    info: any;
    mensaje: '';
  };

  constructor(
    private router: Router,
    private dispersionesMasivasSrv: DispersionesMasivasService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private teso: TesoreriaService,
  ) {
    this.datosSaldo = {
      codigo: '',
      info: [{ saldo: 0 }],
      mensaje: '',
    };

    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.datosCliente = state?.['datosCliente'];
      this.searchMovs(1);
    }
  }

  ngAfterViewInit(): void {
    this.searchSaldoCliente();
    this.getFechaOperacion();
  }

  async searchMovs(accion: number) {
    const json = {
      datos: {
        numero_cliente: this.datosCliente.numero_cliente
      },
      accion: accion,
    };

    const loading = await this.loadingCtrl.create({
      message: 'Cargando movimientos...',
      spinner: 'crescent',
    });
    await loading.present();

    this.teso.getMMovimientos(json).subscribe({
      next: (resp) => {
        this.datosMovimientos = resp;
        this.calcularPaginas();
        loading.dismiss();
      },
      error: (err) => {
        console.error('Error al obtener movimientos:', err);
        loading.dismiss();
      },
    });
  }


  /**
   * Método que busca los movimientos de ahorro del cliente
   * @param movimiento_id ID del movimiento a consultar
   */
  searchMovsOrd(movimiento_id: number) {
    const json = {
      datos: {
        idorden: movimiento_id
      }
    };

    this.teso.getInfoMovimientos(json).subscribe(
      (resp) => {
        if (resp?.codigo !== '0') {
          this.presentAlert('Los datos de este movimiento no están disponibles en este momento');
          return;
        }
        this.movimientosSELECT = resp;
        this.isModalOpen = true;
      },
      (error) => {
        this.presentAlert('Los datos de este movimiento no están disponibles en este momento');
      }
    );
  }

  comprobante(empresa: string, clave_rastreo: any, fechaOperacion: any) {
    this.isLoading = true;

    const json = {
      empresa: empresa,
      claveRastreo: clave_rastreo,
      fechaOperacion: fechaOperacion
    };

    this.teso.comprobantePagos(json).subscribe(
      (resp: any) => {
        if (resp && resp.bytesComprobante) {
          const byteArray = this.base64ToArrayBuffer(resp.bytesComprobante);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `comprobante_${clave_rastreo}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          this.presentAlert('Los datos de este movimiento no están disponibles en este momento para generar un comprobante');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al generar el comprobante:', error);
        this.isLoading = false;
      }
    );
  }

  base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Metodo que busca el saldo del cliente
   * @returns void
   */
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

  closeModal() {
    this.isModalOpen = false;
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: "Alerta",
      message: message,
      buttons: ["Aceptar"],
      cssClass: "custom-alert",
    });

    await alert.present();
  }

  // Filtra los movimientos que se deben mostrar en la página actual
  getMovimientosPagina() {
    if (this.datosMovimientos && this.datosMovimientos.info) {
      const startIndex = (this.paginaActual - 1) * this.itemsPorPagina;
      const endIndex = startIndex + this.itemsPorPagina;
      return this.datosMovimientos.info.slice(startIndex, endIndex);
    }
    return [];
  }

  calcularPaginas() {
    if (this.datosMovimientos && this.datosMovimientos.info) {
      this.totalPaginas = Math.ceil(this.datosMovimientos.info.length / this.itemsPorPagina);
    }
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina > 0 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }


  getFechaOperacion(): string {
    let nowMX = new Date(new Date().toLocaleString(environment.locale, { timeZone: environment.timeZone }));
    this.fechaOperacion = nowMX.toISOString().split("T")[0];
    return this.fechaOperacion;
  }


}
