import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

//Pages and Components
import { AppComponent } from './app.component';
import { WeighingService} from './services/weighing.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateUserComponent } from './modals/create-user/create-user.component';
import { EditUserComponent } from './modals/edit-user/edit-user.component';
import { CreateCustomerComponent } from './modals/create-customer/create-customer.component';
import { EditCustomerComponent } from './modals/edit-customer/edit-customer.component';

//Imports
import { MatTableModule} from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule,  ReactiveFormsModule} from '@angular/forms';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatIconModule} from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SelectProviderComponent } from './modals/select-provider/select-provider.component';


@NgModule({
  declarations: [AppComponent,CreateUserComponent, EditUserComponent, CreateCustomerComponent, EditCustomerComponent, SelectProviderComponent],
  entryComponents: [CreateUserComponent, EditUserComponent, CreateCustomerComponent, EditCustomerComponent, SelectProviderComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({scrollAssist: false}),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    StatusBar,
    SplashScreen, Keyboard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WeighingService,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
