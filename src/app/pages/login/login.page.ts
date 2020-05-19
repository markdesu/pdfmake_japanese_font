import { Component, OnInit } from '@angular/core';
import { AuthguardService } from '../../services/authguard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Events, Platform }  from '@ionic/angular';
import { WeighingService } from '../../services/weighing.service';
import { MatDialogConfig, MatDialog } from '../../../../node_modules/@angular/material';
import { SelectProviderComponent } from '../../modals/select-provider/select-provider.component';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
 
var sha1 = require('sha1');
var CryptoJS = require("crypto-js");

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private readonly onDestroy = new Subject<void>();
   constructor(
              public route: ActivatedRoute, 
              public router: Router, 
              public events: Events, 
              private weighingAPI : WeighingService, 
              private authGuard : AuthguardService, 
              private mcon: MenuController, 
              private Platform : Platform,
              private Dialog: MatDialog) {  
      
    this.route.queryParams.subscribe(params => {
        if(params.url){
          this.url = params.url;
        }
        if(params.topic){
          this.topic = params.topic; 
        }
    });
    // this.mcon.enable(false);
  }
  
   username    : string = '';
   password    : string = '';
   loginStatus : string = '';
   url         : string = '';
   topic       : string = '';
   chkAdmin    : boolean = false;

   MobileBrowser = false;
   hideHeader = false;
   
  ngOnInit() {

    if(this.authGuard.isLoggedIn()){
      this.router.navigate(['/']);
    }
   
  }
  
  isMobileBrowser() {  
    // is this web-browser on mobile device
    return this.Platform.is('mobileweb');
  }


  ionViewWillEnter() {
    if(this.Platform)
    this.MobileBrowser = this.isMobileBrowser();
    this.mcon.enable(false);
    this.hideHeader = this.MobileBrowser;
  }
  
    
  ionViewWillLeave() {
    this.mcon.enable(true);
    this.onDestroy.next();
  }
  
  
  loginUser() {
    this.loginStatus = '';
    const user_level = '1';
    const hash_pass = sha1(this.password);
 
    this.authGuard.execLogin(this.username, hash_pass, user_level).pipe(takeUntil(this.onDestroy)).subscribe(res => {

      if(res) {
        if(res.status == '200') {
            if(res.data.length > 1) {
              this.showSelectProvider(res.data,res.token);
              return;
            } else if(res.data.length == 1) {
              
              if(!res.data[0].provider_id) {
                this.loginStatus = 'このユーザーのプロバイダが見つかりません。';
                return;
              }
              this.setAuth(res.data[0],res.token,res.data);
            }
        } else {
          //Invalid Username and Password
          if(this.chkAdmin) {
            this.loginStatus = 'ログイン ID またはパスワードが違います / ユーザーが管理者ではありません';
          } else {
            this.loginStatus = 'ログイン ID またはパスワードが違います';
          }   
        }
      }    
    });
  } 
  
  setAuth(data,token, raw) {

    localStorage.setItem('Session',  CryptoJS.AES.encrypt(JSON.stringify(raw), '123'));
    localStorage.setItem('Session_Token',  token);
    localStorage.setItem('Provider', data.provider_name);
    localStorage.setItem('Provider_Prefix', data.prefix);
    this.authGuard.provider_name = data.provider_name;
    this.authGuard.provider_prefix = data.prefix;
    this.authGuard.isAuthenticated = true;
    this.username = '';
    this.password = '';
    this.loginStatus = '';
        
    this.authGuard.getSessionData();
    this.authGuard.setAuthority();  
        
    if(this.url == '') {
      this.router.navigate(['/dashboard']);
    } else {
      this.events.publish(this.topic);
      this.router.navigate([this.url]);
    }
   
  }
  
  async showSelectProvider(data,token) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.minWidth = '340px';
    dialogConfig.maxWidth = '200vw';
    dialogConfig.maxHeight = '600px';
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = 'custom_matdialog';
  
    //Set this to enable inspector option
    dialogConfig.data = data;
    
    var dailogref = this.Dialog.open(SelectProviderComponent,dialogConfig);

    dailogref.afterClosed().subscribe(res => {   
          if(res == 'close'){   
            return;
          }
          this.setAuth(data[res],token,data);
    });
  }

  redirect() {
    this.router.navigate(['/']);
  }

  
  reissuePass(){
    console.log('click');
    this.router.navigate(['/reissue-password']);
  }
}

