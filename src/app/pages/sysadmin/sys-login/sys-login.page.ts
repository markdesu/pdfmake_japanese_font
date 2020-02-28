import { Component, OnInit } from '@angular/core';
import { AuthguardService } from '../../../services/authguard.service';
import { ActivatedRoute, Router } from '../../../../../node_modules/@angular/router';
import { SystemguardService } from '../../../services/systemguard.service';

var sha1 = require('sha1');
var CryptoJS = require("crypto-js");
var md5 = require('md5');

@Component({
  selector: 'app-sys-login',
  templateUrl: './sys-login.page.html',
  styleUrls: ['./sys-login.page.scss'],
})
export class SysLoginPage implements OnInit {

  constructor(private authGuard : AuthguardService, public route: ActivatedRoute, public router: Router, private systemGuard : SystemguardService)  { }

  username    : string = '';
  password    : string = '';
  loginStatus : string = '';
  

  
  ngOnInit() {
  }
  
  ionViewWillEnter() {
    if(this.authGuard.isLoggedIn()){
      this.router.navigate(['/']);
    }
  }
  
  loginUser() {

    const user_level = '7';
    // const hash_pass =this.password;
    const hash_pass = md5(this.password);

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

           this.authGuard.getSessionData();
           this.authGuard.setAuthority();
            // this.systemGuard.setMenuItems();
            this.router.navigate(['/']);
        } else {
          //Invalid Username and Password
            this.loginStatus = 'ログイン ID またはパスワードが違います / ユーザーが管理者ではありません';
          
        }
      }    
    });

  //  console.log(this.authGuard.vendor_code ); 

  }
  
}
