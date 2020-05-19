import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReissuePasswordPage } from './reissue-password.page';

const routes: Routes = [
  {
    path: '',
    component: ReissuePasswordPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReissuePasswordPage]
})
export class ReissuePasswordPageModule {}
