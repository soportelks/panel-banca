import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChanguePasswdPageRoutingModule } from './changue-passwd-routing.module';

import { ChanguePasswdPage } from './changue-passwd.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChanguePasswdPageRoutingModule
  ],
  declarations: [ChanguePasswdPage]
})
export class ChanguePasswdPageModule {}
