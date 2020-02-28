import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { WeighingService } from '../../../services/weighing.service';
import { Router,NavigationEnd } from '@angular/router';
import { AuthguardService } from '../../../services/authguard.service';

import { Events }  from '@ionic/angular';
 
@Component({
  selector: 'app-weighing',
  templateUrl: './weighing.page.html',
  styleUrls: ['./weighing.page.scss']
  
})

export class WeighingPage implements OnInit {

  constructor(private weighingAPI : WeighingService, private router : Router, private authGuard: AuthguardService, public events: Events, private ref : ChangeDetectorRef) { 
    
    events.subscribe('/weighing', () => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      this.execGetVendor();
    });
  
  }
  
  lblWarning = '';
  
  fdate : any;
  tdate : any;
  selectedVendor : any;
  selectedShip : any;
  selectedSubvendor :any ;
  provider_id : any;
  ship_trader : any;
  selectedReportType: any = "1";
  ledger_type = 'x';
  
  vendors = [];
  shipsvendor = [];
  subvendors = [];
  value : any;
  hide_ledger = true;
  hide_ship = false;
  
  
  reportType = [{"name":"管理用船別集計","prefix":"shipreport","code":"1"},
                {"name":"管理用実績集計","prefix":"totalreport","code":"2"},
                {"name":"管理用元帳","prefix":"ledgerreport","code":"3"}]
  
                  
  
  ionViewDidEnter() {
    this.provider_id = this.authGuard.provider_id;
    this.execGetVendor();
  }
  ngOnInit() {
    // this.execGetVendor();
  }

  ngOnDestroy(): void {
    this.events.unsubscribe('/weighing');
  }
  
  execGetVendor() {
    if(this.authGuard.user_type ==='admin'){
      if(this.authGuard.isAuthenticated && this.vendors.length == 0){  
        // this.provider_id = localStorage.getItem('provider_id');
        this.getVendors(this.provider_id);
      
     
      }
    }
    
    
  }
  
  reportTypeChange() {
      if(this.selectedReportType == '1'){
        this.hide_ledger = true;
        this.hide_ship = false;
      }
      if(this.selectedReportType == '2'){
        this.hide_ledger = true;
        this.hide_ship = false;
      }
      if(this.selectedReportType == '3'){
        this.hide_ledger = false;
        this.hide_ship = true;
      }
  }
  
  
  getVendors(provider_id) {
    
    this.weighingAPI.getVendors(provider_id).subscribe(res => {
      if(res){

        if(res.status =='401'){
          this.authGuard.logout();
          this.router.navigate(['/login'], {queryParams : {url: '/weighing', topic: '/weighing'}});
          
          }else{
            if(res.data.length > 0){
              this.vendors = res.data; 
          }
        }
      }
    }); 
  }
  

  vendorChange() {
    if(this.selectedVendor){      
      if(this.selectedReportType == '3'){    
        this.getRelatedSubvendor(this.provider_id,this.selectedVendor);         
      }else{
        this.shipsvendor = [{}];  
        this.getShipsVendor(this.provider_id,this.selectedVendor);
      }       
    }      
  }
  
  shipChange() {
    if(this.selectedShip){
      this.weighingAPI.checkShipTrader(this.selectedShip, this.selectedVendor , this.provider_id).subscribe(res => {
          if(res){
            if(res.status != '401'){
              if(res.data == '1'){
                this.ship_trader = '1';
              }else{
                this.ship_trader = '';
              }
            }          
          }
      }); 
    }
  }
  
  getShipsVendor(provider_id,vendor_code) {
    
    var fdate ;
    var tdate ;
    
    if(this.fdate){
        fdate =   this.formatDate(this.fdate)
    }else{
        fdate =  this.formatterDBDate(new Date());
    }
    
    if(this.tdate){
        tdate = this.formatDate(this.tdate)
    }else{
        tdate = this.formatterDBDate(new Date());
    }
    

    this.weighingAPI.getShipVendors(provider_id,vendor_code, fdate, tdate).subscribe(res =>{
      if(res){
        if(res.status !='401'){
          if(res.data.length > 0){     
            this.shipsvendor = res.data; 
            this.selectedShip = res.data[0]['ship_code'];
            //console.log(this.selectedShip);
          }
        
        }else{
          this.authGuard.logout();
          this.router.navigate(['/login'], {queryParams : {url: '/weighing', topic: '/weighing'}});
        }       
      }
    });
  }
  
  getRelatedSubvendor(provider_id,vendor_code) {
    var fdate ;
    var tdate ;
    
    if(this.fdate){
        fdate =   this.formatDate(this.fdate)
    }else{
        fdate =  this.formatterDBDate(new Date());
    }
    
    if(this.tdate){
      tdate = this.formatDate(this.tdate)
    }else{
      tdate = this.formatterDBDate(new Date());
    }
    
    this.weighingAPI.getRelatedSubvendors(provider_id,vendor_code, fdate, tdate).subscribe(res =>{
      if(res){
        if(res.status !='401'){
          if(res.data.length > 0){     
            var obj = {"subvendor_code": 999999999, "subvendor_name": "全て"};       
            this.subvendors = res.data;
            this.subvendors.splice(0,0, obj);
          }
        
        }else{
          this.authGuard.logout();
          this.router.navigate(['/login'], {queryParams : {url: '/weighing', topic: '/weighing'}});
        }       
      }
    });
  }
  
  search() {
    if(this.selectedReportType == '1') {

        if(this.provider_id && this.selectedVendor && this.selectedShip && this.fdate && this.tdate){

          var vendorName = this.vendors.find(x => x.vendor_code == this.selectedVendor).vendor_name;
          var shipName = this.shipsvendor.find(x => x.ship_code == this.selectedShip).ship_name;
          var fdate = this.formatDate(this.fdate);
          var tdate = this.formatDate(this.tdate);
          
              this.router.navigate(['/report-ship'], {queryParams : {
                                                  provider_id: this.provider_id , 
                                                  vendor_code:this.selectedVendor, 
                                                  vendor_name: vendorName,
                                                  ship_code: this.selectedShip, 
                                                  ship_name: shipName,
                                                  from_date: fdate, 
                                                  to_date: tdate,
                                                  ship_trader: this.ship_trader}});
        }
    }
    
    if(this.selectedReportType == '2') {
      
        if(this.provider_id && this.selectedVendor && this.selectedShip && this.fdate && this.tdate){

          var vendorName = this.vendors.find(x => x.vendor_code == this.selectedVendor).vendor_name;
          var shipName = this.shipsvendor.find(x => x.ship_code == this.selectedShip).ship_name;
          var fdate = this.formatDate(this.fdate);
          var tdate = this.formatDate(this.tdate);
          
            this.router.navigate(['/totalresult'], {queryParams : {
                                                  provider_id: this.provider_id , 
                                                  vendor_code:this.selectedVendor, 
                                                  vendor_name: vendorName,
                                                  ship_code: this.selectedShip, 
                                                  ship_name: shipName,
                                                  from_date: fdate, 
                                                  to_date: tdate,
                                                  ship_trader: this.ship_trader}});
        }   
    }   
    
    if(this.selectedReportType == '3') {
      
      if(this.provider_id && this.selectedVendor && this.selectedSubvendor && this.fdate && this.tdate){

        var vendorName = this.vendors.find(x => x.vendor_code == this.selectedVendor).vendor_name;
        var subvendorName = this.subvendors.find(x => x.subvendor_code == this.selectedSubvendor).subvendor_name;
        var fdate = this.formatDate(this.fdate);
        var tdate = this.formatDate(this.tdate);
        
            this.router.navigate(['/report-ledger'], {queryParams : {
                                                provider_id: this.provider_id , 
                                                vendor_code:this.selectedVendor, 
                                                vendor_name: vendorName,
                                                subvendor_code: this.selectedSubvendor, 
                                                subvendor_name: subvendorName,
                                                from_date: fdate, 
                                                to_date: tdate,
                                                ledger_type: this.ledger_type}});
      }   
    }  
  }
  
  
  formatDate(selDate : string) {
    selDate = selDate.substring(0,10);
    selDate = selDate.replace(/-/g,'');
    return selDate;
  }
  
  formatterDBDate(selected_date: Date) {
    var day = selected_date.getDate().toString();
    var month = (selected_date.getMonth() + 1).toString();
    var year = selected_date.getFullYear().toString();
    (day.length == 1) && (day = '0' + day);
    (month.length == 1) && (month = '0' + month);
  
    var formatted_date= year +'' + month+''+day;
  
    return formatted_date;
  }
  

}
