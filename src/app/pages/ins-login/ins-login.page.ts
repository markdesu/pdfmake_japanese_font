import { Component, OnInit } from '@angular/core';
import { AuthguardService } from '../../services/authguard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Events, Platform, MenuController }  from '@ionic/angular';
import { WeighingService } from '../../services/weighing.service';
 

var CryptoJS = require("crypto-js");
var sha1 = require('sha1');
@Component({
  selector: 'app-ins-login',
  templateUrl: './ins-login.page.html',
  styleUrls: ['./ins-login.page.scss'],
})
export class InsLoginPage implements OnInit {

  constructor(
              public route: ActivatedRoute, 
              public router: Router,  
              public events: Events, 
              private authGuard : AuthguardService,
              private weighingAPI : WeighingService,
              private Platform : Platform, 
              private mcon: MenuController) {
                  
    this.route.queryParams.subscribe(params => {
        if(params.url){
          this.url = params.url;
        }
        if(params.topic){
          this.topic = params.topic; 
          
        }

    });}
  
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
    
  isMobileBrowser(){  
    // is this web-browser on mobile device
    return this.Platform.is('mobileweb');
  }

  ionViewWillEnter() {
    if(this.Platform)
    this.MobileBrowser = this.isMobileBrowser();
    this.hideHeader = this.MobileBrowser;
    this.mcon.enable(false);
  }
  
  ionViewWillLeave() {
    this.mcon.enable(true);
  }
  
  loginUser() {
    const user_level = '2';
    const hash_pass = sha1(this.password);
    this.authGuard.execLogin(this.username, hash_pass, user_level).subscribe(res => {

      if(res) {
        if(res.status == '200') {

            localStorage.setItem('Session',  CryptoJS.AES.encrypt(JSON.stringify(res.data), '123'));
            localStorage.setItem('Session_Token',  res.token);

            // this.authGuard.username =   res.data.username;
            // this.authGuard.user_type  = res.data.user_type;
            this.authGuard.isAuthenticated = true;
            this.username = '';
            this.password = '';
            this.loginStatus = '';

            this.weighingAPI.getProviderDetails(res.data.provider_id).subscribe(res2 => {
              if(res2){
                if(res2.data){
                  localStorage.setItem('Provider', res2.data.name);
                  localStorage.setItem('Provider_Prefix', res2.data.prefix);
                  this.authGuard.provider_name = res2.data.name;
                  this.authGuard.provider_prefix =  res2.data.prefix;
                }
              }
            });
     
            if(this.url == '') {
             this.router.navigate(['/']);
           } else {
             this.events.publish(this.topic);
             this.router.navigate([this.url]);
           }
           this.authGuard.getSessionData();
           this.authGuard.setAuthority();
      
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
  
  redirect() {
    this.router.navigate(['/']);
  }
}
