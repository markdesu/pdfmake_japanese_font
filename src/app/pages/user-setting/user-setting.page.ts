import { Component, OnInit } from '@angular/core';
import { ManagementService } from '../../services/management.service';
import { AlertController, Platform } from '../../../../node_modules/@ionic/angular';
import { AuthguardService } from '../../services/authguard.service';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.page.html',
  styleUrls: ['./user-setting.page.scss'],
})
export class UserSettingPage implements OnInit {

  input_type = 'password';
  old_pass;
  new_pass;
  new_pass_v;
  
  error_message = '';
  show_error = false;
  
  backURL = '/dashboard';
  MobileBrowser = false;
  
  
  constructor(private management_API : ManagementService,
              private alertController : AlertController,
              private authGuard : AuthguardService,
              private router : Router,
              private platform : Platform) { }

  ngOnInit() {
    this.MobileBrowser = this.isMobileBrowser();
  }
  
  isMobileBrowser() {  
    // is this web-browser on mobile device
    return this.platform.is('mobileweb');
  }
  
  onViewDidEnter() {
    this.input_type = 'password';
  }
  
  resetPass() {
    this.show_error = false;
    
    if(this.new_pass.replace(/ /g, '') == ''){
      this.new_pass = '';
      return;
    }
    
    if(this.new_pass != this.new_pass_v){
      this.show_error = true;
      this.error_message = '新しいパスワードが一致しませんでした。';
      return;
    }
    
    var data = {
      login_id : this.authGuard.username,
      password : this.old_pass,
      new_password : this.new_pass
    }
    
    this.management_API.resetPassword(data).subscribe(res => {
      if(res) {
        if(res.status == '401') {
          this.RequestAuth();
        }else{
          if(res.status == '200') {
            if(res.data == 1) {
              this.presentAlertOK('成功','パスワードが変更されました。', 'alertSuccess');
              this.clear();
            } else 
            if(res.data == 0) {
              this.error_message = '古いパスワードが正しくありません。';
              this.show_error = true;
            }
          }
        }
      }
    });
  }   
  
  RequestAuth() {
    var currentURL = '/user-setting';
    this.authGuard.logout();
    this.router.navigate(['/login'], {queryParams : {url:currentURL}});
  }
  
  showPassword() { 
    if(this.input_type == 'password') {
      this.input_type = 'text';
    } else { 
      this.input_type = 'password';
    }
  }
  
  async presentAlertOK(title, message, cssclass) {
    var  choice = false;
    const alert = await this.alertController.create({
      header: title,
      message: message,  //warning message
      buttons: [
        {
          text: '確認',
          role: 'cancel',
          handler: () => {
            choice = false;
          }
        }
      ],
      cssClass: cssclass
    });

    await alert.present();
    await alert.onDidDismiss();
    
    return choice;
  }

  clear() {
    this.old_pass = '';
    this.new_pass = '';
    this.new_pass_v = '';
  }

}
