import { Component } from '@angular/core';
/**
 * Autor: José Alexis Martínez Bárcenas
 * Fecha: 26/05/2023
 * Descripcion: Componente verificara el numero de telefono y enviara un codigo
 */
@Component({
  selector: 'app-phone-code',
  templateUrl: './phone-code.page.html',
  styleUrls: ['./phone-code.page.scss'],
})
export class PhoneCodePage {
  isAlertOpen = false;
  public alertButtons = ['OK'];

  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
}
