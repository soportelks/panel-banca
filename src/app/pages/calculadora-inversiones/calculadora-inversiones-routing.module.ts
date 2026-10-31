import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalculadoraInversionesPage } from './calculadora-inversiones.page';

const routes: Routes = [
  {
    path: '',
    component: CalculadoraInversionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalculadoraInversionesPageRoutingModule {}
