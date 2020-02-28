import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { ExportToCsv } from 'export-to-csv';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-adminreport-ledger',
  templateUrl: './adminreport-ledger.page.html',
  styleUrls: ['./adminreport-ledger.page.scss'],
})
export class AdminreportLedgerPage implements OnInit {

  constructor(private route : ActivatedRoute, private reportAPI : ReportService, private authGuard : AuthguardService, private router : Router, public events : Events ) { }
  
  // URL Parameter Variables ///////
  provider_id    : any;
  vendor_code    : any;
  subvendor_code : any;
  vendor_name    : any;
  subvendor_name : any;
  from_date      : any;
  to_date        : any;
  ledger_type    : any;
  
  // Strings and Numbers //////////
  lblResult       = '';
  netw_total      =  0;
  verifiedw_total =  0; 
  ledger_count    =  0; 
  
  // Arrays and Objects ///////////
  result = [];
  array_ledger  = [];
  
  // Booleans /////////////////////
  hide_btndl = true;
  total_only = false;
  
  ngOnInit() {
    this.getParams();
    this.executeReport();
  }
  
  getParams() {
    this.route.queryParams.subscribe(qparams => {
        if (qparams.provider_id && qparams.vendor_code && qparams.subvendor_code && qparams.from_date && qparams.to_date) {
          
            
            this.provider_id    = qparams.provider_id;
            this.vendor_code    = qparams.vendor_code;
            this.subvendor_code = qparams.subvendor_code;
            this.vendor_name    = qparams.vendor_name;
            this.subvendor_name = qparams.subvendor_name;
            this.from_date      = qparams.from_date;
            this.to_date        = qparams.to_date;
            
            if (qparams.ledger_type) {
                this.ledger_type = qparams.ledger_type;
            }
        }
    });

  }
   
  executeReport() {
      
    if (this.provider_id && this.vendor_code && this.subvendor_code && this.from_date && this.to_date && this.subvendor_name) {
      var data = {
          "provider_id"    : this.provider_id,
          "vendor_code"    : this.vendor_code,
          "subvendor_code" : this.subvendor_code,
          "from_date"      : this.from_date,
          "to_date"        : this.to_date,
          "ledger_type"    : this.ledger_type 
          };
          
          this.reportAPI.getAdminLedgerReport(data).subscribe(res => {
              if (res) {
                  if (res.status != '401') {
                      if (res.data.length > 0) {  
                          this.array_ledger = res.data;
                          this.formatTimestring();
                          this.formatDatestring();
                          this.setGrouping();
                       
                          this.hide_btndl = false;
                          this.lblResult = '';
                      } else {
                          this.lblResult = 'レコードが見つかりません';
                          this.hide_btndl = true;
                      }
                  } else {
                    this.authGuard.logout();
                    this.router.navigate(['/login'], {queryParams : {url: '/report-ship', topic: 'adminShipReport'}});
                  }
              }
          });
    } else {
        this.lblResult = '無効なパラメータ';
    }
  }
  
  
  setGrouping() {
    var subvendor_group = new Set(this.array_ledger.map(item => item.subvendor_code));
    
    this.result = [];

    subvendor_group.forEach(subvendor_code => {
          var subvendor_group = [];
          var Obj = {};
          for(var x = 0; x < this.array_ledger.length; x ++) {
              if(this.array_ledger[x].subvendor_code == subvendor_code) {     
                subvendor_group.push(this.array_ledger[x]);           
              }
          }    
          
        Obj = {"subvendor_code": subvendor_code, 
               "subvendor_name": this.shipFilter(subvendor_code), 
               "subvendor_list": subvendor_group,
               "net_total": this.shipTotal(subvendor_code,'net_weight'),
               "verified_total": this.shipTotal(subvendor_code,'verified_weight') };
        
        this.result.push(Obj);
    }); 
    this.netw_total      =  this.ledgerTotal('net_weight');
    this.verifiedw_total =  this.ledgerTotal('verified_weight'); 
    this.ledger_count  = this.array_ledger.length;

  }
  
      
  shipFilter(code) {
    var subvendor_name = '';
    var arrFilter = this.array_ledger.filter(x => x.subvendor_code === code);
    
    subvendor_name =arrFilter[0].subvendor_name;
    return subvendor_name;
  }
    
  
  
  shipTotal(s_code,field) {
    var subvendor_total = 0;
    for (let x = 0; x < this.array_ledger.length; x++) {
          if(this.array_ledger[x].subvendor_code == s_code ) {   
            subvendor_total = subvendor_total + this.array_ledger[x][field];    
          }  
    }
    return subvendor_total;
  }

  ledgerTotal(field) {
    var total = 0;
    for (let x = 0; x < this.array_ledger.length; x++) {
          if(this.array_ledger[x][field]) {   
            total = total + this.array_ledger[x][field];    
          }  
    }
    return total;
  }
  
  
   //Format and Filtering/////////////////////////////////////////////////////////////
  
   formatTimestring() {
    for (let x = 0; x < this.array_ledger.length; x++) {
      var stringtime = String(this.array_ledger[x].tare_time);
        if(stringtime.length == 3) {
          stringtime = '0' + stringtime;
        }
        
        if(this.array_ledger[x].tare_time  || this.array_ledger[x].tare_time != '') {
              var  newtime = stringtime.substring(0,2) +':'+ stringtime.substring(2,4);
            this.array_ledger[x].tare_time = newtime;
          }
    }
 
  }
  
  formatDatestring() {
    for (let x = 0; x < this.array_ledger.length; x++) {
      var string_date = String(this.array_ledger[x].delivery_date);
   
        if(string_date.length == 8) {
          var year =  string_date.substring(0,4);
          var month = string_date.substring(4,6);
          var day = string_date.substring(6,8);
          var  new_datestring = year +'/'+  month +'/'+ day; 
          this.array_ledger[x].delivery_date = new_datestring;
        }
        
    
    }
  }
  
  
  
  downloadCSV() {
    var fname = '管理用元帳' +  '_' + this.from_date  + '_' + this.to_date;
    if(this.array_ledger.length > 0) {
      const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: '管理用元帳',
        filename: fname,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
       
      };
     
      const csvExporter = new ExportToCsv(options);
      
      csvExporter.generateCsv(this.array_ledger);
    }
   
  }
}