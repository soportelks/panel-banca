import { Component, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-comprobante',
  templateUrl: './comprobante.page.html',
  styleUrls: ['./comprobante.page.scss'],
})
export class ComprobantePage {
  /*@Input() datosTransaccion: any = {
    nombreCliente: '',
    cveCliente: '',
    cveOperacion: '',
    fechaTransaccion: '',
    horaTransaccion: '',
    descripcion: '',
    monto: 0,
    comision: 0,
    total: 0,
  };*/

  datosTransaccion: any ;

  constructor(private modalCtrl: ModalController, private navParams: NavParams) {
    this.datosTransaccion = this.navParams.get('datos');
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('', 'confirm');
  }
}
