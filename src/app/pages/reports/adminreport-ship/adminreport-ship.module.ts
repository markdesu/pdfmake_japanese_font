import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AdminreportShipPage } from './adminreport-ship.page';

const routes: Routes = [
  {
    path: '',
    component: AdminreportShipPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdminreportShipPage]
})
export class AdminreportShipPageModule {}
