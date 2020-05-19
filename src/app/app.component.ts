import { Component } from '@angular/core';
import { AuthguardService } from './services/authguard.service';
import { SystemguardService } from './services/systemguard.service';
import { Router } from '../../node_modules/@angular/router';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {
    
  constructor(public authguard: AuthguardService, 
              public userlevelguard: SystemguardService, 
              private router: Router,
              public updates: SwUpdate) {

    this.initializeApp();
    this.updates.available.subscribe(event => {
      const changelog = event.available.appData['changelog'];
      const message = changelog + " Click to refresh.";
      if (confirm(message)) {
        window.location.reload();
      }
    });
  }
  
  initializeApp() {
    this.authguard.isLoggedIn();
    //this.userlevelguard.isAdminLoggedIn();
  }
  
  logout() {
    this.authguard.logout(); 
  }

  settings() {
    this.router.navigate(['/user-setting'] );
  }
  
}

    
// this.platform.ready().then(() => {
//   // this.statusBar.styleDefault();
//   // this.splashScreen.hide();
// });
// if(this.authguard.provider_name){
//   this.provider_name = this.authguard.provider_name; 
// }
  