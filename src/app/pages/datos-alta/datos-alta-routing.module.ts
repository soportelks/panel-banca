import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosAltaPage } from './datos-alta.page';

const routes: Routes = [
  {
    path: '',
    component: DatosAltaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosAltaPageRoutingModule {}
