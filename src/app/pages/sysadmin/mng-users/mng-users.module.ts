import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule  } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MngUsersPage } from './mng-users.page';
import { FormsModule,  ReactiveFormsModule} from '@angular/forms';

// Angular Material
import { MatTableModule} from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatIconModule} from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';


const routes: Routes = [
  {
    path: '',
    component: MngUsersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    
    RouterModule.forChild(routes)
  ],
  declarations: [MngUsersPage],
  entryComponents: [],

})
export class MngUsersPageModule {}
