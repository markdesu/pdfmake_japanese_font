import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ShipAggregatePage } from './ship-aggregate.page';

const routes: Routes = [
  {
    path: '',
    component: ShipAggregatePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ShipAggregatePage]
})
export class ShipAggregatePageModule {}
