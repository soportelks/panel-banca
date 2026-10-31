import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhoneCodePage } from './phone-code.page';

const routes: Routes = [
  {
    path: '',
    component: PhoneCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhoneCodePageRoutingModule {}
