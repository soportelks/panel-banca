import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecoverPasswPage } from './recover-passw.page';

const routes: Routes = [
  {
    path: '',
    component: RecoverPasswPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecoverPasswPageRoutingModule {}
