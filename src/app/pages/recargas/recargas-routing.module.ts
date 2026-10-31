import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecargasPage } from './recargas.page';

const routes: Routes = [
  {
    path: '',
    component: RecargasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecargasPageRoutingModule {}
