import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef , } from  '@angular/material/dialog';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
})
export class EditUserComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any , public dialogRef: MatDialogRef<EditUserComponent>) { }

  lbl_form_title = 'ユーザー情報';
  set_ins_active = false;
  
  ngOnInit() {

    if(this.data.ins_form == true){
      this.lbl_form_title = 'インスペクター情報';
      if(this.data.active == 1){
        this.set_ins_active = true;
      }else{
        this.set_ins_active = false;
      }
    }
  }
  
  save() {
    if(this.data.ins_form == true){ 
      if(this.set_ins_active) {
        this.data.active = 1;
      } else {
        this.data.active = 0;
      }
        
      delete  this.data.ins_form; 
      delete  this.data.ins_mng; 
    }
 
    this.data.action = 1;
    this.dialogRef.close(this.data);
  }
 
  close() {
    this.data.action = 0;
    this.dialogRef.close(this.data);
  }

}
