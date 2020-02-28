import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthguardService } from '../../../services/authguard.service';
import { AlertController } from '@ionic/angular';
import { Events }  from '@ionic/angular';
import { MatDialog, MatDialogConfig } from '../../../../../node_modules/@angular/material';

import { ManagementService } from '../../../services/management.service';
import { CreateUserComponent } from '../../../modals/create-user/create-user.component';
import { EditUserComponent } from '../../../modals/edit-user/edit-user.component';


@Component({
  selector: 'app-mng-inspectors',
  templateUrl: './mng-inspectors.page.html',
  styleUrls: ['./mng-inspectors.page.scss'],
})
export class MngInspectorsPage implements OnInit {
  
  constructor(private router : Router, 
              public events: Events, 
              private authGuard : AuthguardService, 
              private management_API : ManagementService, 
              private alertController : AlertController,
              private Dialog: MatDialog) { 
    
  
    events.subscribe('mnginspectors', () => {
 
      this.getInspectors();
    });

  }
  

 
  displayedColumns: string[] = ['username','name','email', 'active'];
  dataSource = [];
   
    
  private provider_id;
  private selectedRowID;
  private selectedRow;
  
  
  ngOnInit() {

  }
  
  ionViewDidEnter() {
    this.provider_id = this.authGuard.provider_id;
    this.getInspectors();
  }
  
  getInspectors() {
    if(this.provider_id){
      this.management_API.getAllInspectors(this.provider_id).subscribe(res =>{
        if(res){
            if(res.status != '401'){
              if (res.data.length > 0) {
                this.dataSource = res.data;
              }
            }else{
              this.authGuard.logout();
              this.router.navigate(['/login'], {queryParams : {url: '/mng-inspectors', topic: 'mnginspectors'}});
            }
        }
      });
    }
  }
  
  saveInspector(inspector_data) {
    
    inspector_data.provider_id = this.provider_id;
    inspector_data.username = inspector_data.login_id;
                
    this.management_API.createInspector(inspector_data).subscribe(res =>{
      if(res.data){
        
        if(res.status == '204'){
          this.presentAlertOK('誤差','ログイン ID または電子メールは既に使用されています。', 'alertDanger');// Error: Login ID already in use.'
          return;
        }
        if(res.status == '200' && res['data']['affectedRows'] > 0){                  
          this.presentAlertOK('成功','インスペクタ ユーザーが作成しました。', 'alertSuccess');
            this.getInspectors();
        }
      }
      
    });
 
    
  }
  
  
  updateInspector(inspector_data) {
  
    inspector_data.provider_id = this.provider_id;
    inspector_data.username = inspector_data.login_id;

    this.management_API.updateInspector(inspector_data).subscribe(res=>{
      if(res.data){

        if(res.data['affectedRows']){
          this.getInspectors();
          this.clearSelection();

        }
      }
    });
    
  }
    
  deleteInspector() {
    if(!this.selectedRow){
      return;
    }
    this.presentAlertConfirm().then( res =>{
      if(res){
          this.management_API.deleteInspector(this.selectedRowID).subscribe(res2 =>{
            if(res2.data){
              if(res2.data['affectedRows']){
                this.getInspectors();
              }
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
    dialogConfig.data = {ins_form: true};
    
    var dailogref = this.Dialog.open(CreateUserComponent,dialogConfig);

    dailogref.afterClosed().subscribe(res =>{   
        if(res){
            if(res.action === 1){
                this.saveInspector(res) 
            }
        }    
    });
  }

  showEditDailog() {
    
    if(!this.selectedRow) {
      return;
    }
    
    var selected_user = this.selectedRow;
 
    const dialogConfig = new MatDialogConfig();
    
      dialogConfig.minWidth = '400px';
      dialogConfig.maxWidth = '200vw';
      dialogConfig.maxHeight = '600px';
      dialogConfig.autoFocus = false;
      
      dialogConfig.panelClass = 'custom_matdialog';
      
      dialogConfig.data = {id: selected_user.id,
                            login_id: selected_user.login_id,
                            name: selected_user.name,
                            email: selected_user.email,
                            active: selected_user.active,
                            action: 0,
                            ins_mng: false,
                            ins_form: true}
                            
      var dailogref = this.Dialog.open(EditUserComponent,dialogConfig);
  
      dailogref.afterClosed().subscribe(res =>{   
          if(res){
              if(res.action === 1){
                 this.updateInspector(res);
 
              }
          }    
      });
  }
  
  selectRow(row) {
    this.selectedRowID = row.id;
    this.selectedRow = row;
  }
  
  async presentAlertConfirm() {
     var  choice = false;
     const alert = await this.alertController.create({
       header: 'インスペクタの削除',
       message: '警告: このインスペクタを削除してもよますか?',
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
   
  async presentAlertOK(title,message,cssclass) {
    var  choice = false;
    const alert = await this.alertController.create({
      header: title,
   
      message: 'メッセージ:' +message ,  //warning message
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
   
  clearSelection() {
    this.selectedRow = null;
    this.selectedRowID = null;
  }
  
  
    
  expired() {
    this.authGuard.logout();
    this.router.navigate(['/login'], {queryParams : {url: '/mng-inspectors'}});
  }
}
