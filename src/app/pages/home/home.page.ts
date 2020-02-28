import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthguardService } from '../../services/authguard.service';
import { MenuController } from '../../../../node_modules/@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor( public route: ActivatedRoute, private router: Router, public authguard: AuthguardService, private menuCtrl: MenuController){
    // this.menuCtrl.enable(false);
    // this.menuCtrl.enable(false);
  }
 
  ionViewDidEnter() {
    // this.menuCtrl.enable(false);
 
  }

  // public menuCtrl: MenuController
  ngOnInit(){
    // console.log('asd');
  }
}
