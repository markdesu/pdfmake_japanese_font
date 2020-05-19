import { Component, OnInit } from '@angular/core';
import { ManagementService } from '../../../services/management.service';
import { MatDialogConfig, MatDialog } from '../../../../../node_modules/@angular/material';
import { CreateCustomerComponent } from '../../../modals/create-customer/create-customer.component';
import { EditCustomerComponent } from '../../../modals/edit-customer/edit-customer.component';
import { AlertController } from '../../../../../node_modules/@ionic/angular';
import { Router } from '../../../../../node_modules/@angular/router';
import { AuthguardService } from '../../../services/authguard.service';

@Component({
  selector: 'app-mng-company',
  templateUrl: './mng-company.page.html',
  styleUrls: ['./mng-company.page.scss'],
})
export class MngCompanyPage implements OnInit {

  constructor(private management_API: ManagementService, 
              private Dialog: MatDialog, 
              private alertController : AlertController, 
              private router: Router,
              private authGuard: AuthguardService) { }
  
  displayedColumns: string[] = ['company_name','street_address','phone', 'fax', 'remarks','action'];
  dataSource = [];
  selectedRowID;
  
  ngOnInit() {
 
  }
  
  ionViewDidEnter() {
    this.getCustomers();
  }
  
  getCustomers() {
    this.management_API.getCustomers().subscribe(res => {
      if(res) {
        if(res.status == '401') {
            this.RequestAuth();
            return;
        }
        if(res.data) {
          this.dataSource = res.data;
        }
      }   
    }); 
  }
  
  showCreateDailog() {
    const dialogConfig = new MatDialogConfig();
    //dialogConfig.disableClose = true;
    dialogConfig.minWidth = '400px';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.maxHeight = '600px';
    dialogConfig.panelClass = 'myapp-no-padding-dialog';
    dialogConfig.autoFocus = false;
    dialogConfig.data = {ins_mng: true};
    var dailogref = this.Dialog.open(CreateCustomerComponent,dialogConfig);

    dailogref.afterClosed().subscribe(res => {   
        if(res) {
            if(res.action === 1) {
              this.createCustomer(res);
            }
        }    
    });
  }
  
  showEditDailog(c_info) {
   
    const dialogConfig = new MatDialogConfig();
    //dialogConfig.disableClose = true;
      dialogConfig.minWidth = '400px';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.autoFocus = false;
      dialogConfig.panelClass = 'myapp-no-padding-dialog';
      
      dialogConfig.data = {id: c_info.id,
                            name:    c_info.name,
                            address: c_info.address,
                            phone:   c_info.phone,
                            fax:     c_info.fax,
                            remark:  c_info.remark,
                            action: 0};
                            
      var dailogref = this.Dialog.open(EditCustomerComponent,dialogConfig);
    
      dailogref.afterClosed().subscribe(res => {   
        if(res) {
          if(res.action === 1) {
            this.updateCustomer(res);
          }
        }    
      });
  }
  
  createCustomer(c_info) {
    this.management_API.createCustomer(c_info).subscribe(res => {
      if(res){
        if(res.status == '401') {
          this.RequestAuth();
          return;
        }
        if(res.status == '200') {
          this.presentAlertOK('成功','顧客の詳細が更新されました。', 'alertSuccess');
          this.getCustomers();
        }
      }   
    });
  }
  
  updateCustomer(c_info) {
    this.management_API.updateCustomer(c_info).subscribe(res => {
      if(res){
        if(res.status == '401') {
          this.RequestAuth();
          return;
        }
        if(res.status == '200') {
          this.presentAlertOK('成功','顧客が追加されました。', 'alertSuccess');
          this.getCustomers();
        }
      }   
    });
  }
  
  deleteCustomer(customer_id) {
    this.presentAlertConfirm().then( res => {
      if(res) {
        this.management_API.deleteCustomer(customer_id).subscribe(res2 => {
          if(res2) {
            if(res2.status == '401') {
                this.RequestAuth();
                return;
            }
            if(res2.data) {
              if(res2.data['affectedRows']) {
                this.getCustomers();
              }
            }
          }      
        });
      }
    });
  }
  
  showContract(customer_id) {
    this.router.navigate(['/serviceadmin/mng-contracts'],  {queryParams : {customer_id: customer_id, url: '/mng-contracts'}} );
  }
  
  async presentAlertOK(title,message, cssclass) {
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
  
  async presentAlertConfirm() {
    var  choice = false;
    const alert = await this.alertController.create({
      header: '顧客の削除',
      message: '警告: この顧客の削除を続行しますか?',  //warning: proceed in deleting this user?
      buttons: [
        {
          text: '解約',
          role: 'cancel',
          handler: () => {
            choice = false;
          }
        }, {
          text: '確定',
          cssClass: 'alertDangerbtn',
          handler: () => {
             choice = true;
          }
        }
      ],
      cssClass: 'alertDanger'
    });

    await alert.present();
    await alert.onDidDismiss();
    
    return choice;
  }
 
  selectRow(row) {
    this.selectedRowID = row.id;
  }
  
  RequestAuth() {
    var currentURL = '/serviceadmin/mng-company';
    this.authGuard.logout();
    this.router.navigate(['/serviceadmin/index'], {queryParams : {url:currentURL}});
  }
 
}
