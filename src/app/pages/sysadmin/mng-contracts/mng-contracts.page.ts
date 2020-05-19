import { Component, OnInit } from '@angular/core';
import { WeighingService } from '../../../services/weighing.service';
import { ManagementService } from '../../../services/management.service';
import { ActivatedRoute, Router } from '../../../../../node_modules/@angular/router';
import { AlertController } from '../../../../../node_modules/@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';

@Component({
  selector: 'app-mng-contracts',
  templateUrl: './mng-contracts.page.html',
  styleUrls: ['./mng-contracts.page.scss'],
})
export class MngContractsPage implements OnInit {

  backURL    = '/serviceadmin/mng-company';
  displayedColumns: string[] = ['provider_name','contract_type','vendor_code', 'subvendor_code', 'expires'];
  contract_type = [{name:'契約なし', value:'0'},
                   {name:'プロバイダ', value:'1'},
                   {name:'納入業者', value:'2'},
                   {name:'代納業者', value:'3'}];
  dataSource = [];  
  providers = [];
  customers = [];
  
  customer_id;
  sel_provider;
  sel_contract_type;
  vendor_code;
  subvendor_code;
  expires;
  
  disable_search = false;
  hide_change_form = true;
  
  constructor(private weighing_API : WeighingService, 
              private management_API : ManagementService, 
              private route: ActivatedRoute, 
              private alertController: AlertController,
              private router : Router,
              private authGuard : AuthguardService) { }

  ngOnInit() { 
  }

  ionViewDidEnter() {
    this.getProviders();
    this.getCustomers();
    this.getParams();
  }
  
  async getParams() {
     await  this.route.queryParams.subscribe(params => {
              if(params['customer_id']) {
                this.customer_id = params['customer_id']; 
              }       
            });
            if(this.customer_id) {
              this.getContract(this.customer_id);
            }    
  }
  
  getCustomers() {
    this.management_API.getCustomers().subscribe(res => {
      if(res) {
        if(res.status == '401') {
            this.RequestAuth();
            return;
        }
        if(res.data) {
          this.customers = res.data;
        }
      }   
    }); 
  }
  
  getProviders() {
    this.weighing_API.getProviders().subscribe(res => {
      if(res) {
        if(res.status == '401') {
            this.RequestAuth();
            return;
        }
        if(res.data) {
          this.providers = res.data;
          this.sel_provider = String(this.providers[0].id);
        }
      }   
    });
  }
  
  getContract(customer_id) {
    this.management_API.getContracts(customer_id).subscribe(res => {
      if(res) {
        if(res.status == '401') {
            this.RequestAuth();
            return;
        }
        if(res.data) {
          this.dataSource = res.data;
          this.disableSearchChange();
          this.setContractDetails();
        }
      }  
    });
  }
  
  setContractDetails() {
    var conract_arr = this.dataSource;
    this.sel_contract_type = '0';
    this.vendor_code       = '';
    this.subvendor_code    = '';
    this.expires           = '';
    
    conract_arr.forEach(x => {
      if(x.provider_id == this.sel_provider) {
          this.sel_contract_type = String(x.customer_type);
          this.vendor_code       = x.vendor_code;
          this.subvendor_code    = x.subvendor_code;
          this.expires           = x.expires;
      }
    });
  }
  
  execGetContract() {
    if(this.customer_id) {
      this.getContract(this.customer_id);
    }
  }
  
  execContractChange() {
    if(this.sel_contract_type == '0') {
      this.deleteContract();
    } else {
      this.updateContract();
    }
  }
  
  updateContract() {
    if(!this.sel_provider && !this.customer_id) {
      return;
    }
    var data = {
       provider_id : this.sel_provider,
       customer_id : this.customer_id,
       customer_type : this.sel_contract_type ,
       vendor_code :  this.vendor_code | 0,
       subvendor_code:  this.subvendor_code | 0,
       expires :  this.expires | 0
    }
    
    this.management_API.updateContract(data).subscribe(res =>{ 
      if(res) {
        if(res.status == '401') {
            this.RequestAuth();
            return;
        }
        if(res.data) {
          if(res.data['affectedRows'] > 0) {
            this.presentAlertOK('成功','契約が更新されました。', 'alertSuccess');
            this.getContract(this.customer_id);
          }
        }
      }  
    });
  }
  
  deleteContract() {
    if(!this.sel_provider && !this.customer_id){
      return;
    }
    
    this.management_API.deleteContract(this.sel_provider, this.customer_id).subscribe(res => {
      if(res) {
        if(res.status == '401') {
          this.RequestAuth();
          return;
        }
        if(res.data) {
          if(res.data['affectedRows'] > 0) {
            this.presentAlertOK('成功','契約が終了しました。', 'alertSuccess');
            this.getContract(this.customer_id);
          }
        }
      }  
    });
  }

  typeChange() {
    this.setContractDetails();
  }
  
  disableSearchChange() {
    this.disable_search = true;
  }
  
  enableSearch() {
    this.disable_search = false;
    this.hide_change_form = false;
    this.changeForm();
  }
  
  changeForm() {
    var divid = document.getElementById('change_form');
    if(this.hide_change_form){
      this.hide_change_form = false;
      divid.style.height = '100%';
    }else{
      this.hide_change_form = true;
      divid.style.height = '0px';
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
  
  RequestAuth() {
    var currentURL = '/serviceadmin/mng-contracts';
    this.authGuard.logout();
    this.router.navigate(['/serviceadmin/index'], {queryParams : {url:currentURL}});
  }
  
}
