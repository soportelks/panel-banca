import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalcularPagoPageRoutingModule } from './calcular-pago-routing.module';

import { CalcularPagoPage } from './calcular-pago.page';

import { Mask } from './mask';
import { MaskFecha } from './mask-fecha';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalcularPagoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CalcularPagoPage, Mask, MaskFecha]
})
export class CalcularPagoPageModule {}
