import { Component, OnInit } from '@angular/core';
import { ManagementService } from '../../services/management.service';
import { AlertController } from '../../../../node_modules/@ionic/angular';
import { Router } from '../../../../node_modules/@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-reissue-password',
  templateUrl: './reissue-password.page.html',
  styleUrls: ['./reissue-password.page.scss'],
})
export class ReissuePasswordPage implements OnInit {

  constructor(private management_API: ManagementService,     
              private alertController : AlertController, 
              private router : Router,
              private platform: Platform) { }
              
  backURL = '/login';
  email;
  MobileBrowser = false;
  
  ngOnInit() {
    this.MobileBrowser = this.isMobileBrowser();
  }
    
  isMobileBrowser() {  
    // is this web-browser on mobile device
    return this.platform.is('mobileweb');
  }
  
  send() {
    var user_data = {};
    user_data['email'] = this.email;
    
    this.management_API.reissuePassword(user_data).subscribe(res => {
      if(res) {
        if(res.status == '204') {   
          this.presentAlertOK('誤差','メールが見つかりません。', 'alertDanger' , 'create');// Error: Login ID already in use.'
          return;
        }
        if(res.status == '200') {
          this.presentAlertOK('成功','パスワードが再発行されました。メールを確認してください。', 'alertSuccess', 'create');
          this.router.navigate(['/login']);
          this.email = '';
          return;      
        }           
      }
    });
  }

  
  async presentAlertOK(title, message, cssclass, type) {
    var  choice = false;
    const alert = await this.alertController.create({
      header: title,
      message: 'メッセージ:' +message,  //warning message
      buttons: [
        {
          text: '確認',
          role: 'cancel',
          handler: () => {
            choice = false;
          }
        }
      ],
      cssClass: cssclass,
    });

    await alert.present();
    await alert.onDidDismiss();
    
    return choice;
  }
}
