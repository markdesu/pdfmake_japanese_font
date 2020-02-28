import { Component, OnInit } from '@angular/core';
import { AuthguardService } from '../../../services/authguard.service';
import { ManagementService } from '../../../services/management.service';
import { AlertController } from '../../../../../node_modules/@ionic/angular';
import { CreateUserComponent } from '../../../modals/create-user/create-user.component';
import { EditUserComponent } from '../../../modals/edit-user/edit-user.component';
import { MatDialog, MatDialogConfig } from '../../../../../node_modules/@angular/material';
import { Router } from '../../../../../node_modules/@angular/router';

@Component({
  selector: 'app-mng-comusers',
  templateUrl: './mng-comusers.page.html',
  styleUrls: ['./mng-comusers.page.scss'],
})
export class MngComusersPage implements OnInit {

  constructor(private management_API: ManagementService, private authGuard : AuthguardService, private alertController : AlertController, private Dialog: MatDialog, private router : Router) { }
  
  displayedColumns: string[] = ['username','name','email', 'is_admin', 'is_inspector'];
  dataSource = [];

  private provider_id;
  private customer_id;
  
  valid_inspectorMng = false;

  selectedRowID;
  selectedRow;
  
  ngOnInit() {
    this.provider_id = this.authGuard.provider_id;
    this.customer_id = this.authGuard.customer_id;
  }
  
  
  ionViewDidEnter() {
    this.provider_id = this.authGuard.provider_id;
    this.customer_id = this.authGuard.customer_id;
    this.valid_inspectorMng = this.authGuard.enable_inspector_assign;
    this.getUsers(this.customer_id);
  }
  
  
  execGetUSer() {
    if(this.provider_id && this.customer_id){
      this.getUsers(this.customer_id);
    } 
  }
  
  
  getUsers( customer) {
    this.management_API.getCustomerUsers(customer).subscribe(res =>{
       
        if(res.status != '401'){
          if(res.data){
            this.dataSource = res.data;
          }
        }else{
          this.expired();
        }
    });
  }
  
  createUser(user_data) {
    if(this.customer_id){
        user_data['provider_id']  = this.provider_id;
        user_data['customer_id']  = this.customer_id;
        
        this.management_API.createUser(user_data).subscribe(res =>{
            if(res){
              if(res.status == '204'){   
                if(res.data == 1){
                  this.presentAlertOK('誤差','ログイン ID は既に使用されています。', 'alertDanger');// Error: Login ID already in use.'
                }else if(res.data == 2) {
                  this.presentAlertOK('誤差','メールアドレスは既に使用されています。', 'alertDanger');// Error: Email already in use.'
                }
               
                return;
              }
              if(res.status == '200'){
                this.presentAlertOK('成功','ユーザーが作成されました。', 'alertSuccess');
                this.execGetUSer();
                return;
              }
              if(res.status == '401'){
                this.expired();
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
      if(res.status != "401"){
        if(res.data){  
          if(res.data['affectedRows']){
            this.execGetUSer();
            this.clearSelection();
          }
        }
      }else{
        this.expired();
      }
    });
    
  }

  deleteUser() {
    if(!this.selectedRow){
      return;
    }
    this.presentAlertConfirm().then( res =>{
      if(res){
          this.management_API.deleteUser(this.selectedRow.id).subscribe(res2 =>{
            if(res2.status != "401"){
              if(res2.data){
                if(res2.data['affectedRows']){
                  this.execGetUSer();
                }
              }
            }else{
              this.expired();
            }
          });
      }
    });
  }

  showCreateDailog() {
    const dialogConfig = new MatDialogConfig();
    //dialogConfig.disableClose = true;
    dialogConfig.minWidth = '400px';
    dialogConfig.maxWidth = '200vw';
    dialogConfig.maxHeight = '600px';
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = 'custom_matdialog';
  
    //Set this to enable inspector option
    dialogConfig.data = {ins_mng: this.valid_inspectorMng};
    
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
    if(!this.selectedRow){
      return;
    }
    
    var selected_user = this.selectedRow;
      var admin;
      var inspector;
      const dialogConfig = new MatDialogConfig();
      
      if(selected_user.is_admin){
        admin = true;
      }else{
        admin = false;
      }
      
      if(selected_user.is_surveyor){
        inspector = true;
      }else{
        inspector = false;
      }

    //dialogConfig.disableClose = true;
      dialogConfig.minWidth = '400px';

      dialogConfig.maxWidth = '200vw';
      dialogConfig.maxHeight = '600px';
      dialogConfig.autoFocus = false;
      dialogConfig.panelClass = 'custom_matdialog';
      
      dialogConfig.data = {id: selected_user.id,
                            login_id: selected_user.login_id,
                            name: selected_user.name,
                            email: selected_user.pc_email,
                            is_admin: admin,
                            is_inspector: inspector,
                            action: 0,
                            ins_mng: this.valid_inspectorMng }
                            
      var dailogref = this.Dialog.open(EditUserComponent,dialogConfig);
    
      dailogref.afterClosed().subscribe(res =>{   
          if(res){
              if(res.action === 1){
                this.updateUser(res);
              }
          }    
      });
  }
 
  
  selectRow(row) {
    this.selectedRowID = row.id;
    this.selectedRow = row;
  }
  
  setAuth(val){
    if(val) {
      return 1;
    }
      return 0;
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
   
  async presentAlertOK(title,message, cssclass) {
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
      cssClass: cssclass,
    });

    await alert.present();
    await alert.onDidDismiss();
    
    return choice;
  }
  

  clearSelection(){
    this.selectedRow = null;
    this.selectedRowID = null;
  }
  
  expired(){
    this.authGuard.logout();
    this.router.navigate(['/login'], {queryParams : {url: '/mng-users'}});
  }
}
