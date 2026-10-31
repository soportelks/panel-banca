import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditoPageRoutingModule } from './credito-routing.module';

import { CreditoPage } from './credito.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditoPageRoutingModule
  ],
  declarations: [CreditoPage]
})
export class CreditoPageModule {}
