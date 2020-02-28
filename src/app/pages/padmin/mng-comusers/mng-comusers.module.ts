import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule,  ReactiveFormsModule} from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

import { MngComusersPage } from './mng-comusers.page';
import { MatDialogModule } from '../../../../../node_modules/@angular/material';
import { CreateUserComponent } from '../../../modals/create-user/create-user.component';
import { EditUserComponent } from '../../../modals/edit-user/edit-user.component';

const routes: Routes = [
  {
    path: '',
    component: MngComusersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // MatTabsModule,
    // ReactiveFormsModule,
    // MatAutocompleteModule,
    // MatInputModule,
    // MatFormFieldModule,
    MatTableModule,
    // MatIconModule,
    // MatDialogModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MngComusersPage],
  // entryComponents: [CreateUserComponent, EditUserComponent]
})
export class MngComusersPageModule {}
