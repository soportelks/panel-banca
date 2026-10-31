import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { AlertController } from '@ionic/angular';
import { matchPassword } from './matchpassword.validator';
import { ProspectosService } from 'src/app/services/prospectos.service';


/**
 * @autor José Alexis Martínez Bárcenas
 * @date 26/05/2023
 * @descripcion Componente para registrar el correo y telefono de un cliente
 * @version 2.0
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  //Declaracion de variables y componentes
  chkbxValue?: boolean;
  correoCliente: string = '';
  telefonoCliente: string = '';
  contrasenaCliente: string = '';
  formCliente: FormGroup;
  clienteId?: number;
  isPasswordVisible: boolean;
  passwordStrengthScore: number = 0;
  /**
   * Validacion para los campos
   */
  validaciones = {
    email: [
      { type: 'required', message: 'Campo requerido.' },
      { type: 'email', message: 'No es el formato correcto.' },
    ],
    telefono: [
      { type: 'required', message: 'Campo requerido.' },
      {
        type: 'pattern',
        message: 'El formato debe ser 1234567890.',
      },
    ],
    contrasena: [
      { type: 'required', message: 'La contraseña es obligatoria.' },
      { type: 'minlength', message: 'La contraseña debe tener al menos 8 caracteres.' },
      { type: 'requirements', message: 'La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un signo y un número.' },
    ]
  };

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private pro: ProspectosService,
  ) {
    this.isPasswordVisible = false;
    // Inicializa el formulario del cliente y sus validaciones.
    this.formCliente = this.formBuilder.group({
      correoElectronico: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      numeroTelefono: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]{10}'),
      ]),
      contrasenaCliente: new FormControl('', [Validators.required, this.passwordStrengthValidator, Validators.minLength(8)]),
      confirmarContrasena: new FormControl('', [Validators.required])
    }, {
      validator: matchPassword
    });
  }

  saveEmailandPhone() {
    // Valida que el formulario este completo y valido
    if (this.formCliente.invalid) {
      this.validateAllFormFields(this.formCliente);
      return;
    }

    // Guarda los datos del formulario
    this.correoCliente = this.formCliente.get('correoElectronico')?.value;
    this.telefonoCliente = this.formCliente.get('numeroTelefono')?.value;
    this.contrasenaCliente = this.formCliente.get('contrasenaCliente')?.value;

    // Primero ciframos la contraseña
    this.pro.postCifrarContrasena({ contrasena: this.contrasenaCliente }).subscribe(resp => {
      const encryptedPassword = resp.contraseña;

      // Enviar Variable a otro componente
      const navigationExtras: NavigationExtras = {
        state: {
          correoCliente: this.correoCliente,
          numeroTelefono: this.telefonoCliente,
          contrasenaCliente: encryptedPassword
        },
      };

      // Json para buscar un prospecto
      let jsonProspecto = {
        datos: {
          correoElectronico: this.correoCliente,
          numeroTelefono: this.telefonoCliente,
          contrasena: encryptedPassword,
        },
        accion: 2,
      };

      // Obtiene el prospecto
      this.http
        .post(environment.urlApi + '/onboarding/get-prospectos', jsonProspecto)
        .subscribe(async (resp: any) => {
          if (resp.codigo === '0') {
            // Json para buscar la solicitud del prospecto
            const jsonSearchProsp = {
              datos: { prospectoId: resp.info[0].prospecto_id },
              accion: 2,
            };

            const contrasenaCliente = this.formCliente.get('contrasenaCliente')?.value;

            // Ahora desciframos la contraseña
            this.pro.postDescifrarContrasena({ contrasena: resp.info[0].contrasena }).subscribe(async resp2 => {
              const decryptedPassword = resp2.contraseña;

              // Verificar que la contraseña proporcionada es correcta
              if (contrasenaCliente === decryptedPassword) {
                // Busca la solicitud del prospecto
                this.http
                  .post(
                    environment.urlApi + '/onboarding/get-solicitudes-onboarding',
                    jsonSearchProsp
                  )
                  .subscribe(async (resp: any) => {
                    const navigationPhoto: NavigationExtras = {
                      state: { prospectoId: resp.info[0].prospecto_id },
                    };

                    if (resp.info[0].cve_generales === '88SR') {
                      // Limpiar el formulario
                      this.formCliente.reset()
                      this.router.navigate(['/validacion']);
                    } else if (resp.info[0].cve_generales === '88PR') {
                      const alert = await this.alertController.create({
                        message: 'Parece que no has subido tus documentos. !Continua con tu proceso¡',
                        buttons: ['OK'],
                      });
                      await alert.present().then(() => {
                        // Limpiar el formulario
                        this.formCliente.reset();
                        this.router.navigate(['/photo'], navigationPhoto);
                      });
                    }
                  });
              } else {
                const alert = await this.alertController.create({
                  message: 'Correo electrónico, telefono o Contraseña incorrectos',
                  buttons: ['OK'],
                });
                await alert.present();
              }

            });
          } else {
            this.http.post(environment.urlApi + '/onboarding/login-clientes', jsonProspecto)
              .subscribe(async (resp: any) => {
                if (resp.codigo === '0') {
                  const alert = await this.alertController.create({
                    message: 'Parece que ya eres nuestro cliente. Inicia sesión con la misma contraseña.',
                    buttons: ['OK'],
                  });
                  await alert.present().then(() => {
                    this.formCliente.reset();
                    this.router.navigate(['/login']);
                  });
                } else if (resp.codigo === '1') {
                  const alert = await this.alertController.create({
                    message: 'Parece que ya eres nuestro cliente. Inicia sesión con la misma contraseña.',
                    buttons: ['OK'],
                  });
                  await alert.present().then(() => {
                    this.formCliente.reset();
                    this.router.navigate(['/login']);
                  });
                } else {
                  this.formCliente.reset();
                  this.router.navigate(['/datos-alta'], navigationExtras);
                }
              });
          }
        });
    });
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
   * Metodo que muestra u oculta la contraseña
   * @returns void
   */
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      const password = control.value;

      // Verifica al menos una mayúscula, una minúscula, un número y un carácter especial
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

      if (!(hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar)) {
        return { requirements: true };
      }

      return null;
    } else {
      return null;
    }
  }

  onPasswordInput() {
    const passwordControl = this.formCliente.get('contrasenaCliente');
    if (passwordControl) {
      const password = passwordControl.value;

      // Verifica la fortaleza de la contraseña
      const hasUpperCase = /[A-Z]/.test(password) ? 1 : 0;
      const hasLowerCase = /[a-z]/.test(password) ? 1 : 0;
      const hasDigit = /\d/.test(password) ? 1 : 0;
      const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password) ? 1 : 0;

      // Calcula la puntuación basada en las características de la contraseña
      const score = hasUpperCase + hasLowerCase + hasDigit + hasSpecialChar;

      // Ajusta el rango a 0-90
      this.passwordStrengthScore = (score * 22) + 2;

      // Elimina todas las clases existentes
      const barElement = document.querySelector('.password-strength-bar');
      if (barElement) {
        barElement.classList.remove('moderate', 'strong');
      }

      // Agrega la clase correspondiente
      if (score < 2) {
        barElement?.classList.add('weak');
      } else if (score < 4) {
        barElement?.classList.add('moderate');
      } else {
        barElement?.classList.add('strong');
      }
    }
  }

  getPasswordStrengthText() {
    switch (Math.floor(this.passwordStrengthScore - 2) / 22) {
      case 0:
        return 'La contraseña es: Muy débil';
      case 1:
        return 'La contraseña es: Débil';
      case 2:
        return 'La contraseña es: Moderada';
      case 3:
        return 'La contraseña es: Fuerte';
      case 4:
        return 'La contraseña es: Muy fuerte';
      default:
        return '';
    }
  }


}
