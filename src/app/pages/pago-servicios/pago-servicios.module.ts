import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagoServiciosPageRoutingModule } from './pago-servicios-routing.module';

import { PagoServiciosPage } from './pago-servicios.page';
import { ComprobantePageModule } from '../comprobante/comprobante.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagoServiciosPageRoutingModule,
    ReactiveFormsModule,
    ComprobantePageModule,
  ],
  declarations: [PagoServiciosPage],
})
export class PagoServiciosPageModule {}
