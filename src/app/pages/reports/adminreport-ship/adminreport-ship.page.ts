import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { ExportToCsv } from 'export-to-csv';
import { ReportService } from '../../../services/report.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-adminreport-ship',
  templateUrl: './adminreport-ship.page.html',
  styleUrls: ['./adminreport-ship.page.scss'],
})

export class AdminreportShipPage implements OnInit {
  
  constructor(private route : ActivatedRoute, 
              private reportAPI : ReportService, 
              private authGuard : AuthguardService, 
              private router : Router, 
              public events : Events ) {
      
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
  
  no_color = false;
  
  ngOnInit() {
    //Get URL parameters////
    this.getParams();  
    if (this.provider_id && this.vendor_code && this.ship_code && this.from_date && this.to_date && this.ship_trader) {
            var data = {
                "provider_id" : this.provider_id,
                "vendor_code" : this.vendor_code,
                "ship_code"   : this.ship_code,
                "from_date"   : this.from_date,
                "to_date"     : this.to_date,
                "ship_trader" : this.ship_trader 
                };
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
    
  exportPDF() {
    
    var pdf_objarr = [];
    var bottom_border = [false,false,false, true];
    var records = [];
    var header= [{text:'グループ', style:'jap_header', border:bottom_border},
    {text:'正味重量	',     style:'jap_header', border:bottom_border},
    {text:'品名',      style:'jap_header', border:bottom_border},
    {text:'検収重量',      style:'jap_header', border:bottom_border}
   ];
   
   var counter = 0;
   this.result.forEach(e =>{
    counter = counter + 1;

        if(counter == 1) {
            records.push(header);
        }
        let counter2 = 0;
        e.items.forEach(y => {
            
            if(counter2 == 0 ){
                records.push([{text:e.group_name, style:'jap'},{},{text:y.product_name, style:'jap'},{text:this.numFormat(y.weight), style:'jap'}]);
            }else{
                records.push([{},{},{text:y.product_name, style:'jap'},{text:y.weight, style:'jap'}]);
            }
            counter2 = counter2 + 1;
           
        });
         records.push([{text:e.group_name + ' 計', style:'jap_total'},{text:this.numFormat(e.netweight_total), style:'total_num'},{text:'', style:'jap_total'},{text:this.numFormat(e.weight_total), style:'total_num'}]);
  
   });
   
    records.push([{text:'合計', style:'jap_ototal'},{text:this.numFormat(this.ntotal), style:'ototal_num'},{text:'', style:'ototal_num'},{text:this.numFormat(this.wtotal), style:'ototal_num'}]);
    records.push([{text:' ',colSpan: 4}])
    pdf_objarr.push([{
        table: {
            headerRows : 1,
            body:records,
                widths: ['*','*','*','*']
        }, layout:'lightHorizontalLines'
    }]);
    
    var fd = this.from_date;
    var td = this.to_date;
    var vendor = this.vendor_name.replace(/\s/g, '');
    var ship = this.ship_name.replace(/\s/g, '');
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth()+ 1 ;
    var d = date.getDate();
    var f_y = fd.substring(0, 4);
    var f_m = fd.substring(4, 6);
    var f_d = fd.substring(6, 9);
    var t_y = td.substring(0,4);
    var t_m = td.substring(4, 6);
    var t_d = td.substring(6, 9);
    
    var now_date = y   +'年 ' + m + '月 '  + d + '日' 
    var f_date   = f_y +'年'  + f_m + '月' + f_d + '日';
    var t_date   = t_y +'年'  + t_m + '月' + t_d + '日';
    
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
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
    var docDefinition = {
        pageOrientation: 'landscape',
        header: function(currentPage, pageCount) {
            return { 
                    columns:[{text: '納入業者:' + vendor + ' / 代納業者 : '+ ship, style: 'jap', alignment:'left', margin:[15,10,0,10] },
                            {text: '管理用船別集計', style:'jap', fontSize:12, alignment: 'center'},
                            { text: '(出力範囲 ' + f_date +' - ' + t_date + ')  ' +  'P: ' + currentPage.toString() + '/' + pageCount,style:'jap', alignment:'right', margin:[0,10,15,10]}
                            ],margin:[0,10,0,0]       
            }          
        },
        footer:{text: '処理日付 ' + now_date , style:'jap', alignment:'right' , margin:[,10,15,10]}
        ,
        content: pdf_objarr,
        styles: {
          header: {fontSize: 12, font: 'IPAgothic',margin: [0, 5, 0, 10] },
          jap: {font: 'IPAgothic', margin: [0,5,5,0]},
          jap_header: {font: 'IPAgothic', fontSize:7},
          jap_number: {font: 'IPAgothic', margin: [0,5,10,0], alignment:'right', border:bottom_border},
          jap_total:  {font: 'IPAgothic', fontSize:7, margin:[3,5,0,0], fillColor: '#c8c8c8'},
          total_num:  {font: 'Roboto', fontSize:8, fillColor: '#c8c8c8', bold:true, alignment:'left', margin:[0,5,10,0], border:bottom_border},
          jap_ototal: {font: 'IPAgothic', fontSize:9, fillColor: '#cfe8fb' , bold:true , alignment:'left', margin:[0,5,5,0]},
          ototal_num: {font: 'Roboto', fontSize:9, bold:true, alignment:'left',fillColor: '#cfe8fb' , margin:[0,5,5,0], border:bottom_border},
        },
        defaultStyle: {
          fontSize: 7
        }
    }
    
    pdfMake.createPdf(docDefinition).open();
  }
  
    
  numFormat(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
}