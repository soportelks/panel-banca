import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalcularPagoPage } from './calcular-pago.page';

const routes: Routes = [
  {
    path: '',
    component: CalcularPagoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalcularPagoPageRoutingModule {}
