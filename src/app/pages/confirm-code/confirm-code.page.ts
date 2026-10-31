import { Component, Inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { OtpServiceService } from 'src/app/services/otp-service.service';

@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.page.html',
  styleUrls: ['./confirm-code.page.scss'],
})
export class ConfirmCodePage {
  datosCliente: any;
  otpCode: number | undefined;
  timeLeft: number = 120;
  timer: any;
  formattedTime: string = '02:00';

  constructor(
    @Inject(Router) private router: Router,
    private otpService: OtpServiceService,
    private alertController: AlertController
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      const state = navigation.extras.state;
      this.datosCliente = state?.['datosCliente'];
    }
    this.sendOtp();
  }

  sendOtp() {
    if (this.datosCliente?.correo_electronico) {
      this.otpService.sendOtp(this.datosCliente.correo_electronico).subscribe(() => {
        this.timeLeft = 120;
        this.updateFormattedTime();
        this.startTimer();
      });
    }
  }

  startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateFormattedTime();
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);

      }
    }, 1000);
  }

  updateFormattedTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  resendOtp() {
    this.sendOtp();
    this.showResendAlert();
  }

  verifyOtp() {
    if (!this.otpCode) {
      return;
    }

    this.otpService.verifyOtp(this.datosCliente.correo_electronico, this.otpCode).subscribe(async valid => {

      if (valid) {
        const navigationExtras: NavigationExtras = {
          state: {
            datosCliente: this.datosCliente,
          },
        };
        clearInterval(this.timer);
        this.router.navigate(['/changue-passwd'], navigationExtras);
      } else {
        this.otpCode = 0;
        await this.showErrorAlert();
      }
    });
  }

  cancelAndReturn() {
    this.router.navigate(['/']); // Asegúrate de cambiar '/home' por la ruta correcta
  }


  async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'El código ingresado es incorrecto. Inténtalo de nuevo.',
      buttons: ['Aceptar'],
    });
    await alert.present();
  }

  async showResendAlert() {
    const alert = await this.alertController.create({
      header: 'Código reenviado',
      message: 'Te hemos enviado un nuevo código de verificación.',
      buttons: ['Aceptar'],
    });
    await alert.present();
  }
}
