import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recover-passw',
  templateUrl: './recover-passw.page.html',
  styleUrls: ['./recover-passw.page.scss'],
})
export class RecoverPasswPage {
  phoneNumber: string = '';  // Propiedad para enlazar el input

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) { }

  searchClientForRecovery() {
    if (!this.phoneNumber || this.phoneNumber.length !== 10) {
      this.showAlert('Número de teléfono inválido');
      return;
    }

    const clienteJson = {
      datos: { numeroTelefono: this.phoneNumber },
      accion: 2,
    };

    this.http
      .post(environment.urlApi + '/onboarding/get-prospectos', clienteJson)
      .subscribe(
        async (resp: any) => {
          if (resp.info != null && resp.info.length > 0) {
            const navigationExtras: NavigationExtras = {
              state: {
                datosCliente: resp.info[0],
              },
            };
            this.router.navigate(['/confirm-code'], navigationExtras);
          } else {
            this.showAlert('Número de teléfono no encontrado');
          }
        },
        (error) => {
          this.showAlert('Error al buscar el cliente');
        }
      );
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: "Alerta",
      message: message,
      buttons: ["Aceptar"],
      cssClass: "custom-alert",
    });

    await alert.present();
  }
}
