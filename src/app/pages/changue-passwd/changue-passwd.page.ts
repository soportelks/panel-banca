import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { ProspectosService } from 'src/app/services/prospectos.service';

/**
 * Autor: José Alexis Martínez Bárcenas
 * Fecha: 26/05/2023
 * Descripción: Componente para cambiar la contraseña de un cliente
 */

@Component({
  selector: 'app-changue-passwd',
  templateUrl: './changue-passwd.page.html',
  styleUrls: ['./changue-passwd.page.scss'],
})
export class ChanguePasswdPage {
  isPasswordVisible: boolean = false;
  password1: string = '';
  password2: string = '';
  passwordsMatch: boolean = false;
  datosCliente: any;
  validacionesContrasena = {
    mayuscula: false,
    numero: false,
    caracterEspecial: false,
    longitud: false
  };

  constructor(private router: Router, private alertCtrl: AlertController, private utils: UtilsService, private pros: ProspectosService) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      const state = navigation.extras.state;
      this.datosCliente = state?.['datosCliente'];
    }
  }

  /**
   * Método que cambia la visibilidad de la contraseña
   */
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  /**
   * Método que valida que las contraseñas coincidan
   */
  checkPasswordMatch() {
    this.passwordsMatch = this.password1 === this.password2;
  }

  /**
   * Valida que la contraseña cumpla con los requisitos mínimos
   */
  validarContrasena(contrasena: string): boolean {
    this.validacionesContrasena.mayuscula = /[A-Z]/.test(contrasena);
    this.validacionesContrasena.numero = /\d/.test(contrasena);
    this.validacionesContrasena.caracterEspecial = /[@$!%*?&.#]/.test(contrasena);
    this.validacionesContrasena.longitud = contrasena.length >= 8;

    return Object.values(this.validacionesContrasena).every(v => v);
  }

  /**
   * Genera un mensaje con los errores de validación de la contraseña
   */
  get mensajeValidacionContrasena(): string {
    const errores = [];
    if (!this.validacionesContrasena.mayuscula) errores.push('Debe contener al menos una mayúscula.');
    if (!this.validacionesContrasena.numero) errores.push('Debe contener al menos un número.');
    if (!this.validacionesContrasena.caracterEspecial) errores.push('Debe contener al menos un carácter especial.');
    if (!this.validacionesContrasena.longitud) errores.push('Debe tener al menos 8 caracteres.');
    return errores.join(' ');
  }

  /**
   * Muestra una alerta con un mensaje
   */
  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: "Alerta",
      message: message,
      buttons: ["Aceptar"],
      cssClass: "custom-alert",
    });

    await alert.present();
  }

  /**
   * Verifica si se puede cambiar la contraseña
   */
  get isCambioContrasenaHabilitado(): boolean {
    return (
      this.password1.length > 0 &&
      this.password2.length > 0 &&
      this.password1 === this.password2 &&
      this.validarContrasena(this.password1)
    );
  }

  /**
   * Método para cambiar la contraseña del cliente
   */
  async cambiarContrasena() {
    // Verificar que las contraseñas coincidan
    if (this.password1 !== this.password2) {
      await this.presentAlert('Las contraseñas no coinciden.');
      return;
    }

    // Validar que la contraseña cumple con los requisitos
    if (!this.validarContrasena(this.password1)) {
      await this.presentAlert(this.mensajeValidacionContrasena);
      return;
    }

    const clienteJson = {
      prospecto_id: this.datosCliente?.prospecto_id,
      contrasena: this.password1.trim(),
    };

    this.pros.postRecuperarContraseña(clienteJson).subscribe({
      next: async (response: any) => {
        if (response.codigo === 0) {
          await this.presentAlert('Contraseña cambiada exitosamente.');
          localStorage.removeItem('datosCliente'); // Limpia datos previos
          this.router.navigate(['/home']); // Redirige al inicio
        } else {
          this.presentAlert(response.mensaje);
        }
      },
      error: () => {
        this.presentAlert('Error al cambiar la contraseña. Intente nuevamente.');
      },
    });
  }
}
