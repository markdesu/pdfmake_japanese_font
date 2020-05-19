import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../../node_modules/@angular/material';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss'],
})
export class EditCustomerComponent implements OnInit {

  
  public create_data = {
          id : '',
          name:'',
          address: ' ',
          phone: ' ',
          fax: ' ',
          remark: ' ',
          action:0};
          hide_error    = true;
          error_status = '';   


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditCustomerComponent>) { }
  

  ngOnInit() {
      this.create_data.id = this.data.id;
      this.create_data.name = this.data.name;
      this.create_data.address = this.data.address;
      this.create_data.phone = this.data.phone;
      this.create_data.fax = this.data.fax;
      this.create_data.remark = this.data.remark;
  }
  
  validate() {
    this.error_status = '';
    this.hide_error = true;

    if(this.create_data.name == '') {
      this.showError();
      return false;
    }else{
      return true;    
    }
  }
  
  
  showError() {
    this.hide_error = false;
    this.error_status = '誤り:無効な会社名';
    var x = document.getElementById('create');
    x.scrollTop = 0 ;
  }
  
  close() {
    this.create_data.action = 0;
    this.dialogRef.close(this.create_data);
  }
  
  
  createCustomer() {
    if(this.validate()) {
      this.create_data.action = 1;
      this.dialogRef.close(this.create_data);
    }
  }
}
