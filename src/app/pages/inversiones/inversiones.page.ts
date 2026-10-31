import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TesoreriaService } from 'src/app/services/tesoreria.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-inversiones',
  templateUrl: './inversiones.page.html',
  styleUrls: ['./inversiones.page.scss'],
})
export class InversionesPage {
  datosCliente!: any;
  inversionesResponse: {
    codigo: '';
    info: any;
    mensaje: '';
  };
  interesesResponse: {
    codigo: '';
    info: any;
    mensaje: '';
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private teso: TesoreriaService
  ) {
    this.inversionesResponse = {
      codigo: '',
      info: '',
      mensaje: ''
    }
    this.interesesResponse = {
      codigo: '',
      info: '',
      mensaje: ''
    }
    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.datosCliente = state?.['datosCliente'];
    }

    this.spsInversionesCliente();
    this.spsInteresesCliente();
  }

  /**
   * Metodo que obtiene las inversiones del cliente
   * @returns void
   */
  spsInversionesCliente() {
    const inversionesJson = {
      datos: {
        numero_cliente: this.datosCliente.numero_cliente
      },
      accion: 1,
    };

    this.teso.getInverciones
      (
        inversionesJson
      )
      .subscribe(
        (res: any) => {
          this.inversionesResponse = {
            codigo: res.codigo,
            info: res.info,
            mensaje: res.mensaje,
          };
        },
        (error) => { }
      );
  }

  /**
   * Metodo que obtiene las inversiones del cliente
   * @returns void
   */
  spsInteresesCliente() {
    const inversionesJson = {
      datos: {
        numero_cliente: this.datosCliente.numero_cliente
      },
      accion: 2,
    };

    this.teso.getInverciones
      (
        inversionesJson
      )
      .subscribe(
        (res: any) => {

          this.interesesResponse = {
            codigo: res.codigo,
            info: res.info,
            mensaje: res.mensaje,
          };
        },
        (error) => { }
      );
  }
}
