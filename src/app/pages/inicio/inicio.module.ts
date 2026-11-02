import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InicioPageRoutingModule } from './inicio-routing.module';

import { InicioPage } from './inicio.page';
import { FooterComponent } from '../footer/footer.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InicioPageRoutingModule,
    ThemeToggleComponent
  ],
  declarations: [InicioPage]
})
export class InicioPageModule { }
