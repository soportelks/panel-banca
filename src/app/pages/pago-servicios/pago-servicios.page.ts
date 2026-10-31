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
import { Router } from '@angular/router';
import { AlertController, IonModal, Platform } from '@ionic/angular';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { environment } from 'src/environments/environment';

/**
 * Fecha: 16/06/2023
 * @author José Alexis Martínez Bárcenas
 * @description Componente que muestra la página para Pagos y Servicios
 * @version 1.5
 */
@Component({
  selector: 'app-pago-servicios',
  templateUrl: './pago-servicios.page.html',
  styleUrls: ['./pago-servicios.page.scss'],
})
export class PagoServiciosPage {
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
  // Declaracion de variables
  type = 'servicio';
  datosServices: any;
  seleccion: any;
  formServicio: FormGroup;
  datosForm = {
    referencia: '',
    digitoVerif: '',
    monto: 0,
  };
  datosCliente: any;
  @ViewChild('modal', { static: false }) modal: IonModal | undefined;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private platform: Platform,
    private router: Router,
    private cata: CatalogosService,
    private transa: TransaccionesService
  ) {
    this.datosServices = {
      codigo: '',
      info: [],
      mensaje: '',
    };

    // Inicializa el formulario del cliente y sus validaciones.
    this.formServicio = this.formBuilder.group({
      servicio: new FormControl('', [Validators.required]),
      referencia: new FormControl('', [Validators.required]),
      digitoVerif: new FormControl(''),
      monto: new FormControl('', [Validators.required]),
      confirMonto: new FormControl('', [Validators.required]),
    });

    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.datosCliente = state?.['datosCliente'];
      this.datosTransaccion.nombreCliente = this.datosCliente.nombre_prospecto;
      this.datosTransaccion.cveCliente = this.datosCliente.clave_prospecto;
    }

    // Obtiene los servicios
    this.getServicios();
  }

  /**
   * Metodo que guarda los servicios en variable global
   * @returns void
   */
  getServicios() {
    const json = {
      datos: {},
      accion: 2,
    };
    this.cata.getServicios
      (json)
      .subscribe((resp: any) => {
        this.datosServices = {
          codigo: resp.codigo,
          info: resp.info,
          mensaje: resp.mensaje,
        };
      });
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
  }

  /**
   * Metodo para obtener los datos del formulario
   * @returns void
   */
  async obtenerDatos() {
    // Valida que el formulario este completo y valido
    if (this.formServicio.invalid) {
      this.validateAllFormFields(this.formServicio);
      const alert = await this.alertController.create({
        message: 'Rellena los campos correctamente',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }

    // Valida que los montos coincidan
    if (
      this.formServicio.get('monto')?.value ==
      this.formServicio.get('confirMonto')?.value
    ) {
      // Asigna los valores al Json de los datos del Formulario
      this.datosForm = {
        referencia: this.formServicio.get('referencia')?.value,
        digitoVerif: this.formServicio.get('digitoVerif')?.value,
        monto: this.formServicio.get('monto')?.value,
      };
      this.type = 'verificacion';
    } else {
      const alert = await this.alertController.create({
        message: 'Los montos no coinciden',
        buttons: ['OK'],
      });

      await alert.present();
    }
  }

  /**
   * Verifica la plataforma actual
   * @returns void
   */
  async realizarPago() {

    const alert = await this.alertController.create({
      message: 'Sin servicio, intente más tarde',
      buttons: ['OK'],
    });

    await alert.present();
    return;
    // Busca el indice del servicio seleccionado
    const indice = this.datosServices.info.findIndex(
      (e: any) => e.producto == this.seleccion
    );

    // Json para enviar datos al servidor
    const json = {
      datos: {
        referencia1: this.datosForm.referencia,
        referencia2: this.datosForm.digitoVerif,
        sku: this.datosServices.info[indice].codigo,
        monto: this.datosForm.monto,
        cve_sucursal: 'TOL',
        cve_origen: this.checkPlatform(),
        usuario: 'IONIC',
        cve_movimiento: '0005',
      },
      accion: 1,
    };

    // Envia los datos al servidor
    this.transa.ventasMTC
      (json)
      .subscribe((resp: any) => {
        this.datosTransaccion.cveOperacion = resp.info.ref_movimiento;
        this.datosTransaccion.descripcion = resp.mensaje;
        this.datosTransaccion.monto = this.datosForm.monto;
        this.datosTransaccion.total = this.datosForm.monto;
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
}
