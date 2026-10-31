import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements AfterViewInit {
  datosCliente!: any;
  isChangePassword: boolean = false;
  contrasenaActual: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  isModalOpen: boolean = false;
  presentingElement: any;
  mostrarContrasenaActual: boolean = false;
  mostrarNuevaContrasena: boolean = false;
  mostrarConfirmarContrasena: boolean = false;

  constructor(private router: Router, private alertCtrl: AlertController, private utils: UtilsService, private auth: AuthServiceService) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      const state = navigation.extras.state;
      this.datosCliente = state?.['datosCliente'];
    }
  }

  ngAfterViewInit(): void { }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto).then(() => {
    }).catch(err => {
      console.error('Error al copiar: ', err);
    });
  }

  actualizarDatos() {

    const clienteJson = {
      datos: {
        prospectoId: this.datosCliente.prospecto_id,
        nombreProspecto: this.datosCliente.nombre_prospecto,
        correoElectronico: this.datosCliente.correo_electronico,
        numeroTelefono: this.datosCliente.numero_telefono
      },
      accion: 2,
    };

    this.utils.actualizarContacto(clienteJson).subscribe({
      next: (response: any) => {
        if (response.codigo === '1') {
          this.presentAlert(`Datos actualizados correctamente, se reiniciara para reflejar cambios`);
          this.router.navigate(['/']);
        } else {
          this.presentAlert(response.mensaje);
        }
      },
      error: (err) => {
        this.presentAlert(`Error al realizar la operación: No se pudo mandar la orden por fallo con conexion al servidor`);
      },
    })
  }

  abrirModalCambioContrasena() {
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  async cambiarContrasena() {
    // Recuperar el token del localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      // Si no existe el token en el localStorage
      this.presentAlert('No se encontró un token de sesión. Por favor, inicie sesión nuevamente.');
      return;
    }

    const clienteJson = {
      prospecto_id: this.datosCliente.prospecto_id,
      contrasena: this.nuevaContrasena,
      contrasenaActual: this.contrasenaActual
    };

    this.utils.actualizarContacto(clienteJson).subscribe({
      next: (response: any) => {
        if (response.codigo === 0) {
          this.presentAlert(`Datos actualizados correctamente, se reiniciara para reflejar cambios`);
          this.cerrarModal();
          this.cerrarSesion();
        } else {
          this.presentAlert(response.mensaje);
        }
      },
      error: (err) => {
        this.presentAlert(`Error al realizar la operación: No se pudo mandar la orden por fallo con conexion al servidor`);
      },
    })
  }


  get isCambioContrasenaHabilitado(): boolean {
    return (
      this.contrasenaActual.length > 0 &&
      this.nuevaContrasena.length > 0 &&
      this.nuevaContrasena === this.confirmarContrasena &&
      this.validarContrasena(this.nuevaContrasena)
    );
  }

  validacionesContrasena = {
    mayuscula: false,
    numero: false,
    caracterEspecial: false,
    longitud: false
  };

  validarContrasena(contrasena: string): boolean {
    this.validacionesContrasena.mayuscula = /[A-Z]/.test(contrasena);
    this.validacionesContrasena.numero = /\d/.test(contrasena);
    this.validacionesContrasena.caracterEspecial = /[@$!%*?&.#]/.test(contrasena);
    this.validacionesContrasena.longitud = contrasena.length >= 8;

    return Object.values(this.validacionesContrasena).every(v => v);
  }

  get mensajeValidacionContrasena(): string {
    const errores = [];
    if (!this.validacionesContrasena.mayuscula) errores.push('Debe contener al menos una mayúscula.');
    if (!this.validacionesContrasena.numero) errores.push('Debe contener al menos un número.');
    if (!this.validacionesContrasena.caracterEspecial) errores.push('Debe contener al menos un carácter especial.');
    if (!this.validacionesContrasena.longitud) errores.push('Debe tener al menos 8 caracteres.');
    return errores.join(' ');
  }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: "Alerta",
      message: message,
      buttons: ["Aceptar"],
      cssClass: "custom-alert",
    });

    await alert.present();
  }

  cerrarSesion() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.limpiarSesionLocal();
      return;
    }

    this.auth.logout().subscribe({
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
    this.clearCookies();
    this.router.navigate(['/home']);
  }

  clearCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    });
  }


}
