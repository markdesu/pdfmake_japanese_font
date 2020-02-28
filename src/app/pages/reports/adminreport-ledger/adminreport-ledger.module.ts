import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AdminreportLedgerPage } from './adminreport-ledger.page';

const routes: Routes = [
  {
    path: '',
    component: AdminreportLedgerPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdminreportLedgerPage]
})
export class AdminreportLedgerPageModule {}
