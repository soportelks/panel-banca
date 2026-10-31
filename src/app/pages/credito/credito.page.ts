import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TesoreriaService } from 'src/app/services/tesoreria.service';

@Component({
  selector: 'app-credito',
  templateUrl: './credito.page.html',
  styleUrls: ['./credito.page.scss'],
})
export class CreditoPage {
  creditosCliente: any = [];
  datosCliente: any;
  saldoCliente: any;
  nombreCliente: any;

  constructor(private http: HttpClient, private router: Router, private teso: TesoreriaService) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.datosCliente = state?.['datosCliente'];
      this.nombreCliente = this.datosCliente.nombre_prospecto;
      this.saldoCliente = state?.['datosSaldo'].info.saldo;
    }

    this.cargarCreditosCliente(1);
  }

  /**
   * Metodo busca los creditos de un cliente
   * @param accion: 1 = carga los creditos del cliente
   */
  cargarCreditosCliente(accion: number) {
    const json = {
      datos: {
        numero_cliente: '2', //this.datosCliente.numero_cliente,
      },
      accion: accion,
    };

    this.teso.getCreditos
      (json)
      .subscribe((resp: any) => {
        if (resp.codigo === '0') {
          this.creditosCliente = resp.info;
          /*const arr = [
            ...this.creditosCliente,
            ...this.creditosCliente,
            ...this.creditosCliente,
          ];
          this.creditosCliente = arr;*/

          for (const cred of this.creditosCliente) {
            if (cred.fecha_ultimo_pago == null) {
              cred.fecha_ultimo_pago = 'Sin Pagos';
            }
          }
        }


      });
  }

  /**
   * Metodo redirecciona a otro componente
   * @returns void
   */
  sendDataToComponent(ruta: string, credito: any) {
    const navigationExtras: NavigationExtras = {
      state: {
        creditoCliente: credito,
        datosSaldo: this.saldoCliente,
      },
    };
    this.router.navigate([ruta], navigationExtras);
  }
}
