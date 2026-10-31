import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AlertController, IonModal, Platform } from '@ionic/angular';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { TesoreriaService } from 'src/app/services/tesoreria.service';
import { CatalogosService } from 'src/app/services/catalogos.service';

/**
 * Fecha: 14/06/2023
 * @author: José Alexis Martínez Bárcenas
 * @description: Componente que muestra la página de recargas
 * @version 1.6
 */

@Component({
  selector: 'app-recargas',
  templateUrl: './recargas.page.html',
  styleUrls: ['./recargas.page.scss'],
})
export class RecargasPage {
  datosTransaccion: any = {
    nombreCliente: '',
    cveCliente: '',
    cveOperacion: '',
    fechaTransaccion:
      new Date().getDate().toString() +
      '/' +
      (new Date().getMonth() + 1).toString() +
      '/' +
      new Date().getFullYear().toString(),
    horaTransaccion:
      new Date().getHours().toString() +
      ':' +
      new Date().getMinutes().toString() +
      ':' +
      new Date().getSeconds().toString(),
    descripcion: '',
    monto: 0,
    comision: 0,
    total: 0,
  };
  // Variables necesarias
  type = 'compania';
  formRecarga: FormGroup;
  companiasData: any;
  estadosData: any;
  montos: any;
  seleccion: any;
  numTel1!: number;
  numTel2!: number;
  numTelConfirm!: number;
  monto!: string;
  datosCliente: any;
  @ViewChild('modal', { static: false }) modal: IonModal | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private platform: Platform,
    private transs: TransaccionesService,
    private teso: TesoreriaService,
    private cat: CatalogosService
  ) {
    // Inicializacion de variables
    this.companiasData = {
      codigo: '',
      info: [],
      mensaje: '',
    };

    this.estadosData = {
      codigo: '',
      info: [{ nombre_estado: '' }],
      mensaje: '',
    };

    // Inicializa el formulario del cliente y sus validaciones.
    this.formRecarga = this.formBuilder.group({
      company: new FormControl('', [Validators.required]),
      monto: new FormControl('', [Validators.required]),
      estado: new FormControl(''),
      num1: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]{10}'),
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      num2: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]{10}'),
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
    });

    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.datosCliente = state?.['datosCliente'];
      this.datosTransaccion.nombreCliente = this.datosCliente.nombre_prospecto;
      this.datosTransaccion.cveCliente = this.datosCliente.clave_prospecto;
    }

    this.getCompaniasAndStates();
  }

  /**
   * Metodo que capta cuando se cambia de segmento
   * @returns void
   */
  segmentChanged(ev: any) {
    /* TODO document why this method 'segmentChanged' is empty */
  }

  /**
   * Metodo que detecta cuando se selecciona una opción
   * @returns void
   */
  handleChange(e: any) {
    this.seleccion = e.detail.value;

    this.searchMontoOfCompany(this.seleccion);
  }

  getCompaniasAndStates() {
    // JSON para obtener las compañias de la api
    const json = {
      datos: {},
      accion: 2,
    };

    // Envio de la peticion de compañias a la api
    this.teso.getRecargasMonto
      (json)
      .subscribe((resp: any) => {
        // Guardar los datos de las compañias
        this.companiasData = {
          codigo: resp.codigo,
          info: resp.info,
          mensaje: resp.mensaje,
        };
      });

    /*this.cat.getEstados
      (json)
      .subscribe((resp: any) => {
        // Guardar los datos de los estados
        this.estadosData = {
          codigo: resp.codigo,
          info: resp.info,
          mensaje: resp.mensaje,
        };
      });*/
  }

  /**
   * Metodo que detecta el monto seleccionado
   * @returns void
   */
  handleChangeMonto(e: any) {
    this.monto = e.detail.value;
  }

  /**
   * Metodo que busca los montos de la compañia
   * @returns void
   */
  searchMontoOfCompany(company: any) {

    this.montos = JSON.parse(company.montos);

  }

  /**
   * Metodo que valida los numeros de telefono
   * @returns void
   */
  async checkNumsMatch() {
    // Valida que el formulario este completo y valido
    if (this.formRecarga.invalid) {
      this.validateAllFormFields(this.formRecarga);
      const alert = await this.alertController.create({
        message: 'Rellena los campos correctamente',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }
    this.numTel1 = this.formRecarga.get('num1')?.value;
    this.numTel2 = this.formRecarga.get('num2')?.value;

    if (this.numTel1 == this.numTel2) {
      this.type = 'verificacion';
      this.numTelConfirm = this.numTel2;
    } else {
      const alert = await this.alertController.create({
        message: 'Los numeros no coinciden',
        buttons: ['OK'],
      });

      await alert.present();
    }
  }

  /**
   * Metodo envia
   * @returns void
   */
  async realizarRecarga() {

    const alert = await this.alertController.create({
      message: 'Sin servicio, intente más tarde',
      buttons: ['OK'],
    });

    await alert.present();
    return;
    // Busca el indice de la compañia seleccionada
    let montoRecarga: any = this.monto.replace('$', '');
    montoRecarga = parseInt(montoRecarga);
    const iMontos = this.montos.findIndex((e: any) => e.monto == montoRecarga);
    // Busca el indice del estado seleccionado
    const iEstado = this.estadosData.info.findIndex(
      (e: any) => e.nombre_estado == this.formRecarga.get('estado')?.value
    );
    // JSON para enviar la solicitud de recarga a la api
    const json = {
      datos: {
        telefono: this.numTelConfirm,
        sku: this.montos[iMontos].codigo,
        cve_estado: this.estadosData.info[iEstado].cve_estado,
        monto: montoRecarga,
        cve_cuenta: '0002',
        cve_sucursal: 'TOL',
        cve_origen: this.checkPlatform(),
        usuario: 'IONIC',
        cve_movimiento: '0006',
      },
      accion: 1,
    };
    this.datosTransaccion.monto = json.datos.monto;
    this.datosTransaccion.total = json.datos.monto;

    // Envio de la solicitud de recarga a la api
    this.transs.ventasMTC
      (json)
      .subscribe((resp: any) => {
        this.datosTransaccion.descripcion = resp.mensaje;
        this.datosTransaccion.cveOperacion = resp.info.ref_movimiento;
        this.modal?.present();
      });
  }

  /**
   * Verifica la plataforma actual
   * @returns string - Retorna el codigo de la plataforma
   */
  checkPlatform() {
    let origen = '';

    if (this.platform.is('ios')) {
      origen = environment.cveAppIos;
      return origen;
    } else if (this.platform.is('android')) {
      origen = environment.cveAppAndroid;
      return origen;
    } else if (this.platform.is('desktop')) {
      origen = environment.cveCoreLKS;
      return origen;
    } else {
      return;
    }
  }

  /**
   * Valida Cada atributo del formulario
   * @param formGroup - Recibe cualquier tipo de FormGroup
   */
  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   * Abre el modal del ticket
   * @returns void
   */
  openModal() {
    this.modal?.present();
  }
}
