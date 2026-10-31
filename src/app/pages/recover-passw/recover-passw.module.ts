import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecoverPasswPageRoutingModule } from './recover-passw-routing.module';

import { RecoverPasswPage } from './recover-passw.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecoverPasswPageRoutingModule
  ],
  declarations: [RecoverPasswPage]
})
export class RecoverPasswPageModule {}
