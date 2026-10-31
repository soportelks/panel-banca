import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarOrdenPageRoutingModule } from './registrar-orden-routing.module';

import { RegistrarOrdenPage } from './registrar-orden.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RegistrarOrdenPageRoutingModule
  ],
  declarations: [RegistrarOrdenPage]
})
export class RegistrarOrdenPageModule { }
