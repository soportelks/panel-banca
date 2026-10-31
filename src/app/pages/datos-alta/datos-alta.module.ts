import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosAltaPageRoutingModule } from './datos-alta-routing.module';

import { DatosAltaPage } from './datos-alta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosAltaPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [DatosAltaPage],
})
export class DatosAltaPageModule {}
