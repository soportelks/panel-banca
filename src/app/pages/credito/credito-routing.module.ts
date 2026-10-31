import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditoPage } from './credito.page';

const routes: Routes = [
  {
    path: '',
    component: CreditoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditoPageRoutingModule {}
