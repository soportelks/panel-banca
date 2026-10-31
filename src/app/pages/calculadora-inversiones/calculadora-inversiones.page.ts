import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Platform, IonModal, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ComprobantePage } from '../comprobante/comprobante.page';
import { TesoreriaService } from 'src/app/services/tesoreria.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-calculadora-inversiones',
  templateUrl: './calculadora-inversiones.page.html',
  styleUrls: ['./calculadora-inversiones.page.scss'],
})
export class CalculadoraInversionesPage {
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

  formInversion: FormGroup;
  inversionResponse: any;
  inversionCalculada: any;
  generalesResponse: any;
  inversionesResponse: any;
  datosCliente!: any;
  datosSaldo!: any;
  saldoCliente: any;
  plazo: number = 0;
  recordarVencimiento: boolean = false;
  instruccionId!: number;
  flagInstruccion: boolean = true;
  cveOrigen: string = '';
  tipoInversion: any;
  monto: number = 0;
  saldo!: number;

  instrucciones: any = [
    { tipo: 'Rembolso Total', descripcion: 'Recibiras el monto más el interes.' },
    { tipo: 'Reinversion Total', descripcion: 'Se invertira el monto más el interes.' },
    {
      tipo: 'Reinversion de capital',
      descripcion: 'El monto inicial se reinvertira.',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private platform: Platform,
    private modal: ModalController,
    private teso: TesoreriaService,
    private cata: CatalogosService,
    private transacciones: TransaccionesService
  ) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.datosCliente = state?.['datosCliente'];
      this.datosSaldo = state?.['datosSaldo'];
    }

    this.saldo = this.datosSaldo.info.saldo;

    this.datosTransaccion.nombreCliente = this.datosCliente.nombre_prospecto;
    this.datosTransaccion.cveCliente = this.datosCliente.clave_prospecto;

    this.spsTiposInversion();

    this.spsGeneralesCategoria();

    // Obtener la plataforma actual al iniciar el componente
    this.platform.ready().then(() => {
      this.checkPlatform();
    });

    // Inicializa el formulario del cliente y sus validaciones.
    this.formInversion = this.formBuilder.group({
      monto: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1000),
          Validators.max(500000),
          Validators.max(this.saldo),
        ])
      ),
    });
  }

  /**
   * Validacion para los campos
   */
  validaciones = {
    monto: [
      { type: 'required', message: 'Campo requerido.' },
      {
        type: 'min',
        message: 'La cantidad minima a invertir es 1000',
      },
      {
        type: 'max',
        message: 'Limite de inversion alcanzado',
      },
    ],
  };

  /*@ViewChild('modal', { static: false }) modal: IonModal | undefined;

  ngOnInit() {}
*/
  /**
   * Metodo que obtiene los tipos de inversion en la base de datos
   * @returns void
   */
  spsTiposInversion() {
    const inversionJson = {
      datos: {},
      accion: 1,
    };

    this.teso.getTipoInversion(
      inversionJson
    )
      .subscribe(
        res => {
          this.inversionResponse = res;
        },
        (error) => { }
      );
  }

  /**
   * Metodo que calcula la inversion del cliente de acuerdo al monto
   * @returns void
   */
  calcularInversion(item: any) {
    if (this.formInversion.invalid) {
      this.validateAllFormFields(this.formInversion);
      return;
    }

    this.tipoInversion = item;

    this.monto = this.formInversion.get('monto')?.value;

    const inversionJson = {
      datos: { monto: this.monto, cveInversion: item.clave_inversion },
      accion: 2,
    };

    this.plazo = item.plazo;

    this.teso.calcularInverciones(inversionJson)
      .subscribe(
        (res) => {
          this.inversionCalculada = res;
        },
        (error) => { }
      );
  }

  /**
   * Valida Cada atributo del formulario
   * @param formGroup - Recibe cualquier tipo de FormGroup
   */
  validateAllFormFields(formGroup: UntypedFormGroup) {
    //{1}
    Object.keys(formGroup.controls).forEach((field) => {
      //{2}
      const control = formGroup.get(field); //{3}
      if (control instanceof UntypedFormControl) {
        //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        //{5}
        this.validateAllFormFields(control); //{6}
      }
    });
  }

  /**
   * Metodo que obtiene los catalogos generales por categoria
   * @returns void
   */
  spsGeneralesCategoria() {
    const generalesJson = {
      datos: { categoria: '65II' },
      accion: 1,
    };

    this.cata.getGeneralesCategorias(generalesJson)
      .subscribe(
        (res) => {
          this.generalesResponse = res;

        },
        (error) => { }
      );
  }

  toggle(event: any) {
    this.recordarVencimiento = event.detail.checked;
  }

  radio(event: any) {
    this.instruccionId = event.generales_id;
    this.flagInstruccion = false;
  }

  checkPlatform() {
    // Verificar la plataforma actual
    if (this.platform.is('ios')) {
      this.cveOrigen = environment.cveAppIos;
      console.log('La aplicación se está ejecutando en iOS.');
    } else if (this.platform.is('android')) {
      this.cveOrigen = environment.cveAppAndroid;
      console.log('La aplicación se está ejecutando en Android.');
    } else if (this.platform.is('desktop')) {
      this.cveOrigen = environment.cveCoreLKS;
      console.log(
        'La aplicación se está ejecutando en un entorno de escritorio.'
      );
    } else {
      console.log('La plataforma actual no se reconoce.');
    }
  }

  /**
   * Metodo para realizar inversiones
   * @returns void
   */
  realizarInversion() {
    const inversionJson = {
      datos: [
        this.tipoInversion.inversion_id, // Cat Inversion ID
        this.recordarVencimiento, // TRUE = Recorder Fecha de Vencimiento, FALSE = No notifica
        this.monto, // Monto de la Inversión
        this.tipoInversion.plazo, // Plazo de la inversión(Se toma del catalogo de inversiones)
        this.tipoInversion.tasa, // Tasa de Interes(Se toma del catalogo de inversiones)
        this.tipoInversion.retiene_isr, // TRUE = APLICA ISR, FALSE = NO APLICA(Se toma del catalogo de inversiones)
        '', // VACIO
        this.instruccionId, // INSTRUCCION ID AL VENCIMIENTO (Catalogo que falta agregar al back de onboarding)
        this.datosCliente.numero_cliente, // CLIENTE ID
        'db0900d4-020a-4f19-9c6a-1227fa6830a0', // POR EL MOMENTO VACIO
        'TOL', // SUCURSAL A LA Q PERTENECE EL CLIENTE(Por el momento se queda TOL)
        '03', // SE QUEDA ASI
        '0002', // SE QUEDA ASI
        this.datosCliente.numero_cliente, // NUMERO DE CLIENTE
        this.cveOrigen, // ORIGEN DE MOVIMIENTO TOMAR LA CLAVE DEPENDIENDO LA APP(APP ANDROID, APP IOS)
        1, // SUCURSAL ID(Por el momento se queda 1)
        null
      ],
      accion: 1,
    };

    this.transacciones.getGeneralesCategorias
      (inversionJson)
      .subscribe(
        (res) => {
          this.inversionesResponse = res;

          console.log("REs inversion ", this.inversionesResponse);

          if (this.inversionesResponse) {
            const navigationExtras: NavigationExtras = {
              state: {
                datosCliente: this.datosCliente,
              },
            };

            if (this.inversionesResponse[0] === '0') {
              this.searchSaldoCliente();
              this.datosTransaccion.cveOperacion =
                this.inversionesResponse[2].substring(0, 4) +
                this.inversionesResponse[2].substring(
                  this.inversionesResponse[2].length - 7
                );
              this.datosTransaccion.descripcion = 'Inversion';
              this.datosTransaccion.monto = this.monto;
              this.datosTransaccion.comision = 5;
              this.datosTransaccion.total =
                this.monto + this.datosTransaccion.comision;

              this.openModal(this.datosTransaccion);

              //this.router.navigate(['inversiones'], navigationExtras);
            }
          }
        },
        (error) => { }
      );
  }

  async openModal(datosTransaccion: any) {
    //this.modal?.present();

    const modal = await this.modal.create({
      component: ComprobantePage,
      componentProps: { datos: datosTransaccion }
    });
    modal.present();
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
    this.teso.saldoCliente
      (json)
      .subscribe((resp: any) => {
        this.datosSaldo = {
          codigo: resp.codigo,
          info: resp.info,
          mensaje: resp.mensaje,
        };
        this.saldo = this.datosSaldo.info.saldo;
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
        datosSaldo: this.datosSaldo
      },
    };

    //this.router.navigate([ruta], navigationExtras);

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([ruta], navigationExtras);
    });

  }

  cancel() {
    this.modal?.dismiss();
  }
}
