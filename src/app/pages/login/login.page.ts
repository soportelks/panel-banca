import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { OtpServiceService } from 'src/app/services/otp-service.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';

/**
 * Autor: José Alexis Martínez Bárcenas
 * Fecha: 26/05/2023
 * Descripcion: Componente para que un cliente inicie sesión
 * @version 2.0
 */

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  isPasswordVisible: boolean;
  formCliente: FormGroup;
  code: number | null = null;
  message: string = '';
  resendDisabled: boolean = true;
  timer: any;
  timeLeft: number = 120;
  alertInstance: HTMLIonAlertElement | null = null;
  incorrectMessage: string = '';

  /**
   * Validacion para los campos
   */
  validaciones = {
    telefono: [
      { type: 'required', message: 'Campo requerido.' },
      {
        type: 'pattern',
        message: 'El formato debe ser 1234567890.',
      },
    ],
    contrasena: [{ type: 'required', message: 'Ingresa tu contraseña' }]
  };

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private otpService: OtpServiceService,
    private authService: AuthServiceService
  ) {
    this.isPasswordVisible = false;

    // Inicializa el formulario del cliente y sus validaciones.
    this.formCliente = this.formBuilder.group({
      numeroTelefono: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]{10}'),
      ]),
      contrasenaCliente: new FormControl('', [Validators.required])
    });
  }

  /**
   * Metodo que muestra u oculta la contraseña
   * @returns void
   */
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  /**
   * Metodo que verifica que el cliente exista en la base de datos
   * @returns void
   */
  searchClient() {
    if (this.formCliente.invalid) {
      this.validateAllFormFields(this.formCliente);
      return;
    }

    const telCliente = this.formCliente.get('numeroTelefono')?.value;
    const contrasenaCliente = this.formCliente.get('contrasenaCliente')?.value;

    this.authService.login(telCliente, contrasenaCliente).subscribe({
      next: async (resp: any) => {
        if (resp.codigo === 0) {
          const usuario = resp.info.usuario;
          const token = resp.info.token;

          localStorage.setItem('token', token);
          localStorage.setItem('datosCliente', JSON.stringify(usuario));

          const otpVerified = await this.sendOtp(usuario.correo_electronico);

          if (!otpVerified) {
            this.cerrarSesion();
            return;
          }
          this.router.navigate(['/inicio']);

        } else {
          const alert = await this.alertController.create({
            message: resp.mensaje || 'Teléfono o contraseña incorrectos',
            buttons: ['OK']
          });
          await alert.present();
        }

        this.formCliente.reset();
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          message: err.error.mensaje,
          buttons: ['OK']
        });
        await alert.present();
      }

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

  sendOtp(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (email) {
        // Mostrar mensaje de envío antes de hacer la petición
        this.message = 'Enviando código al correo...';
        this.incorrectMessage = '';

        this.otpService.sendOtp(email).subscribe(
          (response) => {
            this.message = 'Código enviado al correo.';
            this.resendDisabled = true;
            this.timeLeft = 120;
            this.startTimer();
            this.openOtpModal(email, resolve);
          },
          (error) => {
            this.message = 'Error al enviar el código.';
            resolve(false);
          }
        );
      } else {
        resolve(false);
      }
    });
  }


  startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.resendDisabled = false;
      }
      this.updateAlertMessage();
    }, 1000);
  }

  async openOtpModal(email: string, resolve: (value: boolean | PromiseLike<boolean>) => void) {
    this.alertInstance = await this.alertController.create({
      header: 'Ingresar OTP',
      message: `
     
        Tiempo restante: ${this.timeLeft} segundos
        ${this.incorrectMessage ? `${this.incorrectMessage}` : ''}
        Si termina el tiempo, cancela y vuelve a intentar.
    
    `,
      inputs: [
        {
          name: 'otpCode',
          type: 'number',
          placeholder: 'Introduce el código OTP'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            clearInterval(this.timer);
            resolve(false); // Usuario canceló
          }
        },
        {
          text: 'Verificar',
          handler: async (data) => {
            const isValid = await this.verifyOtp(email, data.otpCode);
            resolve(isValid); // Validamos el código OTP
            return isValid;
          }
        }
      ]
    });

    await this.alertInstance.present();
    this.updateAlertMessage();
  }

  updateAlertMessage() {
    if (this.alertInstance) {
      this.alertInstance.message = `Tiempo restante: ${this.timeLeft} segundos` + (this.incorrectMessage ? `${this.incorrectMessage}` : '');
    }
  }

  verifyOtp(email: string, code: number) {
    return new Promise<boolean>((resolve) => {
      if (email && code !== null) {
        this.otpService.verifyOtp(email, code).subscribe(valid => {
          if (valid) {
            this.message = 'Código correcto. Autenticación exitosa.';
            clearInterval(this.timer);
            resolve(true);
          } else {
            this.message = ' : Código incorrecto. Puedes intentarlo de nuevo.';
            this.incorrectMessage = ' : Código incorrecto. Inténtalo nuevamente.';
            this.resendDisabled = false;
            this.updateAlertMessage();
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
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
      },
      error: () => {
        this.limpiarSesionLocal();
      }
    });
  }

  private limpiarSesionLocal() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  clearCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    });
  }
}
