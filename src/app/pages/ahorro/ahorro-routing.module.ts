import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AhorroPage } from './ahorro.page';

const routes: Routes = [
  {
    path: '',
    component: AhorroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AhorroPageRoutingModule {}
