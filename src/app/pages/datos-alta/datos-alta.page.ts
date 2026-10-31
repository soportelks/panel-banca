import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

/**
 * Autor: José Alexis Martínez Bárcenas
 * Fecha: 29/05/2023
 * @version 1.0
 */
@Component({
  selector: 'app-datos-alta',
  templateUrl: './datos-alta.page.html',
  styleUrls: ['./datos-alta.page.scss'],
})
export class DatosAltaPage {
  formCliente: FormGroup;
  correoCliente!: string;
  telefonoCliente!: string;
  contrasenaCliente!: string;

  /**
   * Validacion para los campos
   */
  validaciones = {
    nombreCliente: [{ type: 'required', message: 'Campo requerido.' }],
    apellidoPaternoCliente: [{ type: 'required', message: 'Campo requerido.' }],
    apellidoMaternoCliente: [{ type: 'required', message: 'Campo requerido.' }],
    fechaNac: [
      {
        type: 'required',
        message: 'Campo requerido. ',
      },
      { type: 'menorEdad', message: ' Debes ser mayor de edad.' },
    ],
    domicilio: [{ type: 'required', message: 'Campo requerido.' }],
  };

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {
    // Formulario de cliente
    this.formCliente = this.formBuilder.group({
      nombreCliente: new FormControl('', [Validators.required]),
      apellidoPaternoCliente: new FormControl('', Validators.required),
      apellidoMaternoCliente: new FormControl('', [Validators.required]),
      fechaNac: new FormControl('', [
        Validators.required,
        this.validarMayorEdad,
      ]),
      domicilio: new FormControl('', [Validators.required]),
    });

    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const state = navigation.extras.state;

      this.correoCliente = state?.['correoCliente'];
      this.telefonoCliente = state?.['numeroTelefono'];
      this.contrasenaCliente = state?.['contrasenaCliente']
    }
  }

  /**
   * Metodo que guarda los datos del cliente en la base de datos
   * @returns void
   */
  async saveCliente() {
    // Validar que todos los campos esten llenos
    if (this.formCliente.invalid) {
      this.validateAllFormFields(this.formCliente);
      return;
    }

    // Guardar los datos del cliente en un JSON
    const json = {
      datos: {
        nombreProspecto: this.formCliente.get('nombreCliente')?.value,
        apellidoPaternoProspecto: this.formCliente.get('apellidoPaternoCliente')
          ?.value,
        apellidoMaternoProspecto: this.formCliente.get('apellidoMaternoCliente')
          ?.value,
        fechaNac: this.formCliente.get('fechaNac')?.value,
        domicilio: this.formCliente.get('domicilio')?.value,
        correoElectronico: this.correoCliente,
        numeroTelefono: this.telefonoCliente,
        contrasenaCliente: this.contrasenaCliente
      },
      accion: 1,
    };

    // Se crea la alerta para mostrar los mensajes del servidor
    const alert = await this.alertController.create({
      message: '',
      buttons: ['OK'],
    });

    // Enviar los datos al servidor
    this.http
      .post(environment.urlApi + '/onboarding/crud-prospectos', json)
      .subscribe((resp: any) => {
        if (resp.codigo != '0') {
          alert.message = resp.mensaje;
          alert.present();
        } else {

          const navigationExtras: NavigationExtras = {
            state: {
              prospectoId: resp.info,
            },
          };
          this.router.navigate(['/photo'], navigationExtras);
          // Limpiar el formulario
          this.formCliente.reset();
        }
      });
  }

  /**
   * Metodo que valida que la fecha de nacimiento sea mayor a 18 años.
   * @param control - Recibe el valor del campo de fecha de nacimiento
   * @returns true - Si es que el cliente es mayor de edad.
   */
  validarMayorEdad(control: AbstractControl) {
    const fechaNacimiento = new Date(control.value);
    const fechaActual = new Date();

    const aniosDiferencia =
      fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiferencia = fechaActual.getMonth() - fechaNacimiento.getMonth();
    const diaDiferencia = fechaActual.getDate() - fechaNacimiento.getDate();

    // Verificar si ya cumplió años
    if (mesDiferencia < 0 || (mesDiferencia === 0 && diaDiferencia < 0)) {
      return aniosDiferencia - 1 >= 18 ? null : { menorEdad: true };
    }

    return aniosDiferencia >= 18 ? null : { menorEdad: true };
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
