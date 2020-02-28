import { Component, OnInit } from '@angular/core';
import { WeighingService } from '../../../services/weighing.service';
import { Router } from '@angular/router';
import { AuthguardService } from '../../../services/authguard.service';
import { NavController } from '@ionic/angular';
import { Events }  from '@ionic/angular';
 

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage  {

  constructor(private weighingAPI : WeighingService, private router : Router, private authGuard : AuthguardService,private nav : NavController, public events: Events) { 
    
    this.nav = nav
      
    events.subscribe('/vehicles', () => {
 
      this.getVechiles();
    });
  }

  vehiclesList = [];
  lblstatus = '';
  
  ngOnInit() {
    this.getVechiles();
  }
  
  ngOnDestroy(): void {
    this.events.unsubscribe('/vehicles');
  }
  
  
  getVechiles(){
    // var provider_id = localStorage.getItem('provider_id');
    var provider_id = this.authGuard.provider_id;
    if(provider_id){
      this.weighingAPI.getIncVehicles(provider_id).subscribe(res =>{
        if(res){
            if(res.status != '401'){
              if (res.data.length > 0) {
                this.vehiclesList = res.data;
                this.formatTime();
                this.lblstatus = 'これらは、検査用の着信車両のリストです。';
              }else{
                this.lblstatus = '差し迫った車両なし';
              }
            }else{
              this.authGuard.logout();
              this.router.navigate(['/login'], {queryParams : {url: '/vehicles', topic: '/vehicles'}});
            }
        }
      });
    }
  }
  
  formatTime(){
    for (let index = 0; index < this.vehiclesList.length; index++) {
     var x = this.vehiclesList[index].gross_time.toString();
     if( x.length == 4){
       var tempstring = this.vehiclesList[index]['gross_time'].toString();
      this.vehiclesList[index]['gross_time'] = tempstring.substring(0,2) + ':' + tempstring.substring(2,4); 
     }
     if( x.length == 3){
      var tempstring = this.vehiclesList[index]['gross_time'].toString();
     this.vehiclesList[index]['gross_time'] = '0' + tempstring.substring(0,1) + ':' + tempstring.substring(1,3); 
    } 
     
    }
  }

}
