import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalculadoraInversionesPageRoutingModule } from './calculadora-inversiones-routing.module';

import { CalculadoraInversionesPage } from './calculadora-inversiones.page';

import { ComprobantePageModule } from '../comprobante/comprobante.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalculadoraInversionesPageRoutingModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    ComprobantePageModule
  ],
  declarations: [CalculadoraInversionesPage]
})
export class CalculadoraInversionesPageModule { }
