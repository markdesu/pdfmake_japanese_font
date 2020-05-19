import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { ReportService } from '../../../services/report.service';
import { ExportToCsv } from 'export-to-csv';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-ship-aggregate',
  templateUrl: './ship-aggregate.page.html',
  styleUrls: ['./ship-aggregate.page.scss'],
})
export class ShipAggregatePage implements OnInit {

  constructor(private route : ActivatedRoute, 
              private reportAPI : ReportService, 
              private authGuard : AuthguardService, 
              private router : Router, 
              public events : Events ) {
      
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
    
    no_color : false;
    
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
    
    setGrouping(): void {
        var ship = new Set(this.main_result.map(x => x.ship_code));
      
        ship.forEach(x => {
            var sub = [];
            var arr = this.main_result;
            var ship_name;
            
          for (let y = 0; y < this.main_result.length; y++) {
                if(arr[y].ship_code == x) {

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
                    group_obj['net_weight'] = this.getGroupTotal(ship_c, group_c,'net_weight', hatch_c,this.main_result);
                    group_obj['group_details'] = [];
                    
                    //Group details
                    group_dt['item_code'] = item_c;
                    group_dt['item_name'] = item_n;
                    group_dt['weight'] = weight;
                    
                    var check_hatch = sub.find(r => r.hatch_no == hatch_c);
                    var edit_hatch = hatch_c;
                    if(edit_hatch == 0) {
                        edit_hatch = '';
                    } else {
                        edit_hatch = hatch_c + 'ハッチ';
                    }
                    hatch_obj['hatch_no'] = hatch_c;
                    hatch_obj['hatch_name'] = edit_hatch;
                    hatch_obj['details'] = [];
                    
                    if(!check_hatch) {
                        sub.push(hatch_obj);
                    }
                
                    sub.forEach(el => {
                        if(el.hatch_no == hatch_c) {         
                            if(el.details.length > 0 ) {
                                var checker = el.details.find(r => r.group_code == group_c);
                                if(!checker) {                     
                                    el.details.push(group_obj);
                                } 
                                el.details.forEach(element => {
                                    if(element.group_code == group_c) {
                                        element.group_details.push(group_dt);
                                    }
                                });
                            } else {
                                el.details.push(group_obj);
                                el.details.forEach(element => {
                                    if(element.group_code == group_c) {
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
     
    getGroupTotal(ship_code,group_code, field, hatch, arr) {
        var allTotal = 0;
        
        for (let x = 0; x < arr.length; x++) {   
            if(arr[x].ship_code == ship_code && arr[x].group_code == group_code && arr[x].hatch_no == hatch) {
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
    
    getOverallTotal(field,arr) {
        var Total = 0;
        for (let x = 0; x < arr.length; x++) {   
            
                Total = Total + arr[x][field];   
        }
        return Total;
    }
    
    countWeighing(ship_code, arr) {
        var temp_arr = [];
        
        for (let x = 0; x < arr.length; x++) {   
            if(arr[x].ship_code == ship_code) {
                var splits = arr[x].slip_no.split(',');
                splits.forEach(z => {
                var check = temp_arr.includes(z)
                    if(!check) {
                        temp_arr.push(z);
                    }
                });       
            }      
        }
        return temp_arr.length;;
    }
    
    downloadCSV() {
        var fname = '船別•置場別集計' +  '_' + this.from_date  + '_' + this.to_date;
        if (this.main_result.length > 0) {
          const options = { 
                fieldSeparator: ',',
                quoteStrings: '"',
                decimalSeparator: '.',
                showLabels: true, 
                showTitle: true,
                title: '船別•置場別集計',
                filename: fname,
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: true,
          };
          
          const csvExporter = new ExportToCsv(options);  
          csvExporter.generateCsv(this.main_result);
        }
    }
      
      
    exportPDF() {
    var pdf_objarr = [];  
    var counter = 0;
    var bottom_border = [false,false,false,true];
    var no_border = [false,false,false,false];
    var empty = {text:' ', style:'jap', border:bottom_border};
    var empty_n = {text:' ', style:'jap', border:no_border};
    var empty_t = {text:' ', fillColor:'#c8c8c8', border:no_border};
    var empty_ot = {text:' ', fillColor:this.no_color ? '' : '#cfe8fb', border:no_border};
    var records = [];
     
    var header= [{text:'船名 No./名',      style:'jap_header'},
                 {text:'ハッチ名',         style:'jap_header'},
                 {text:'グループ No./名',  style:'jap_header'},
                 {text:'正味重量',         style:'jap_header'},
                 {text:'品 No./名',       style:'jap_header'},
                 {text:'検収重量',         style:'jap_header'},
                 {text:'台数',            style:'jap_header'}]
   
    this.custom_result.forEach(data => {
        counter = counter + 1;

        if(counter == 1) {
            records.push(header);
        }
        
        var arr = data.details;
        var h_counter = 0;
        arr.forEach(e => {
            h_counter =  h_counter + 1;
        var c2 = 0;
    
        e.details.forEach(y => {
            c2 = c2 + 1; 
            var c3 = 0;
            y.group_details.forEach(g => {
                c3 = c3 + 1; 
                var ship = empty_n;
                if(c2 == 1 && c3 == 1 && h_counter == 1) {
                    
                    ship =  {text:data.ship_name,style:'jap',border: no_border}
                }
                if( c2 == e.details.length && c3 == y.group_details.length) {
                    records.push([ship,
                                    {text:e.hatch_name || ' ', style:'jap', border:bottom_border}, 
                                    {columns:[{text:y.group_code, style:'num', width:20, alignment:'right'}, {text:y.group_name, style:'jap', width:'*'}], margin:[0,0,0,0], border:bottom_border},    
                                    {text:(y.net_weight).toLocaleString('en'), style:'jap_number', border:bottom_border},
                                    {columns:[{text:g.item_code, style:'num', width:20, alignment: 'right'}, {text:g.item_name, style:'jap', width:'*'}], margin:[0,0,0,0], border:bottom_border},  
                                    {text:(g.weight).toLocaleString('en'), style:'jap_number', border: bottom_border}, empty]);
                
                } else if(c3 ==   y.group_details.length) {                                  
                    records.push([ship, {text:e.hatch_name || ' ', style:'jap', border:bottom_border}, 
                                    {columns:[{text:y.group_code, style:'num', width:20, alignment:'right'}, {text:y.group_name, style:'jap', width:'*'}],margin:[0,0,0,0],border:bottom_border},      
                                    {text:(y.net_weight).toLocaleString('en'), style:'jap_number', border:bottom_border},   
                                    {columns:[{text:g.item_code, style:'num', width:20, alignment:'right'}, {text:g.item_name, style:'jap', width:'*'}],margin:[0,0,0,0],border:bottom_border},                        
                                    {text:(g.weight).toLocaleString('en'), style:'jap_number', border:bottom_border}, empty]);                        
            
                } else {
                    records.push([ship, empty_n, empty_n, empty_n,
                                    {columns:[{text:g.item_code, style:'num', width:20, alignment:'right'},{text:g.item_name, style:'jap', width:'*'}],margin:[0,0,0,0],border: no_border}, 
                                    {text:(g.weight).toLocaleString('en'),  style:'jap_number',border: no_border}, empty_n]);
                }
            });             
        });
        });

            records.push([ {text:'<< 船別計 >>',                            style:'jap_total',border: no_border}, empty_t, empty_t, 
                            {text:(data.net_weight).toLocaleString('en'),  style:'total_num',border: no_border}, empty_t,
                            {text:(data.weight).toLocaleString('en'),      style:'total_num',border: no_border},
                            {text:data.counter,                            style:'total_num',border: no_border}]);
                            
                            if(counter !=  this.custom_result.length){
                                records.push([empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n]);
                            }            

            // Get Over All total ...................................................................................
            var nw_total = this.getOverallTotal('net_weight', this.main_result);
            var w_total = this.getOverallTotal('weight', this.main_result);
            
            if(counter == this.custom_result.length) {
                records.push([{text:'<< 船別計 >>', style:'jap_total', fillColor:this.no_color ? '' : '#cfe8fb', margin:[0,8,10,5], border:no_border}, empty_ot, empty_ot, 
                            {text:(nw_total).toLocaleString('en'), style:'over_total_num', border:no_border}, empty_ot,
                            {text:(w_total).toLocaleString('en'), style:'over_total_num', border:no_border}, empty_ot]);
            }
    });        

    pdf_objarr.push([{
            table: {
                headerRows : 1,
                body:records,
                    widths: ['*','auto','*','auto','*','auto',40]
            },layout: {
                hLineStyle: function (i) {             
                    return (i > 1) ? {dash: {length: 2}} : null
                },
                hLineWidth: function (i) {
					  return (i > 1)  ? .5 : .5;
				},
                hLineColor: function (i) {
                      return (i > 1) ? 'gray' : null;
                }
			}
    }]);

    pdfMake.fonts = {
        IPAgothic: {
            normal:      'ipagp.ttf',
            bold:        'ipagp.ttf',
            italics:     'ipagp.ttf',
            bolditalics: 'ipagp.ttf'
        },
        Roboto : {
            normal:      'Roboto-Regular.ttf',
            bold:        'Roboto-Medium.ttf',
            italics:     'Roboto-Italic.ttf',
            bolditalics: 'Roboto-Italic.ttf'
        },
      }
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        
        // Header Dates
        var fd = this.from_date;
        var td = this.to_date;
        var vendor = this.vendor_name;
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth()+ 1 ;
        var d = date.getDate();
        var f_y = fd.substring(0,4);
        var f_m = fd.substring(4,6);
        var f_d = fd.substring(6,9);
        var t_y = td.substring(0,4);
        var t_m = td.substring(4,6);
        var t_d = td.substring(6,9);
                
        var now_date = y + '年' + m + '月' + d + '日' 
        var f_date   = f_y + '年' + f_m + '月' + f_d + '日';
        var t_date   = t_y + '年' + t_m + '月' + t_d + '日';
        
        var docDefinition = {
            pageOrientation: 'landscape',
            header: function(currentPage, pageCount) {
                return { columns:[{text: '処理日付 ' + now_date + ' (' + vendor + ')', style:'jap', alignment:'left', margin:[15,10,0,10]},
                                {text: '船別•置場別集計表',       style: 'jap', fontSize:12, alignment:'center'},
                                { text: '(出力範囲 ' + f_date +' - ' + t_date + ')  ' +  'P: ' + currentPage.toString() + '/' + pageCount, style:'jap', alignment:'right', margin:[0,10,15,10]}
                                ],margin:[0,10,0,0]}                     
              },
            content: pdf_objarr,
            styles: {
              header: {font:'IPAgothic', fontSize:12, margin:[0,5,0,10]},
              jap: {font:'IPAgothic', margin:[0,5,5,0]},
              jap_header: {font:'IPAgothic', fontSize:8, color:'#092337', border:bottom_border},
              jap_number: {font:'IPAgothic', margin:[0,5,10,0], alignment:'right'},
              jap_total: {font:'IPAgothic', fontSize:7, margin:[0,5,0,0], fillColor:'#c8c8c8'},
              total_num: {font:'Roboto', fontSize:8, bold:true, fillColor:'#c8c8c8', margin:[0,5,10,0], alignment:'right'},
              over_total_num: {font:'Roboto', fontSize:8, bold:true, fillColor: this.no_color ? '' : '#cfe8fb', margin:[0,8,10,5], alignment:'right'},
              num: {font:'IPAgothic', fontSize:5, color: 'gray', margin:[0,6,5,0]}
            },
            defaultStyle: { 
              fontSize: 7
            }
        }
        
        pdfMake.createPdf(docDefinition).open();
    }
}
