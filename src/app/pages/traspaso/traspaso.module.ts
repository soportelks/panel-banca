import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TraspasoPageRoutingModule } from './traspaso-routing.module';

import { TraspasoPage } from './traspaso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TraspasoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TraspasoPage]
})
export class TraspasoPageModule { }
