import { Component, OnInit, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef , } from  '@angular/material/dialog';


@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any , public dialogRef: MatDialogRef<CreateUserComponent>) { }

  
  public create_data = {login_id:'',
                        name:'',
                        email: '',
                        is_admin: 0,
                        is_inspector: 0,
                        action:0};
                        
  form_lbl_name = '名前';
  error_status  = '';
  is_admin      = false;
  is_inspector  = false;
  hide_error    = true;
  
  ngOnInit() {  
    if(this.data.ins_form){
          this.form_lbl_name = 'インスペクタ名';
    }
  }
  
  validate() {
    this.error_status = '';
    this.hide_error = true;
    if(this.create_data.login_id != '' && this.create_data.name != ''  && this.create_data.email != ''){
   
        return true;    
    }
      this.showError();
      return false;
  }
  
  createUser() {
    if(this.validate()){
        this.create_data.is_admin  = this.setAuth(this.is_admin);
        this.create_data.is_inspector = this.setAuth(this.is_inspector);
        this.create_data.action = 1;
           
        if(this.data['ins_form'] == true){    
          delete  this.create_data.is_admin; 
          delete  this.create_data.is_inspector; 
        }
        this.dialogRef.close(this.create_data);
    }
  }
  
  showError() {
    this.hide_error = false;
    this.error_status = '誤り:必要な情報をすべて入力してください。';
    var x = document.getElementById('create');
    x.scrollTop = 0 ;
  
  }
  
  close() {
    this.create_data.action = 0;
    this.dialogRef.close(this.create_data);
  }
  
  setAuth(val){
    if(val) {
      return 1;
    }
      return 0;
  }
  
  
}
