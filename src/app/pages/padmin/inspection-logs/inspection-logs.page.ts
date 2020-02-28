import { Component, OnInit } from '@angular/core';
import { WeighingService } from '../../../services/weighing.service';
import { Router } from '@angular/router';
import { AuthguardService } from '../../../services/authguard.service';
import { NavController, Events } from '@ionic/angular';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-inspection-logs',
  templateUrl: './inspection-logs.page.html',
  styleUrls: ['./inspection-logs.page.scss'],
})
export class InspectionLogsPage implements OnInit {
 
  constructor(private weighingAPI : WeighingService, private router : Router, private authGuard : AuthguardService, private nav : NavController, public events: Events) { 
    
    this.nav = nav  
    events.subscribe('inspection_logs', () => {
    });  
  }
  
  arr_logs = [];
  lbl_status ='';
  hide_btndl = true;
  
  ngOnInit() {
    // console.log(this.authGuard.user_id);
    if(this.authGuard.user_id) {   
      this.lbl_status = '';
      if(this.authGuard.user_type === 'inspector' || this.authGuard.is_inspector){
            this.weighingAPI.getInspectionLogs(this.authGuard.user_id).subscribe( res => {
              if(res){
                  if(res.status != '401'){
                    if (res.data.length > 0) {
                      this.arr_logs = res.data;
                      this.hide_btndl = false;
                    }else{
                      this.lbl_status = 'ログが見つかりません';
                      this.hide_btndl = true;
                    }
                  }else{
                    this.authGuard.logout();
                    this.router.navigate(['/login'], {queryParams : {url: '/inspection-logs', topic: 'inspection_logs'}});
                  }
              }
          });
      }else{
        this.lbl_status = 'ユーザーがインスペクタではありません';
        this.hide_btndl = true;
      }
        
    } 
  }
  
  downloadCSV() {
    var fname = '検査ログ';
    if(this.arr_logs.length > 0) {
      const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: '検査ログ',
        filename: fname,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
       
      };
     
      const csvExporter = new ExportToCsv(options);
      
      csvExporter.generateCsv(this.arr_logs);
    } 
  }
}
