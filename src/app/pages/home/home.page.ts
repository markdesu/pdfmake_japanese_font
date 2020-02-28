import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthguardService } from '../../services/authguard.service';
// import { MenuController } from '../../../../node_modules/@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor( public route: ActivatedRoute, public authguard: AuthguardService){
  }

  ngOnInit(){
  }
}
