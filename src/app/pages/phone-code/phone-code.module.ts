import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhoneCodePageRoutingModule } from './phone-code-routing.module';

import { PhoneCodePage } from './phone-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhoneCodePageRoutingModule
  ],
  declarations: [PhoneCodePage]
})
export class PhoneCodePageModule {}
