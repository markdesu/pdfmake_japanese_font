import { Component, OnInit } from '@angular/core';
import { AuthguardService } from '../../services/authguard.service';
import { Router } from '../../../../node_modules/@angular/router';
import { WeighingService } from '../../services/weighing.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})

export class DashboardPage implements OnInit {

  constructor(public authGuard: AuthguardService, 
              private router : Router,
              private weighing_API: WeighingService) { }
  
  quicklinks = [];
  
  qr_lbl = '伝票QRをスキャンします。';
  ins_lbl = '完了した検査。';
  report_lbl = '集計レポート。';  
  users_lbl = '会社のユーザーを管理します。';
  setting_lbl = 'パスワードを変更する。';
  vehicle_lbl = '検査のための着信車両。';
  current_user = '';
  current_provider = '';
  incoming = '';
  completed = '';
  socket;
  
  ngOnInit() {

  }

  ionViewWillEnter() {
    if((this.current_user == this.authGuard.user_id) && (this.current_provider == this.authGuard.provider_prefix)) {
      return;
    }
    
    this.quicklinks = [];
    let arr = this.authGuard.authorized_items;
    
    arr.forEach(x => {
      if(x.icon != 'apps'){
          var lbl = '';
          switch(x.icon) {
            case  'qr-scanner':
              lbl = this.qr_lbl;
            break;
            case  'list-box':
              lbl = this.report_lbl;
            break;
            case  'paper':
              lbl = this.ins_lbl;
            break;
            case  'people':
              lbl = this.users_lbl;
            break;
            case  'settings':
              lbl = this.setting_lbl;
            break;
            case  'bus':
            lbl = this.vehicle_lbl;
          break;
          }
        x['desc']= lbl;
        x['path']= '/assets/img/dash_img/' + x.icon + '.png'
        this.quicklinks.push(x);
      }
    });
  }
  
  ionViewDidEnter() {
    if(this.authGuard.user_id) {   
      if(this.authGuard.user_type === 'inspector' || this.authGuard.is_inspector) {
        this.getCounts(this.authGuard.user_id, this.authGuard.provider_id);
      }
    }  
  }

  changeRoute(url) {
    this.router.navigate([url]);
  }
  
  getCounts(inspector, provider){
    this.weighing_API.getDashbordCounter(inspector,provider).subscribe(res => {
      if(res){
          if(res.status != '401') {
            if(res.data){
             this.incoming =  String(res.data[0].incoming);
             this.completed = String(res.data[0].completed);
          }else{
            this.authGuard.logout();
            this.router.navigate(['/login'], {queryParams : {url: '/dashboard'}});
          }
        }
      }
    });
  }
}

//  Comment Area Below .......................................................

// import * as io from "socket.io-client";

// private providerNS='provider' + this.authGuard.provider_id;
// private url = environment.api_address;
  
// ionViewWillLeave(){
//   this.socket.close();
// }

// this.socket = io.connect('http://localhost:3000/'+this.providerNS);
//     this.socket.on('inspected', function (data) {

//     // this.getCounts(this.authGuard.user_id, this.authGuard.provider_id);
//  });