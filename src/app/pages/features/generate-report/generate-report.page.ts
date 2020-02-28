import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { WeighingService } from '../../../services/weighing.service';
import { Router,NavigationEnd } from '@angular/router';
import { AuthguardService } from '../../../services/authguard.service';

import { Events }  from '@ionic/angular';

import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';



export interface vendor_model {
  id: string;
  provider_id: string;
  vendor_code: string;
  vendor_name: string;
}

export interface User {
  name: string;
}

@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.page.html',
  styleUrls: ['./generate-report.page.scss'],
})
export class GenerateReportPage implements OnInit {

  constructor(private weighingAPI : WeighingService, private router : Router, private authGuard: AuthguardService, public events: Events, private ref : ChangeDetectorRef) { 
 
  
  }
  vendorCtrl = new FormControl();
  filteredVendor: Observable<vendor_model[]>;
  
  
  lblWarning = '';
  
  fdate;     
  tdate     
  selectedVendor;
  selectedShip;
  selectedPerShipMulti;
  selectedPerShip;
  selectedShipVendor;
  selectedSubvendor;
  
  provider_id;  
  ship_trader;
  selectedReportType: any = "1";
  ledger_type = 'x';
  customer_type;
  
  vendors     = [];
  shipsvendor = [];
  pershipvendors = [];
  subvendors  = [];
  ships = [];
  value;
  aggregate_type = 'summary';
  
  // Parameter View Conditions
  hide_ledger = true;
  hide_ship   = false;
  hide_vendor = false;
  
  hide_pership = true;
  hide_pershipvendor = true;
  
  vendor_auto: vendor_model[] = [];
  
  // Assign Availbable Reports//////////
  
  authorized_reports = [];
  current_user = '';
  
  provider_report  = [{"name":"管理用船別集計" , "prefix":"admin shipreport"  , "code":"1"},
                      {"name":"船別の集計"    , "prefix":"ship total report" , "code":"8"},
                      {"name":"管理用実績集計" , "prefix":"admin totalreport" , "code":"2"},
                      {"name":"管理用元帳"    , "prefix":"admin ledgerreport", "code":"3"}];
                     
                
  customer_report1 = [{"name":"船別集計データ" , "prefix":"shipreport"  ,  "code":"4"},
                      {"name":"実績集計データ" , "prefix":"totalreport" ,  "code":"5"},
                      {"name":"計量元帳"      , "prefix":"ledgerreport",  "code":"6"}];
                  
  customer_report2 = [{"name":"計量元帳"      , "prefix":"ledgerreport",  "code":"7"}];
                    

  private _filterVendor(value: string): vendor_model[] {
    const filterValue = value.toLowerCase();

    return this.vendor_auto.filter(vendor => vendor.vendor_name.toLowerCase().indexOf(filterValue) === 0);
  }
  
  private _filter(value: string): vendor_model[] {
    const filterValue = value.toLowerCase();

    return this.vendor_auto.filter(option => option.vendor_name.toLowerCase().indexOf(filterValue) === 0);
  }
  ngOnInit() {
    this.fdate = new Date().toISOString();
    this.tdate = new Date().toISOString();
    // this.execGetVendor();
  }

  ionViewDidEnter() {
    this.provider_id = this.authGuard.provider_id;
    this.customer_type = this.authGuard.customer_type;
    this.authorizeReport();
    
  }
  
  execGetVendor() {
    if(this.authGuard.user_type ==='normal_user'){
      if(this.authGuard.isAuthenticated && this.vendors.length == 0){  
        this.getVendors(this.provider_id);
      }
    }     
  }
  
  authorizeReport() {
    //Provider Report
    if(this.current_user == this.authGuard.user_id){
      return;
    }
    
    this.current_user = this.authGuard.user_id;
    this.authorized_reports = [];
    
    if(this.customer_type === 1){
        this.authorized_reports = this.provider_report;
        this.selectedReportType = "1";
        this.execGetVendor();
      
    }
    
    if(this.customer_type === 2){

      this.authorized_reports = this.customer_report1;
      this.selectedVendor = this.authGuard.vendor_code;
      this.selectedReportType = "4";
      this.execGetVendor();
    }
    
    if(this.customer_type === 3){
      this.authorized_reports = this.customer_report2;
      this.selectedSubvendor = this.authGuard.subvendor_code;
      this.selectedReportType = "7";
    
    }

    this.reportTypeChange();
  }
    
  reportTypeChange() {
    
    switch (this.selectedReportType) {
      case '1':
      case '2':
          this.hideAll();
          this.hide_vendor = false;
          this.hide_ship   = false;
          break;
        
      case '3':
          this.hideAll();
          this.hide_vendor = false;
          this.hide_ledger = false;
         
          break;
      
      case '4':
      case '5':
          this.hideAll();
          this.hide_ship   = false;
          
          break;
      
      case '6':
          this.hideAll();
          this.hide_ledger = false;
        
          break;
        
      case '7':
          this.hideAll();
          break;   
      case '8':
          this.hideAll();
          this.hide_pership = false;
          break;
    }
    
    // this.vendorChange();
    this.dateChange();
  }
  
  hideAll() {
    this.hide_vendor = true;
    this.hide_ledger = true;
    this.hide_ship   = true;
    this.hide_pership = true;
  }
  
  getVendors(provider_id) {
    
    this.weighingAPI.getVendors(provider_id).subscribe(res => {
      if(res){

        if(res.status =='401'){
          this.removeSelected();
          this.authGuard.logout();
          this.router.navigate(['/login'], {queryParams : {url: '/generate-report', topic: '/generate-report'}});
          
          }else{
            if(res.data.length > 0){
              this.vendors = res.data; 
          }
        }
      }
    }); 
  }

    
  dateChange() {
    var report_type = this.selectedReportType;
    switch(report_type){
          case '3':
                this.getRelatedSubvendor(this.provider_id,this.selectedVendor);          
                break;
                
          // case '8':
          //       this.getAllShips(this.provider_id);
          //       break;
                
          default:
            this.shipsvendor = [{}]; 
            this.getShipsVendor(this.provider_id,this.selectedVendor);
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
              } else{
                this.removeSelected();
              }       
            }
        }); 
      }
  }
  
  // Vendors of the ship selected
  getPerShipVendors() {
    // console.log(this.provider_id + ' ' + this.selectedPerShip)
    if(this.hide_pershipvendor){
      
    }
    this.weighingAPI.getPerShipVendors(this.provider_id,this.selectedPerShipMulti).toPromise().then(res => {
        if(res){
          if(res.status !='401'){
            console.log(res.data);
            if(res.data.length > 0){     
              this.pershipvendors = res.data; 
              this.selectedShipVendor = res.data[0]['vendor_code'];
            }       
          }else{
            this.removeSelected();
            this.authGuard.logout();
            this.router.navigate(['/login'], {queryParams : {url: '/generate-report', topic: '/generate-report'}});
          }       
        }
    });
  } 
  
  async getAllShips(provider_id) {
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
    
    await this.weighingAPI.getAllShips(provider_id, fdate, tdate).toPromise().then(res =>{
       
      
       
       if(res){
        if(res.status !='401'){
          if(res.data.length > 0){     
            this.ships = res.data;
          }       
        }else{
          this.removeSelected();
          this.authGuard.logout();
          this.router.navigate(['/login'], {queryParams : {url: '/generate-report', topic: '/generate-report'}});
        }       
      }
    });

  }
   
  getShipsVendor(provider_id,vendor_code) {
    
    var fdate ;
    var tdate ;
    
    if(!vendor_code){
      return;
    }
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
          }       
        }else{
          this.removeSelected();
          this.authGuard.logout();
          this.router.navigate(['/login'], {queryParams : {url: '/generate-report', topic: '/generate-report'}});
        }       
      }
    });
  }
  
  getRelatedSubvendor(provider_id,vendor_code) {
    var fdate ;
    var tdate ;
    
    if(!vendor_code){
      return;
    }
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
          this.removeSelected();
          this.authGuard.logout();
          this.router.navigate(['/login'], {queryParams : {url: '/generate-report', topic: '/generate-report'}});
        }       
      }
    });
  }
  
  search() {
    
    switch (this.selectedReportType) {
      case '1':
      case '4':
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
          break;

      case '2':
      case '5':
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
          
          break;
              
      case '3':   
      case '6':
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
        
          break;
        
      case '7':
         
          break;   
      case '8':
            
            var shipName = this.shipsvendor.find(x => x.ship_code == this.selectedShip).ship_name;
            var vendorName = this.vendors.find(x => x.vendor_code == this.selectedVendor).vendor_name;
            var fdate = this.formatDate(this.fdate);
            var tdate = this.formatDate(this.tdate);
            
            if(this.aggregate_type == 'list') {
              if(this.provider_id && this.selectedVendor && this.selectedPerShip && this.fdate && this.tdate) {
                // this.router.navigate(['/report-shipaggregatelist'], {queryParams : {
                //                                     provider_id: this.provider_id , 
                //                                     vendor_code: this.selectedVendor, 
                //                                     vendor_name: vendorName,
                //                                     ship_code: this.selectedPerShip, 
                //                                     ship_name: shipName,
                //                                     from_date: fdate, 
                //                                     to_date: tdate}});
                this.router.navigate(['/totalresult'], {queryParams : {
                                                        provider_id: this.provider_id , 
                                                        vendor_code:this.selectedVendor, 
                                                        vendor_name: vendorName,
                                                        ship_code: this.selectedPerShip, 
                                                        ship_name: shipName,
                                                        from_date: fdate, 
                                                        to_date: tdate,
                                                        ship_trader: this.ship_trader}});
              }  
            } else {
              if(this.provider_id && this.selectedVendor && this.selectedPerShipMulti && this.fdate && this.tdate) {
                this.router.navigate(['/report-shipaggregate'], {queryParams : {
                                                    provider_id: this.provider_id , 
                                                    vendor_code: this.selectedVendor, 
                                                    vendor_name: vendorName,
                                                    ship_code: this.selectedPerShipMulti, 
                                                    ship_name: shipName,
                                                    from_date: fdate, 
                                                    to_date: tdate}});
              }
            }
          break;
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
  
  removeSelected() {
    this.selectedVendor = null;
    this.selectedShip = null;
    this.selectedSubvendor = null;
  }

  radioChange(val){   
    this.aggregate_type =  val.detail.value;
  }
}





// comment area below ///////////////////////////////////////////////////////

      
// 集計表  
// 明細表

// vendorChange() {
//   if(this.selectedVendor){ 
//     if(this.selectedReportType == '3'){        
//       this.getRelatedSubvendor(this.provider_id,this.selectedVendor);          
//     }else{
//       this.shipsvendor = [{}]; 
//       this.getShipsVendor(this.provider_id,this.selectedVendor);
//     }      
//   }           
// }
   
// this.filteredVendor = this.vendorCtrl.valueChanges
// .pipe(
//   startWith(''),
//   map(value => this._filter(value))
// );

//    this.filteredVendor = this.vendorCtrl.valueChanges
// .pipe(
//   startWith(''),
//   map(state => state ? this._filterVendor(state) : this.vendor_auto.slice())
// );
//  if(this.selectedVendor || this.selectedSubvendor || this.selectedShip || (this.current_user == this.authGuard.user_id)){