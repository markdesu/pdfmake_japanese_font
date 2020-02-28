import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { ExportToCsv } from 'export-to-csv';
import { ReportService } from '../../../services/report.service';


@Component({
  selector: 'app-adminreport-ship',
  templateUrl: './adminreport-ship.page.html',
  styleUrls: ['./adminreport-ship.page.scss'],
})

export class AdminreportShipPage implements OnInit {
  
  constructor(private route : ActivatedRoute, private reportAPI : ReportService, private authGuard : AuthguardService, private router : Router, public events : Events ) {
      
        //Added event subscription. Due to this Ionic version not able to run OnInit everytime a page is reinitialize/reactivated. Ionic fix ongoing.
        events.subscribe('adminShipReport', () => {
            this.ngOnInit();
        });
   }
   
  // URL Parameter Variables ///////
  provider_id : any;
  vendor_code : any;
  ship_code   : any;
  vendor_name : any;
  ship_name   : any;
  from_date   : any;
  to_date     : any;
  ship_trader : any;
  
  // Strings and Numbers //////////
  lblResult = '';
  ntotal    = 0;
  wtotal    = 0;  
  
  // Arrays and Objects ///////////
  result = [];
  array  = [];
  
  // Booleans /////////////////////
  hide_btndl = true;
  total_only = false;
  
  
  
  ngOnInit() {
      
    //Get URL parameters////
    this.getParams();  
      console.log('in');
    if (this.provider_id && this.vendor_code && this.ship_code && this.from_date && this.to_date && this.ship_trader) {
            var data = {
                "provider_id" : this.provider_id,
                "vendor_code" : this.vendor_code,
                "ship_code"   : this.ship_code,
                "from_date"   : this.from_date,
                "to_date"     : this.to_date,
                "ship_trader" : this.ship_trader 
                       };
              console.log(data);
          this.reportAPI.getAdminShipReport(data).subscribe(res => {
              if (res) {
                  if (res.status != '401') {
                      if (res.data.length > 0) {  
                          this.array = res.data;
                          this.vendorGrouping();
                          this.overallTotal('net_weight');
                          this.overallTotal('weight');
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

  ngOnDestroy(): void {
     this.events.unsubscribe('adminShipReport');
  }
  
  getParams() {
    this.route.queryParams.subscribe(qparams => {
        if (qparams.provider_id && qparams.vendor_code && qparams.ship_code && qparams.from_date && qparams.to_date) {
            
            this.provider_id = qparams.provider_id;
            this.vendor_code = qparams.vendor_code;
            this.ship_code   = qparams.ship_code;
            this.vendor_name = qparams.vendor_name;
            this.ship_name   = qparams.ship_name;
            this.from_date   = qparams.from_date;
            this.to_date     = qparams.to_date;
            
            if (qparams.ship_trader) {
                this.ship_trader = qparams.ship_trader;
                this.ship_name   = this.ship_name + '(業者)';
            }
        }
    });

  }
   
 
  // Total Calculations /////////////////////////////////////////////////////////////
  
  groupTotal(g,field) {
    var group_total = 0;
    
    for (let x = 0; x < this.array.length; x++) {
          if (this.array[x].group_code == g ) {   
          group_total = group_total + this.array[x][field];    
          }  
    }
    return group_total;
  }    

  overallTotal(field) {
    var all_total = 0;

    for (let x = 0; x < this.array.length; x++) {
        all_total = all_total + this.array[x][field];  
    }
    
    if (field == 'net_weight') {
        this.ntotal = all_total;
    }
    
    if (field == 'weight') {
        this.wtotal = all_total;
    }

  }
  
  
  // Filters ///////////////////////////////////////////////////////////////////////
  
  vendorGrouping() {
    var itemgroups = new Set(this.array.map(item => item.group_code));
    this.result = [];
    
    itemgroups.forEach(group_code => {
        var temp_arr = [];
        for (var x = 0; x < this.array.length; x ++) {
            if (this.array[x].group_code == group_code) {     
                temp_arr.push({product_name: this.array[x]['item_name'], weight: this.array[x]['weight']});
            }     
        }  
        
        this.result.push({group_code: group_code, group_name: this.groupFilter(group_code),items: temp_arr, weight_total: this.groupTotal(group_code, 'weight',),
        netweight_total: this.groupTotal(group_code, 'net_weight')});        
        
      });
  }
  
  groupFilter(code) {
  var group_name = '';
  var arr_filter = this.array.filter(x => x.group_code === code);
  group_name = arr_filter[0].group_name;

  return group_name;
  }

  downloadCSV() {
    var fname = '管理用船別集計' +  '_' + this.from_date  + '_' + this.to_date;
    if (this.array.length > 0) {
      const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: '管理用船別集計',
        filename: fname,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        
      };
      
      const csvExporter = new ExportToCsv(options);  
      csvExporter.generateCsv(this.array);
    }

  }
  
}