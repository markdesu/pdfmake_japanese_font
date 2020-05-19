import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AuthguardService } from '../../../services/authguard.service';
import { ExportToCsv } from 'export-to-csv';
import { ReportService } from '../../../services/report.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-adminreport-ledger',
  templateUrl: './adminreport-ledger.page.html',
  styleUrls: ['./adminreport-ledger.page.scss'],
})
export class AdminreportLedgerPage implements OnInit {

  constructor(private route : ActivatedRoute, 
              private reportAPI : ReportService, 
              private authGuard : AuthguardService, 
              private router : Router, 
              public events : Events ) { }
  
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
  
  exportPDF() {
    var pdf_objarr = [];
    var bottom_border = [false,false,false, true];
    var records = [];
    var header= [{text:'日付', style:'jap_header', border:bottom_border},
    {text:'伝票No		',     style:'jap_header', border:bottom_border},
    {text:'車番',      style:'jap_header', border:bottom_border},
    {text:'船名',      style:'jap_header', border:bottom_border},
    {text:'代納業者	',      style:'jap_header', border:bottom_border},
    {text:'正味重量',      style:'jap_header', border:bottom_border},
    {text:'スケール引',      style:'jap_header', border:bottom_border,colSpan:2},
    {},
    {text:'商品',      style:'jap_header', border:bottom_border},
    {text:'取引重量',      style:'jap_header', border:bottom_border},
    {text:'時間',      style:'jap_header', border:bottom_border},
   ];

   var counter = 0;
   this.result.forEach(e =>{
    counter = counter + 1;

        if(counter == 1) {
            records.push(header);
        }

        records.push([{text:e.subvendor_name, style:'jap',colSpan:11}]);
        e.subvendor_list.forEach(y => {

                records.push([{text:y.weighing_date, style:'jap'},
                {text:y.weighing_no, style:'jap'},
                {text:y.car_no, style:'jap'},
                {text:y.ship_name, style:'jap'},
                {text:y.subvendor_name, style:'jap'},
                {text:y.net_weight, style:'jap'},
                {text:y.reduced_percent, style:'jap'},
                {text:y.reduced_weight, style:'jap'},
                {text:y.item_name, style:'jap'},
                {text:y.verified_weight, style:'jap'},
                {text:y.tare_time, style:'jap'}
                              ]);

           
        });    
          records.push([{text:e.subvendor_name.replace(/\s/g, '') + ' 計', style:'jap_total', colSpan:5},{},{},{},{},
          {text:this.numFormat(e.net_total), style:'total_num'},
          {text:'', style:'jap_total' ,colSpan: 3},{},{},
          {text:this.numFormat(e.verified_total), style:'total_num', colSpan:2},{}]);
   });
   
   records.push([{text:'合計', style:'jap_ototal',colSpan:5},{},{},{},
   {text:this.numFormat(this.ledger_count) +' 件', style:'ototal_num'},
   {text:this.numFormat(this.netw_total), style:'ototal_num'},
   {text:'', style:'ototal_num', colSpan:3},{},{},
   {text:this.numFormat(this.verifiedw_total), style:'ototal_num', colSpan:2},{}]);
   records.push([{text:' ',colSpan: 11}])
   
   pdf_objarr.push([{
      table: {
          headerRows : 1,
          body:records,
              widths: ['*',25,25,'auto','*','*',20,'*','*','*','*']
      }, layout:'lightHorizontalLines'
    }]);
   var fd = this.from_date;
   var td = this.to_date;
   var vendor = this.vendor_name.replace(/\s/g, '');
   var ship = this.subvendor_name.replace(/\s/g, '');
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
                   columns:[{text: '納入業者:' + vendor + ' / 船名 : '+ ship, style: 'jap', alignment:'left', margin:[15,10,0,10] },
                           {text: '管理用元帳', style:'jap', fontSize:12, alignment: 'center'},
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