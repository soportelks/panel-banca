import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecargasPageRoutingModule } from './recargas-routing.module';

import { RecargasPage } from './recargas.page';
import { ComprobantePageModule } from '../comprobante/comprobante.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecargasPageRoutingModule,
    ReactiveFormsModule,
    ComprobantePageModule,
  ],
  declarations: [RecargasPage],
})
export class RecargasPageModule {}
