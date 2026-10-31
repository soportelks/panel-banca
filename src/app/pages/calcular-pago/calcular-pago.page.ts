import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { AlertController, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { CustomValidator } from './custom-validator';

import { trigger, state, style, animate, transition } from '@angular/animations';
import { TesoreriaService } from 'src/app/services/tesoreria.service';

@Component({
  selector: 'app-calcular-pago',
  templateUrl: './calcular-pago.page.html',
  styleUrls: ['./calcular-pago.page.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition('void => *', animate('750ms ease-in'))
    ])],
})
export class CalcularPagoPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal | undefined;

  pago: any;
  creditoCliente: any;
  selectedOption: string = "";
  saldoCliente: any;
  isModalOpen = false;


  formTarjeta: FormGroup;

  minYear: number = new Date().getFullYear();
  maxYear: number = this.minYear + 5;
  minMonth: number = new Date().getMonth() + 1;

  /**
 * Validacion para los campos
 */
  validaciones = {
    nombreTitular: [
      { type: 'pattern', message: 'No se aceptan números.' },
      { type: 'required', message: 'Campo requerido.' },
    ],
    numeroTarjeta: [
      { type: 'pattern', message: 'Formato incorrecto.' },
      { type: 'required', message: 'Campo requerido.' },
    ],
    codigoSeguridad: [
      { type: 'pattern', message: 'Formato incorrecto.' },
      { type: 'required', message: 'Campo requerido.' },
    ]
  };

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private alertController: AlertController, private teso: TesoreriaService,) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.creditoCliente = state?.['creditoCliente'];
      this.saldoCliente = state?.['datosSaldo'];

      const credito = {
        referencia: this.creditoCliente.referencia
      };
      this.calcularPago(credito);
    }

    this.formTarjeta = this.formBuilder.group({
      nombreTitular: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z,ñ,ÑáéíöûÁÉÍÓÚÜñäëöåæÄËÖÜãâçÂÇéÈËëî, ]*'),
        CustomValidator.sinEspaciosEnBlanco,
      ]),
      numeroTarjeta: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9," "]{19}'),
      ]),
      fechaExpiracion: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9,"/"]{5}'),
        CustomValidator.isValidDate,
      ]),
      codigoSeguridad: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]{3}'),
      ])
    });
  }

  ngOnInit() {
  }

  calcularPago(creditoCliente: any) {
    const json = {
      datos: creditoCliente,
      accion: 1,
    };

    this.teso.calcularPagos
      (json)
      .subscribe((resp: any) => {
        this.pago = resp.info;
      });
  }

  cancel() {
    this.selectedOption = "";
    this.modal?.dismiss(null, 'cancel');
    this.formTarjeta.reset();
  }

  confirm() {
    switch (this.selectedOption) {
      case 'credDebCard':
        if (this.formTarjeta.invalid) {
          this.validateAllFormFields(this.formTarjeta);
          return;
        }
        this.pagoConTarjeta();
        this.modal?.dismiss(this.selectedOption, 'confirm');
        this.formTarjeta.reset();
        break;
      case 'wallet':
        this.modal?.dismiss(this.selectedOption, 'confirm');
        break;
      default:
        break;
    }
  }



  async onWillDismiss(isOpen: boolean) {
    console.log('onWillDismiss', this.pago)
    if (this.pago.total === 0) {
      console.log('entre validacion onWillDismiss')
      const alert = await this.alertController.create({
        message: 'Sin adeudo',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }


    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log('Confirmed');
    }
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

  pagoConTarjeta() {
    const cardJson = {
      datos: {
        nombreTitular: this.formTarjeta.get('nombreTitular')?.value,
        numeroTarjeta: this.formTarjeta.get('numeroTarjeta')?.value,
        fechaExpiracion: this.formTarjeta.get('fechaExpiracion')?.value,
        codigoSeguridad: this.formTarjeta.get('codigoSeguridad')?.value,
      },
      accion: 1,
    }
  }

  pagoConCuentaAhorro() {
    console.log("Pago con cuenta de ahorro");
  }



}