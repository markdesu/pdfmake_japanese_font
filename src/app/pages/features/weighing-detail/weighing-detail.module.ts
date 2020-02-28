import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { WeighingDetailPage } from './weighing-detail.page';
import { NumpadComponent } from '../../../modals/numpad/numpad.component';

const routes: Routes = [
  {
    path: '',
    component: WeighingDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatDialogModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [WeighingDetailPage,NumpadComponent],
  entryComponents: [NumpadComponent]
})
export class WeighingDetailPageModule {}
