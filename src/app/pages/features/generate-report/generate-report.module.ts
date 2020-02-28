import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IonicModule } from '@ionic/angular';

import { GenerateReportPage } from './generate-report.page';
import { MatInputModule } from '../../../../../node_modules/@angular/material';

const routes: Routes = [
  {
    path: '',
    component: GenerateReportPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatAutocompleteModule,
    MatInputModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GenerateReportPage]
})
export class GenerateReportPageModule {}
