import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '../../../../node_modules/@angular/material';

@Component({
  selector: 'app-select-provider',
  templateUrl: './select-provider.component.html',
  styleUrls: ['./select-provider.component.scss'],
})
export class SelectProviderComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<SelectProviderComponent>) { }
  

  ngOnInit() {

  }
  
  close(provider_id) {
    if(provider_id == 'close'){
      this.dialogRef.close(provider_id);  
      return;
    }
    let index = this.data.findIndex(x => x.provider_id == provider_id);
    this.dialogRef.close(index);    
  }

  
}
