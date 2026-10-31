import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DispersionMasivaPagosPageRoutingModule } from './dispersion-masiva-pagos-routing.module';

import { DispersionMasivaPagosPage } from './dispersion-masiva-pagos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DispersionMasivaPagosPageRoutingModule
  ],
  declarations: [DispersionMasivaPagosPage]
})
export class DispersionMasivaPagosPageModule {}
