import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';


// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

import { MngInspectorsPage } from './mng-inspectors.page';


const routes: Routes = [
  {
    path: '',
    component: MngInspectorsPage
  }
];

@NgModule({
  imports: [
    MatTabsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MngInspectorsPage]
})
export class MngInspectorsPageModule {}
