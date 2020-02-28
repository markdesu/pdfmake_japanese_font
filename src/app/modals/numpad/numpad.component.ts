import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef , } from  '@angular/material/dialog';

@Component({
  selector: 'app-numpad',
  templateUrl: './numpad.component.html',
  styleUrls: ['./numpad.component.scss'],
})

export class NumpadComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any , public dialogRef: MatDialogRef<NumpadComponent>) { }
  
  value = String(this.data.val) || '0';
  
  ngOnInit() {}
  
  typeInput(val:string) {
  
      if(val == 'b') {
        
            if(this.value != '0' ) {
                this.value = this.value.substring(0, this.value .length - 1);
            }
          
            if(this.value.length == 0) {
                this.value = '0';
                return;
            }
        
      } else {
            if(this.value == '0') {
                if(val == '.') {
                  this.value = this.value + String(val);
                }else{
                  this.value = '';
                  this.value = this.value + String(val);
                }
          
            } else {
              
                if(val == '.' && this.value.indexOf('.') > -1) {
                  
                } else {
                  this.value = this.value + String(val);
                }
            }
      }
  }
  
  save() {
    this.dialogRef.close({ data: this.value });
  }
  
  
}
