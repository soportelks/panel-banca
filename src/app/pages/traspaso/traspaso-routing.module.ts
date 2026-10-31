import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TraspasoPage } from './traspaso.page';

const routes: Routes = [
  {
    path: '',
    component: TraspasoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TraspasoPageRoutingModule { }
