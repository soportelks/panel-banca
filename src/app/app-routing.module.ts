import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/register/register.module').then(
        (m) => m.RegisterPageModule
      ),
  },
  {
    path: 'phone-code',
    loadChildren: () =>
      import('./pages/phone-code/phone-code.module').then(
        (m) => m.PhoneCodePageModule
      ),
  },
  {
    path: 'photo',
    loadChildren: () =>
      import('./pages/photo/photo.module').then((m) => m.PhotoPageModule),
  },
  {
    path: 'datos-alta',
    loadChildren: () =>
      import('./pages/datos-alta/datos-alta.module').then(
        (m) => m.DatosAltaPageModule
      ),
  },
  {
    path: 'validacion',
    loadChildren: () =>
      import('./pages/validacion/validacion.module').then(
        (m) => m.ValidacionPageModule
      ),
  },
  {
    path: 'inicio',
    loadChildren: () =>
      import('./pages/inicio/inicio.module').then((m) => m.InicioPageModule),
  },
  {
    path: 'recover-passw',
    loadChildren: () =>
      import('./pages/recover-passw/recover-passw.module').then(
        (m) => m.RecoverPasswPageModule
      ),
  },
  {
    path: 'confirm-code',
    loadChildren: () =>
      import('./pages/confirm-code/confirm-code.module').then(
        (m) => m.ConfirmCodePageModule
      ),
  },
  {
    path: 'changue-passwd',
    loadChildren: () =>
      import('./pages/changue-passwd/changue-passwd.module').then(
        (m) => m.ChanguePasswdPageModule
      ),
  },
  {
    path: 'ahorro',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/ahorro/ahorro.module').then((m) => m.AhorroPageModule),
  },
  {
    path: 'calculadora-inversiones',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import(
        './pages/calculadora-inversiones/calculadora-inversiones.module'
      ).then((m) => m.CalculadoraInversionesPageModule),
  },
  {
    path: 'inversiones',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/inversiones/inversiones.module').then(
        (m) => m.InversionesPageModule
      ),
  },

  {
    path: 'recargas',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/recargas/recargas.module').then(
        (m) => m.RecargasPageModule
      ),
  },
  {
    path: 'pago-servicios',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/pago-servicios/pago-servicios.module').then(m => m.PagoServiciosPageModule)
  },
  {
    path: 'credito',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/credito/credito.module').then(m => m.CreditoPageModule)
  },
  {
    path: 'calcular-pago',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/calcular-pago/calcular-pago.module').then(m => m.CalcularPagoPageModule)
  },
  {
    path: 'comprobante',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/comprobante/comprobante.module').then(m => m.ComprobantePageModule)
  },
  {
    path: 'dispersion-masiva-pagos',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/dispersion-masiva-pagos/dispersion-masiva-pagos.module').then(m => m.DispersionMasivaPagosPageModule)
  },
  {
    path: 'registrar-orden',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/registrar-orden/registrar-orden.module').then(m => m.RegistrarOrdenPageModule)
  },
  {
    path: 'reset-pass',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'traspaso',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/traspaso/traspaso.module').then(m => m.TraspasoPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
