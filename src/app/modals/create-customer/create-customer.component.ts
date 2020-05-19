import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../../node_modules/@angular/material';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.scss'],
})
export class CreateCustomerComponent implements OnInit {

  public create_data = {name:'',
                        address: ' ',
                        phone: ' ',
                        fax: ' ',
                        remark: ' ',
                        action:0};
  hide_error    = true;
  error_status = '';              
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CreateCustomerComponent>) { }
  
  ngOnInit() {}
  
  
  validate() {
    this.error_status = '';
    this.hide_error = true;

    if(this.create_data.name == '') {
      this.showError();
      return false;
    } else {
      return true;    
    }
  }
  
  
  showError() {
    this.hide_error = false;
    this.error_status = '誤り:会社名を入力してください。';
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
