import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { ReportService } from '../../../services/report.service';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-ship-aggregate',
  templateUrl: './ship-aggregate.page.html',
  styleUrls: ['./ship-aggregate.page.scss'],
})
export class ShipAggregatePage implements OnInit {

  constructor(private route : ActivatedRoute, private reportAPI : ReportService, private authGuard : AuthguardService, private router : Router, public events : Events ) {
      
    //Added event subscription. Due to this Ionic version not able to run OnInit everytime a page is reinitialize/reactivated. Ionic fix ongoing.
    events.subscribe('shipaggregate', () => {
        this.ngOnInit();
    });
}
    // URL Parameter Variables ///////
    provider_id : any;
    ship_code   : any;
    ship_codes  = [];
    ship_name   : any;
    from_date   : any;
    to_date     : any;
    vendor_name;
    vendor_code : any;
    // Strings and Numbers //////////
    lblResult = '';
    ntotal    = 0;
    wtotal    = 0;  
    
    // Arrays and Objects ///////////
    custom_result = [];
    main_result  = [];
    
    // Booleans /////////////////////
    hide_btndl = true;
    total_only = false;
    
 
  
    ngOnInit() {
      
      //Get URL parameters////
      this.getParams();  
      if (this.provider_id && this.vendor_code  && this.ship_code && this.from_date && this.to_date) {
              var data = {
                  "provider_id" : this.provider_id,
                  "ship_code"   : this.ship_codes,
                  "from_date"   : this.from_date,
                  "to_date"     : this.to_date,
                  "vendor_code" : this.vendor_code,
                         };
                         
            this.reportAPI.getShipAggregateReport(data).subscribe(res => {
                if (res) {
                    if (res.status != '401') {
                        if (res.data.length > 0) {  
                             this.main_result = res.data;
                             this.setGrouping();
                            this.hide_btndl = false;
                            this.lblResult = '';
                        } else {
                            this.lblResult = 'レコードが見つかりません';
                            this.hide_btndl = true;
                        }
                    } else {
                      this.authGuard.logout();
                      this.router.navigate(['/login'], {queryParams : {url: '/report-ship', topic: 'shipaggregate'}});
                    }
                }
            });
      } else {
         this.lblResult = '無効なパラメータ';
      }
    }
  
    ngOnDestroy(): void {
       this.events.unsubscribe('shipaggregate');
    }
    
    setGrouping(): void{
        var ship = new Set(this.main_result.map(x => x.ship_code));
      
        ship.forEach(x => {
            var sub = [];
            var arr = this.main_result;
            var ship_name;
            
          for (let y = 0; y < this.main_result.length; y++) {
                if(arr[y].ship_code == x){

                    var group_obj = {},
                        group_dt  = {},       
                        hatch_obj = {},          
                        ship_c    = arr[y].ship_code,
                        ship_n    = arr[y].ship_name,
                        hatch_c   = arr[y].hatch_no,
                        group_c   = arr[y].group_code,
                        group_n   = arr[y].group_name,
                        item_c    = arr[y].item_code,
                        item_n    = arr[y].item_name,
                        weight    = arr[y].weight;
                    
                    //Group head
                    group_obj['group_code'] = group_c;
                    group_obj['group_name'] = group_n;
                    group_obj['net_weight'] = this.getGroupTotal(ship_c, group_c,'net_weight',this.main_result);
                    group_obj['group_details'] = [];
                    
                    //Group details
                    group_dt['item_code'] = item_c;
                    group_dt['item_name'] = item_n;
                    group_dt['weight'] = weight;
                    
                    var check_hatch = sub.find(r => r.hatch_no == hatch_c);
                    var edit_hatch = hatch_c;
                    if(edit_hatch == 0){
                        edit_hatch = '';
                    }else{
                        edit_hatch = hatch_c + 'ハッチ';
                    }
                    hatch_obj['hatch_no'] = hatch_c;
                    hatch_obj['hatch_name'] = edit_hatch;
                    hatch_obj['details'] = [];
                    
                    if(!check_hatch){
                        sub.push(hatch_obj);
                    }
                
                    sub.forEach(el => {
                        if(el.hatch_no == hatch_c){         
                            if(el.details.length > 0 ){
                                var checker = el.details.find(r => r.group_code == group_c);
                                if(!checker){                     
                                    el.details.push(group_obj);
                                } 
                                el.details.forEach(element => {
                                    if(element.group_code == group_c){
                                        element.group_details.push(group_dt);
                                    }
                                });
                            }else{
                                el.details.push(group_obj);
                                el.details.forEach(element => {
                                    if(element.group_code == group_c){
                                        element.group_details.push(group_dt);
                                    }
                                });
                            }
                        }
                    });                                         
                    ship_name = ship_n;
                }           
          }
            this.custom_result.push({ship_code: x, ship_name: ship_name, details: sub ,net_weight: this.getShipTotal(x,'net_weight',this.main_result), weight: this.getShipTotal(x,'weight', this.main_result), counter: this.countWeighing(x, this.main_result) });            
        });
        this.ntotal = this.getOverallTotal('net_weight', this.main_result);
        this.wtotal = this.getOverallTotal('weight', this.main_result);
    }
    
    getParams() {
      this.route.queryParams.subscribe(qparams => {
          if (qparams.provider_id &&  qparams.vendor_code && qparams.ship_code && qparams.from_date && qparams.to_date) {    
              this.provider_id = qparams.provider_id;
              this.ship_code   = qparams.ship_code;
              this.ship_codes  = qparams.ship_code;
              this.vendor_code = qparams.vendor_code;
              this.vendor_name = qparams.vendor_name;
              this.ship_name   = qparams.ship_name;
              this.from_date   = qparams.from_date;
              this.to_date     = qparams.to_date;
          }
      });
    }
     
    getGroupTotal(ship_code,group_code, field, arr){
        var allTotal = 0;
        
        for (let x = 0; x < arr.length; x++) {   
            if(arr[x].ship_code == ship_code && arr[x].group_code == group_code) {
                allTotal = allTotal + arr[x][field];   
            }
        }   
        return allTotal;
    }
    
    getShipTotal(ship_code,field,arr) {
        var allTotal = 0;
        
        for (let x = 0; x < arr.length; x++) {   
            if(arr[x].ship_code == ship_code) {
                allTotal = allTotal + arr[x][field];   
            }    
        }
        return allTotal;
    }
    
    getOverallTotal(field,arr){
        var Total = 0;
        for (let x = 0; x < arr.length; x++) {   
            
                Total = Total + arr[x][field];   
        }
        return Total;
    }
    
    countWeighing(ship_code, arr){
        var temp_arr = [];
        
        for (let x = 0; x < arr.length; x++) {   
            if(arr[x].ship_code == ship_code) {
                var splits = arr[x].slip_no.split(',');
                splits.forEach(z => {
                var check = temp_arr.includes(z)
                    if(!check){
                        temp_arr.push(z);
                    }
                });       
            }      
        }
        return temp_arr.length;;
    }
    
    downloadCSV() {
        var fname = '船別の集計' +  '_' + this.from_date  + '_' + this.to_date;
        if (this.main_result.length > 0) {
          const options = { 
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true, 
            showTitle: true,
            title: '船別の集計',
            filename: fname,
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            
          };
          
          const csvExporter = new ExportToCsv(options);  
          csvExporter.generateCsv(this.main_result);
        }
    
      }
}
