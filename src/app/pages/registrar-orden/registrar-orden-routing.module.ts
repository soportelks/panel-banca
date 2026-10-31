import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrarOrdenPage } from './registrar-orden.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarOrdenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrarOrdenPageRoutingModule {}
