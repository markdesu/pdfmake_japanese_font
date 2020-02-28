import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { WeighingService} from '../../../services/weighing.service';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { Events }  from '@ionic/angular';

import { NumpadComponent } from '../../../modals/numpad/numpad.component'
import {MatDialog, MatDialogConfig} from "@angular/material";

import { Directive, HostListener, ElementRef, Renderer } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-weighing-detail',
  templateUrl: './weighing-detail.page.html',
  styleUrls: ['./weighing-detail.page.scss'],
})

export class WeighingDetailPage  {

  constructor(private route : ActivatedRoute, private weighingAPI : WeighingService, private authGuard : AuthguardService, private router : Router,
    public loadingController: LoadingController,private alertController : AlertController, private nav : NavController,public events: Events,
    private dialog: MatDialog, private renderer: Renderer, private platform: Platform, private alertCtrl: AlertController
  
  
  ) { this.nav = nav

      // events.subscribe( 'shipmentdetails' , () => {
      //   this.getParams();
      // });
    }
    
    

  //Parameters
    weighingID = '';  
    providerID = '';
    accessID   = '';
    backURL    = '/qrscanner';
    
  //Weighing Fields
    title           = '計量の詳細';
    weighing_date   = '0000/00/00';
    car_no          = '------'; 
    company         = '------';
    weighing_no     = '------';
    providerPrefix  = '';
    total_weight    = '0 KG';
    weight2         = '0 KG';
    net_weight      = '0 KG';
    trade_weight    = '0 KG';
    reduced_percent = 0.0;
    reduced_weight  = 0.0;  
    wD_percent      = 0;
    td_weight       = 0;  
    inspector       = '';
    hatch_no        = "0"  ;
    remarks         = '';
    raw_date = '';
    
    stepID          = '';
    backID          = '';
    error_message   = '';
    save_status     = '';
    
    master_items = [];
    master_inspectors = [];
    inspector_code = '';
    wDetails = [
      {"grade":"1","percent":"","weight":"","items":"","item_code":"","editable":"","edited":"","id":""},
      {"grade":"2","percent":"","weight":"","items":"","item_code":"","editable":"","edited":"","id":""},
      {"grade":"3","percent":"","weight":"","items":"","item_code":"","editable":"","edited":"","id":""},
      {"grade":"4","percent":"","weight":"","items":"","item_code":"","editable":"","edited":"","id":""},
    ];
    
  //Display Controllers
    dis_btn_save = false;
    dis_btn_next = false;
    dis_btn_prev = false;
  
  //Hide Divs Controller
    Hid_main_content = false;
    Hid_div_error    = true;
    
   
    selectOptions = {header: 'header', subHeader: 'subheaders'};
    MobileBrowser = false;

    
     
  isMobileBrowser() {  
    // is this web-browser on mobile device
    return this.platform.is('mobileweb');
  }

  ionViewDidEnter() {
    this.MobileBrowser = this.isMobileBrowser();
    this.getParams();
  }
  
  ngOnInit() { 

  }
  
  ngOnDestroy(): void {
    this.events.unsubscribe('shipmentdetails');
  }
  
  getParams() {
    this.route.params.subscribe(params => {
        this.weighingID = '' + params['id']; 
        this.providerID = ''  + params['provider']; 
        this.accessID   = '' + params['access'];
    });
    
    this.route.queryParams.subscribe(qparams => {
        if(qparams.url) {
            this.backURL = qparams.url;
        }
    });

    this.checkAccess();
  }
  
  
  
  //Authentication and Check Parameters if Valid////////////////////////////////////////////////
  
  checkAccess() {
    this.checkWeighing(this.weighingID, this.providerID);
  }

  checkWeighing(weighingID,provider) {
       this.weighingAPI.checkWeighing_id(weighingID, provider)
      .subscribe(res => {   
        if(res.status != '401') {  
            if(res['data'] == 1) {
              this.validParameters();
            } else {
              this.invalidParams();
            }
        }
      });
  }
  
  validParameters() {
      this.getItems(this.providerID);
      this.getInspectors(this.providerID);
  }
  
  invalidParams() {
    //Redirect to error page if param are invalid or transaction not found.
    this.Hid_div_error = false;
    this.Hid_main_content = true;
  }
  
  
  
  
 
  //Retrieve Data///////////////////////////////////////////////////////////////////////////////
  
  getWeighing(id,provider_id) {
    this.setWDetails();
    this.weighingAPI.getWeighing(id,provider_id)
    .subscribe(res =>{
      if(res['status'] != 401){
          if(res['data'].length > 0){
          var data= res['data'][0];  
          
          // Format weighing Date to yyyy/mm/dd
          this.raw_date = data['weighing_date'];
          if(data['weighing_date']){
            this.weighing_date = this.formatDate(String(data['weighing_date']));
          }else{
            this.weighing_date = '';
          }
          this.weighingID      = data['weighingID'];
          this.providerPrefix  = data['prefix']         || '';
          this.car_no          = data['car_no']         || '';
          this.company         = data['vendor_name']    || '';
          this.total_weight    = data['gross_weight']   || '0';
          this.weight2         = data['tare_weight']    || '0';
          this.net_weight      = data['net_weight']     || '0';
          this.trade_weight    = data['weight']         || '0';
          this.reduced_percent = data['reduced_percent']|| '0';
          this.reduced_weight  = data['reduced_weight'] || '0';
          this.weighing_no     = data['weighing_no']    || '';
          this.td_weight       = data['weight']         || '0';
          this.inspector       = data['inspector']      || '';
          this.hatch_no        = String(data['hatch_no'])      || '0';
          this.remarks         = data['remarks']        || '';
          this.inspector_code  = String(data['inspector_code']) || '';
          // add KG label
          this.total_weight = this.total_weight + ' KG';
          this.weight2      = this.weight2 + ' KG';
          this.net_weight   = this.net_weight + ' KG';
          this.trade_weight = this.trade_weight + ' KG';
 
          this.getWDetails(this.weighingID);
        }
      }else{
          this.RequestAuth();
      }
    });
   
  }

  getWDetails(id) {
    this.weighingAPI.getWeighingDetails(id).subscribe(res => {
      this.dis_btn_save = false; 
      var total_dweight = 0;
      if(res){
          if(res.status !='401'){
              if(res['data'].length > 0){
                this.wD_percent = 0;
                var detail = [];
                    detail = res['data'];
              
                for (let i = 0; i < detail.length; i++) {
                  for (let x = 0; x < this.wDetails.length; x++) {
                    if(this.wDetails[x]['grade'] == detail[i]['line_no']){
                        this.wDetails[x]['percent'] = detail[i]['percent'];
                        this.wDetails[x]['weight'] = detail[i]['verified_weight'];
                        this.wDetails[x]['items'] = String(detail[i]['item_name']);
                        this.wDetails[x]['item_code'] = String(detail[i]['item_code']);
                        this.wD_percent = this.wD_percent + detail[i]['percent'];
                        this.wDetails[x]['editable'] = "1";
                        this.wDetails[x]['id'] = detail[i]['id'];
                        total_dweight = total_dweight +  detail[i]['verified_weight'];
                    }
                  }
                }  
        
                if(this.wD_percent == 100 || (total_dweight == +this.td_weight && total_dweight != 0)){
                  this.dis_btn_save = true;
                }else{
                  this.dis_btn_save = false;
                }
              }else{
                this.dis_btn_save = false;
              }    
          }else{
            this.RequestAuth();
          }       
      }
    });
  }
  
  getItems(provider) {
    this.weighingAPI.getItems(provider).subscribe(res =>{

      if(res){
        if(res.status != '401'){
            if(res['data'].length > 0){
              this.master_items = res['data'];
              
              ////Fetch Weighing Details
              this.presentLoading('first');
            }
        } else{
          this.RequestAuth();
        }                  
      }
    });

  }
    
  getInspectors(provider) {
    this.weighingAPI.getInspectors(provider).subscribe(res =>{

      if(res){
        if(res.status != '401'){
            if(res['data'].length > 0){
              this.master_inspectors = res['data'];
              
              ////Fetch Weighing Details
              this.presentLoading('first');
            }
        } else{
          this.RequestAuth();
        }                  
      }
    });

  }
  
  getNext(exec) {
    
    if(exec == 'first'){
      this.getWeighing(this.weighingID,this.providerID);
    }
    
    if(exec == 'next'){ 
      if(this.stepID != ''){
        this.weighingID = this.stepID;
        this.getWeighing(this.weighingID,this.providerID);     
      }
    }
    
    if(exec == 'prev'){
        if(this.backID != ''){
          this.weighingID = this.backID;
          this.getWeighing(this.weighingID,this.providerID);
        }
    }
 
    this.weighingAPI.getNextRecord(this.weighingID,this.providerID).subscribe(res => {
      if(res['status'] != 401){
        if(res['data'] != 0){
          this.stepID = res['data']['stepID'] || '';
          this.backID = res['data']['backID'] || '';
          
          if(!res['data']['stepID']){
            this.dis_btn_next = true;
          }else{
            this.dis_btn_next = false;
          }
          
          if(!res['data']['backID']){
            this.dis_btn_prev = true;
          }else{
            this.dis_btn_prev = false;
          }
            
        }
      }else{
        this.RequestAuth();
      }    
    });
  }
  
  //Unauthorize Actuib /////////////////////////////////////////////////////////////////////
  
  RequestAuth() {
    var user_class = this.authGuard.user_type;
    var currentURL = '/weighing-detail/'+ this.weighingID + '/'+ this.providerID +'/' + this.accessID;
    // console.log(this.authGuard.user_type);
    this.authGuard.logout();
 

    if(user_class == 'inspector') {
      this.router.navigate(['/inspection/login'], {queryParams : {url: '/weighing', topic: '/weighing'}});
    }else{
      this.router.navigate(['/login'], {queryParams : {url:currentURL, topic:'shipmentdetails'}});
    }
  }
  
  
  //Save Data///////////////////////////////////////////////////////////////////////////////
  
  validateInput() {
    var data = this.wDetails;
    var validinput = true;
  
    for (let index = 0; index < data.length; index++) {
      var x = +data[index]['percent'] | 0;
      var y = +data[index]['weight'] | 0;      
      var item = +data[index]['item_code'] | 0;
      
      if(x > 0 || y  > 0){      
        if(!item || item == null || item  == 0 ){
          validinput = false;     
        }
      }
    }
  
    return validinput;
    
  }
  
  doSave() {
    if(this.authGuard.user_type === 'inspector' || this.authGuard.is_inspector){
    
        var final = this.validateInput();
        // Return if invalid input provided.
        if(!final){
          // Invalid Input.
          this.save_status = '入力が無効';
          return;
        }else{
            this.presentAlertConfirm().then( res =>{
                if(res){
                  for (let index = 0; index < this.wDetails.length; index++) {
                      var Obj = {}; 
                      var item = this.wDetails[index]['item_code']  
                        if((this.wDetails[index]['id'])){
                            if(this.wDetails[index]['item_code'] == "null")
                            {
                              Obj['item_code'] = 0;
                            }else{
                              Obj['item_code'] = this.wDetails[index]['item_code'];
                            }
                      
                            Obj['percent'] = this.wDetails[index]['percent'] || 0;
                            Obj['verified_weight'] = this.wDetails[index]['weight'] || 0;
                            Obj['id'] = this.wDetails[index]['id'];
                            this.execUpdateWeighingDetails(Obj);
                        }
                        else if(this.wDetails[index]['item_code'] && this.wDetails[index]['item_code'] != '0'){
             
                          Obj['weighing_id'] = this.weighingID;
                          Obj['provider_id'] = this.providerID;
                          // Obj['weighing_date'] = this.weighingAPI.formatterDBDate(new Date);
                          Obj['weighing_date'] = this.raw_date;
                          Obj['weighing_no'] = this.weighing_no;
                          Obj['line_no'] = this.wDetails[index]['grade'];
                          Obj['item_code'] = this.wDetails[index]['item_code'];
                          Obj['percent'] = this.wDetails[index]['percent'] || 0;
                          Obj['verified_weight'] =  this.wDetails[index]['weight'] || 0;
                           this.execSave(Obj);
                          this.wDetails[index]['editable'] = '1';
                        }            
                  } 
                
                  var Obj2 = {}
                      Obj2['id'] = this.weighingID;
                      Obj2['reduced_percent'] = this.reduced_percent;
                      Obj2['hatch_no'] = this.hatch_no;
                      Obj2['remarks'] = this.remarks;
                      Obj2['inspector_code'] = +this.inspector_code;
                      Obj2['reduced_weight'] =  this.reduced_weight;
                      if(this.inspector == null|| this.inspector == ""){
                        var ins = this.master_inspectors.find(x => x.inspector_code == this.inspector_code);
                        if(ins){
                          Obj2['inspector'] = ins.inspector_name;
                          this.inspector = ins.inspector_name;
                        }else{
                          Obj2['inspector'] = "";
                        }
                      }else{
                        Obj2['inspector'] = this.inspector;
                      }           
                      this.execUpdateWeighing(Obj2);
                      
                      var Obj_inspection = {"inspector_id": this.authGuard.user_id , "weighing_id": this.weighingID}
                      // this.saveInspectionLog(Obj_inspection);
                }
            });
        }
    }else{
      this.save_status = '検査のために許可されていないユーザー';
    }
  }

  async execUpdateWeighing(Obj) {
  await  this.weighingAPI.updateWeighing(Obj).toPromise().then(res =>{
      if(res['data']['affectedRows'] > 0){
        // console.log('weighing updated successfully');
        this.presentAlert();
      }
    });
  }
  
  execUpdateWeighingDetails(Obj) {
    this.weighingAPI.updateWeighingDetails(Obj).subscribe(res =>{
      if(res['data']['affectedRows'] > 0){
        this.dis_btn_save = true;
        // this.presentAlert();
      }
    });
  }
  
  execSave(Obj) {    
    this.weighingAPI.createWDetails(Obj).subscribe(res => {
      if(res['data']['affectedRows'] > 0){
          this.getWDetails(this.weighingID);
          this.dis_btn_save = true;
      }
    });
    return;
  }
  
  saveInspectionLog(data) {
  
    this.weighingAPI.createInspectionLog(data).subscribe(res =>{
      console.log('Inspection Log Saved');
    });
  }

  
  //Static Functions//////////////////////////////////////////////////////////////////////////
  
 
  async presentLoading(next) {
    const loading = await this.loadingController.create({
      message: '載荷',
      duration: 10000,
    });          
    
    await loading.present();
    
    await this.getNext(next);
    
    loading.dismiss();
  }
  
  changeItems(provider) {
    this.getItems(provider);
  }
  
  percentChange(event) {

    this.save_status = '';
    var currentTotal = 0;
    var targetIndex = 0;
    var details = this.wDetails;
    //Get Target Index
    
    for (let index = 0; index < details.length; index++) {
      if(details[index]['grade'] == event){
        targetIndex = index;
      }
      currentTotal = currentTotal + (+details[index]['percent']); 
    }

    
    if(currentTotal > 100 || +this.wDetails[targetIndex]['percent'] < 0){
      this.wDetails[targetIndex]['percent'] = '';
      this.wDetails[targetIndex]['edited'] = '';
      // this.wDetails[targetIndex]['weight'] = '';
    }else{
      var percent = +this.wDetails[targetIndex]['percent'] ;
      var getWeight =  percent /  100;
      
      // this.wDetails[targetIndex]['weight'] = String(getWeight * this.td_weight );  
      this.wDetails[targetIndex]['edited'] = '1';
      this.wD_percent = currentTotal;
      
      //Set value to null if 0;
      // if(this.wDetails[targetIndex]['weight'] == '0'){
      //    this.wDetails[targetIndex]['weight'] = '';
      //    this.wDetails[targetIndex]['edited'] = '';
      // }
    }
  }
  
  itemChange(item) {
    this.save_status = '';

    if(!item.item_code || item.item_code == "null"){
      var x = item.grade - 1;
      this.wDetails[x]['percent'] = '';
      this.wDetails[x]['weight'] = '';
    }
  }
  
  setWDetails() {
    //Reset Values of wDetails
     this.wDetails.forEach(element => {
      element['percent'] = "";
      element['weight'] = "";
      element['items'] = "";
      element['item_code'] = "";
      element['editable'] = "";
     });
   
  }
   
  setReadOnly(str) {
    if(str || str != ''){
      return true;
    }else{
      return false;
    }
  }
  
  
  //Date Formatters//////////////////////////////////////////////////////////////////////////////
  
  formatDate(str) {
    var year =  str.substring(0,4);
    var month =  str.substring(4,6);
    var day =  str.substring(6,8);
    var date = year + '/' + month + '/' + day;
    return date;
  }

  showNumpad(pref,val,title) {

    // this.reduced_weight = this.reduced_weight + 1;
    const dialogConfig = new MatDialogConfig();
      // dialogConfig.disableClose = true;
      dialogConfig.maxWidth = '95%';
      dialogConfig.autoFocus = false;
      dialogConfig.data = {val:val,title:title}
      
    var dailogref = this.dialog.open(NumpadComponent,dialogConfig);
   
    dailogref.afterClosed().subscribe(res =>{
      if(res){
        this.assignNumpadData(pref,Number(res.data));
      } 
    });
  }
  
  assignNumpadData(pref,value) {
    if(pref == 'r_weight'){
      this.reduced_weight = value;
      return;
    }
    if(pref == 'r_percent'){
      this.reduced_percent = value;
      return;
    }
    if(pref == '1_per'){
     this.wDetails[0]['percent'] = value;
     this.percentChange('1');
      return;
    }
    if(pref == '1_kg'){
      this.wDetails[0]['weight'] = value;
      return;
    }
    if(pref == '2_per'){
      this.wDetails[1]['percent'] = value;
      this.percentChange('2');
       return;
     }
     if(pref == '2_kg'){
       this.wDetails[1]['weight'] = value;
       return;
     }
     if(pref == '3_per'){
      this.wDetails[2]['percent'] = value;
      this.percentChange('3');
       return;
     }
     if(pref == '3_kg'){
       this.wDetails[2]['weight'] = value;
       return;
     }
     if(pref == '4_per'){
      this.wDetails[3]['percent'] = value;
      this.percentChange('4');
       return;
     }
     if(pref == '4_kg'){
       this.wDetails[3]['weight'] = value;
       return;
     }
    
    
    
  }
  
  async presentAlertConfirm() {
    var  choice = false;
     const alert = await this.alertController.create({
       header: '検査の確認!',
       message: '<strong>この検査の詳細を保存しますか?</strong>',
       buttons: [
         {
           text: '解約',
           role: 'cancel',
           cssClass: 'secondary',
           handler: () => {
             choice = false;
           }
         }, {
           text: '確定',
           handler: () => {
 
              choice = true;
           }
         }
       ]
     });
 
     await alert.present();
     await alert.onDidDismiss();
     
     return choice;
  }
   
  async presentAlert() {
    const alert = await this.alertCtrl.create({
      header: '通知',
      subHeader: '成功',
      message: '検査の詳細が保存されました.',
      buttons: ['OK']
    });

    await alert.present();
  }
}



      
      // if((data[index]['item_code'] && data[index]['item_code'] != "null" ) && (+data[index]['percent'] == 0 && +data[index]['weight'] == 0)){
      //   validinput = false;      
      // }
        

   //  for (let index = 0; index < this.wDetails.length; index++) {
    //      this.wDetails[index]['percent'] = "";
    //      this.wDetails[index]['weight'] = "";
    //      this.wDetails[index]['items'] = "";
    //      this.wDetails[index]['item_code'] = "";
    //      this.wDetails[index]['editable'] = "";
    //  }