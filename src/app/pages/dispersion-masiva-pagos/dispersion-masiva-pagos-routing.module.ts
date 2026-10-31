import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DispersionMasivaPagosPage } from './dispersion-masiva-pagos.page';

const routes: Routes = [
  {
    path: '',
    component: DispersionMasivaPagosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DispersionMasivaPagosPageRoutingModule {}
