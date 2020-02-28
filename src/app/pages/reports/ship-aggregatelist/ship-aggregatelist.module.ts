import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ShipAggregatelistPage } from './ship-aggregatelist.page';

const routes: Routes = [
  {
    path: '',
    component: ShipAggregatelistPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ShipAggregatelistPage]
})
export class ShipAggregatelistPageModule {}
