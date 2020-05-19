import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import item1 from '../../../model/item1.model';
import { ManagementService } from '../../../services/management.service';
import { MatDialog, MatDialogConfig } from '../../../../../node_modules/@angular/material';
import { CreateUserComponent } from '../../../modals/create-user/create-user.component';
import { EditUserComponent } from '../../../modals/edit-user/edit-user.component';
import { AlertController, Platform } from '../../../../../node_modules/@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { Router } from '../../../../../node_modules/@angular/router';

@Component({
  selector: 'app-mng-users',
  templateUrl: './mng-users.page.html',
  styleUrls: ['./mng-users.page.scss']
})

export class MngUsersPage implements OnInit {

  constructor(private management_API: ManagementService,
              private Dialog: MatDialog,  
              private alertController : AlertController, 
              private platform : Platform,
              private authGuard : AuthguardService,
              private router : Router) { }
  
  displayedColumns: string[] = ['username','name','email', 'is_admin', 'is_inspector', 'action'];
  dataSource = [];
  customer_list: item1[] = [];
  optionCtrl = new FormControl();
  filteredOption: Observable<any>;
  sel_customer = '';

  private customer_id;

  selectedRowID;
  selectedRow;
  MobileBrowser = false;

  isMobileBrowser() {  
    // is this web-browser on mobile device
    return this.platform.is('mobileweb'); 
  }
  
  ngOnInit() {
     this.MobileBrowser = this.isMobileBrowser();
  }
  

  ionViewDidEnter() {
    this.management_API.getCustomers().subscribe(res => {
      if(res) {
        if(res.status == '401') {
            this.RequestAuth();
            return;
        }
        if(res.data) {
          this.customer_list = res.data;
          this.filteredOption = this.optionCtrl.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterItem1(value))
          );   
        }
      }   
    }); 
  }
  
  execGetUSer() {
    for (let index = 0; index < this.customer_list.length; index++) {
      if(this.optionCtrl.value == this.customer_list[index].name) {
        this.customer_id = this.customer_list[index].id;
      }
    }
    
    if(!this.customer_id) {
      return;
    }
    this.getUsers(this.customer_id);
  }  
  
  getUsers(customer_id) {
    this.management_API.getCustomerUsers(customer_id).subscribe(res => {
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

  private _filterItem1(value: string): item1[] {
    const filterValue = value.toLowerCase();
    return this.customer_list.filter(item1 => item1.name.toLowerCase().includes(filterValue));
  }

  createUser(user_data) {
    var selected_customer_id;
    for (let index = 0; index < this.customer_list.length; index++) {
      if(this.optionCtrl.value == this.customer_list[index].name){
        selected_customer_id = this.customer_list[index].id;
      }
    }
    
    if(selected_customer_id) {
      user_data['customer_id']  = selected_customer_id;
      this.management_API.createUser(user_data).subscribe(res => {
        if(res){
          if(res.status == '401') {
              this.RequestAuth();
              return;
          }
          if(res.status == '204') {        
            this.presentAlertOK('誤差','ログイン ID は既に使用されています。', 'alertDanger');// Error: Login ID already in use.'
            return;
          }
          if(res.status == '200') {
            this.presentAlertOK('成功','ユーザーが作成されました。', 'alertSuccess');
            this.execGetUSer();
          }     
        }        
      });
    }else{
      this.presentAlertOK('誤差','会社 ID が見つかりません。', 'alertDanger'); //No Customer/Company Selected  or No customer ID.
      return;
    }
  }
    
  updateUser(user_data) {
    user_data['is_admin']     = this.setAuth(user_data.is_admin);
    user_data['is_inspector'] = this.setAuth(user_data.is_inspector);
    
    this.management_API.updateUser(user_data).subscribe(res=>{
      if(res){
        if(res.status == '401') {
          this.RequestAuth();
          return;
        }
        if(res.data) {
          if(res.data['affectedRows'] > 0) {
            this.execGetUSer();
            this.clearSelection();
          }
        }
      }    
    }); 
  }
  
  deleteUser() {
    if(!this.selectedRow) {
      return;
    }
    this.presentAlertConfirm().then( res => {
      if(res) {
        this.management_API.deleteUser(this.selectedRow.id).subscribe(res2 => {
          if(res2){
            if(res2.status == '401') {
                this.RequestAuth();
                return;
            }
            if(res2.data) {
              if(res2.data['affectedRows']) {
                this.execGetUSer();
                this.clearSelection();
              }
            }
          }       
        });
      }
    });
  }

  setAuth(val) {
    if(val) {
      return 1;
    }
      return 0;
  }

  selectRow(row) {
    this.selectedRowID = row.id;
    this.selectedRow = row;
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
    var dailogref = this.Dialog.open(CreateUserComponent,dialogConfig);

    dailogref.afterClosed().subscribe(res =>{   
      if(res){
        if(res.action === 1){
          this.createUser(res);
        }
      }    
    });
  }
  
  showEditDailog() {
    if(!this.selectedRow) {
      return;
    }
    
    var selected_user = this.selectedRow;
    var admin;
    var inspector;
    const dialogConfig = new MatDialogConfig();

    if(selected_user.is_admin) {
      admin = true;
    } else {
      admin = false;
    }
    
    if(selected_user.is_surveyor) {
      inspector = true;
    } else {
      inspector = false;
    }

  //dialogConfig.disableClose = true;
    dialogConfig.minWidth = '400px';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = 'myapp-no-padding-dialog';
    
    dialogConfig.data = {id: selected_user.id,
                          login_id: selected_user.login_id,
                          name: selected_user.name,
                          email: selected_user.pc_email,
                          is_admin: admin,
                          is_inspector: inspector,
                          action: 0,
                          ins_mng: true};
                          
    var dailogref = this.Dialog.open(EditUserComponent, dialogConfig);
  
    dailogref.afterClosed().subscribe(res => {   
      if(res) {
        if(res.action === 1) {
          this.updateUser(res);
        }
      }    
    });
  }
 
  async presentAlertConfirm() {
    var  choice = false;
    const alert = await this.alertController.create({
      header: 'ユーザーの削除',
      message: '警告: このユーザーの削除に進みますか?',  //warning: proceed in deleting this user?
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
   
  async presentAlertOK(title, message, cssclass) {
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
      cssClass: cssclass
    });

    await alert.present();
    await alert.onDidDismiss();
    
    return choice;
  }
  
  clearSelection() {
    this.selectedRow = null;
    this.selectedRowID = null;
  }
  
  RequestAuth() {
    var currentURL = '/serviceadmin/mng-users';
    this.authGuard.logout();
    this.router.navigate(['/serviceadmin/index'], {queryParams : {url:currentURL}});
  }
  
}
