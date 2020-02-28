import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthguardService } from './services/authguard.service';
import { SystemguardService } from './services/systemguard.service';
import { Router } from '../../node_modules/@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {
  
    
  constructor(private platform: Platform, public authguard: AuthguardService, public userlevelguard: SystemguardService, private router: Router ) {
       
        this.initializeApp();
         // private splashScreen: SplashScreen,
         // private statusBar: StatusBar,
  }
   
  
  initializeApp() {
      this.authguard.isLoggedIn();
      // this.userlevelguard.isAdminLoggedIn();

  }
  
  logout() {
      this.authguard.logout(); 
  }
  
  asm_logout() {
    // this.userlevelguard.logout(); 
  }
  
  settings(){
    this.router.navigate(['/user-setting'] );
  }
}

    
    // this.platform.ready().then(() => {
    //   // this.statusBar.styleDefault();
    //   // this.splashScreen.hide();
    // });
    // console.log(this.)
    // if(this.authguard.provider_name){
    //   this.provider_name = this.authguard.provider_name; 
    // }
    