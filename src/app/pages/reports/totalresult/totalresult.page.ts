import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { AuthguardService } from '../../../services/authguard.service';
import { Events }  from '@ionic/angular';
import { trigger, state, style, animate, transition } from '@angular/animations';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { text } from '../../../../../node_modules/@angular/core/src/render3';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-totalresult',
  templateUrl: './totalresult.page.html',
  styleUrls: ['./totalresult.page.scss'],
  animations: [
    trigger('changeState', [
      state('state1', style({
        backgroundColor: 'green',
        transform: 'scale(1)'
      })),
      state('state2', style({
        backgroundColor: 'red',
        transform: 'scale(1.5)'
      })),
      transition('*=>state1', animate('300ms')),
      transition('*=>state2', animate('2000ms'))
    ])
    ]
})
export class TotalresultPage implements OnInit {

  
 constructor(private reportAPI : ReportService, private route : ActivatedRoute, private router : Router, private authGuard : AuthguardService, public events : Events) {
    events.subscribe('totalResult', () => {
      this.ngOnInit();
    });
 } 
 

  
  provider_id ;
  vendor_code;
  ship_code;
  vendor_name;
  ship_name;
  from_date;
  to_date;
  ship_trader;
  
  lblResult = '';
  unitTotal = 0;
  netTotal  = 0;
  weightTotal = 0;
  r1Total  = 0;
  r2Total  = 0;
  r3Total  = 0;
  r4Total  = 0;
  
  
  result = [];
  array = [];
  
  hide_btndl = true;
  total_only = false;
  
  ngOnInit() {
    //  var data = {
    //   "provider_id":"5",
    //   "vendor_code":"5",
    //   "ship_code":"5",
    //   "from_date" : "20190105",
    //   "to_date" : "20190605",
    //   "ship_trader" : "1"}

      this.getParams();
      
      
      if(this.provider_id && this.vendor_code && this.ship_code && this.from_date && this.to_date && this.ship_trader) {
              var data = {
                  "provider_id": this.provider_id,
                  "vendor_code": this.vendor_code,
                  "ship_code": this.ship_code,
                  "from_date" : this.from_date,
                  "to_date" : this.to_date,
                  "ship_trader" : this.ship_trader}
                
            this.reportAPI.getTotalResult(data).subscribe(res =>{
                if(res) {
                  if(res.status != '401') {
                      if(res.data.length > 0) {        
                          this.array = res.data;
                          this.array.sort((a,b) => (a.weighing_no > b.weighing_no) ? 1: -1);
                          this.array.forEach(element => {
                            element.selected=false;
                          });
                          this.formatTimestring();
                          this.formatDatestring();
                          this.vendor_grouping();               
                          this.hide_btndl = false;
                          this.lblResult = '';
                      }else{
                          this.lblResult = 'レコードが見つかりません';
                          this.hide_btndl = true;
                      }

                  }else{
                    this.authGuard.logout();
                    this.router.navigate(['/login'], {queryParams : {url: '/totalresult', topic: 'totalResult'}});

                  }
                }
            });
      }else{
         this.lblResult = '無効なパラメータ';
      }
    

  }
  
  ngOnDestroy(): void {
      this.events.unsubscribe('totalResult');
  }
  
  getParams() {
    this.route.queryParams.subscribe(qparams => {
      // && qparams.vendor_name && qparams.ship_name 
      if(qparams.provider_id && qparams.vendor_code && qparams.ship_code && qparams.from_date && qparams.to_date) {
        this.provider_id = qparams.provider_id;
        this.vendor_code = qparams.vendor_code;
        this.ship_code = qparams.ship_code;
        this.vendor_name = qparams.vendor_name;
        this.ship_name = qparams.ship_name;
        this.from_date = qparams.from_date;
        this.to_date = qparams.to_date;
        
        if(qparams.ship_trader) { 
          this.ship_trader = qparams.ship_trader;
           this.ship_name = this.ship_name; //  + '(業者)' ;
        }
      }
    });

  }
  
  vendor_grouping() {
    var vendors = new Set(this.array.map(item => item.vendor_code));
    this.result = [];

    vendors.forEach(v_code => {
       var sub = [];
       var sublist = this.subGrouping(v_code);

              sublist.forEach(s_code =>{
                  var obj_sub = {};
                    
                  obj_sub = {subvendor: s_code , subvendor_name: this.subFilter(s_code),values: this.subValues(v_code,s_code), 
                            gross_total: this.subvTotal(v_code,s_code,'gross_weight'),
                            unit_count: this.UnitCount(v_code,s_code),
                            tare_total: this.subvTotal(v_code,s_code,'tare_weight'),
                            net_total: this.subvTotal(v_code,s_code,'net_weight'),
                            weight_total: this.subvTotal(v_code,s_code,'weight'),
                            r1_total: this.subvTotal(v_code,s_code,'rank_1'),
                            r2_total: this.subvTotal(v_code,s_code,'rank_2'),
                            r3_total: this.subvTotal(v_code,s_code,'rank_3'),
                            r4_total: this.subvTotal(v_code,s_code,'rank_4'),
                            hidden: false,
                         
                          };
                  sub.push(obj_sub);

                });
        
        this.result.push({vendor: v_code, vendor_name: this.vendorFilter(v_code) , values: sub,
                          vgross_total: this.vTotal(v_code,'gross_weight'),
                          vunit_count: this.UnitCount(v_code,'none'),
                          vtare_total: this.vTotal(v_code,'tare_weight'),
                          vnet_total: this.vTotal(v_code,'net_weight'),
                          vweight_total: this.vTotal(v_code,'weight'),
                          vr1_total: this.vTotal(v_code,'rank_1'),
                          vr2_total: this.vTotal(v_code,'rank_2'),
                          vr3_total: this.vTotal(v_code,'rank_3'),
                          vr4_total: this.vTotal(v_code,'rank_4'),
                          selected: false,
                         });
      });
          
      
      this.unitTotal = this.UnitCount('all', 'all') || 0 ;
      this.netTotal = this.overallTotal('net_weight') || 0;
      this.weightTotal = this.overallTotal('weight') || 0;
      this.r1Total = this.overallTotal('rank_1') || 0;
      this.r2Total = this.overallTotal('rank_2') || 0;
      this.r3Total = this.overallTotal('rank_3') || 0;
      this.r4Total = this.overallTotal('rank_4') || 0;
      
  }


  subGrouping(v) {
    var sub_group = [];
    var subvendors = new Set(this.array.map(item => item.subvendor_code ));
    subvendors.forEach(s=> {   
      for(var x = 0; x < this.array.length; x ++) {
          if(this.array[x].subvendor_code == s && this.array[x].vendor_code == v ) {     
                if(sub_group.indexOf(s) !== -1) {          
                }else{
                  sub_group.push(s);
                }             
          }     
      }  
    });
     return sub_group;
  }

  subValues(v,s) {
      var arr = [];
     for (let x = 0; x < this.array.length; x++) {
           if(this.array[x].subvendor_code == s && this.array[x].vendor_code == v ) {
             var obj = {};
               obj = this.array[x];
               arr.push(obj);
           }  
     }
    return arr;
  }

  
  // Total Calculations /////////////////////////////////////////////////////////////
  
  vTotal(v,field) {
    var vendor_total = 0;
    for (let x = 0; x < this.array.length; x++) {
          if(this.array[x].vendor_code == v ) {   
            vendor_total = vendor_total + this.array[x][field];    
          }  
    }
    return vendor_total;
  }

  
  subvTotal(v,s,field) {
    var subvendor_total = 0;
    for (let x = 0; x < this.array.length; x++) {
          if(this.array[x].subvendor_code == s && this.array[x].vendor_code == v ) {   
            subvendor_total = subvendor_total + this.array[x][field];    
          }  
    }
    return subvendor_total;
  }
  
  
  UnitCount(v,s) {
    var counter = 0;
   
    if(v == 'all' && s== 'all' ) {
      for (let x = 0; x < this.array.length; x++) {
          counter = counter + 1;  
      }
    }
    // For Vendor
    if(s == 'none') {
      for (let x = 0; x < this.array.length; x++) {
        if(this.array[x].vendor_code == v ) {
          counter = counter + 1;  
        }  
      }
    }
    
    // For Ship
    if(v != 'all' && s != 'all' && s != 'none') {
      for (let x = 0; x < this.array.length; x++) {
        if(this.array[x].subvendor_code == s && this.array[x].vendor_code == v ) {
          counter = counter + 1;  
        }  
      }
    }
 
    return counter;
  }
  
  
  overallTotal(field) {
    var allTotal = 0;
    for (let x = 0; x < this.array.length; x++) {      
        allTotal = allTotal + this.array[x][field];   
    }
    return allTotal;
  }
  
  
  selectAll(val,vendor){ 
      this.array.forEach(element => {
        if(element.vendor_code == vendor){
          element.selected = val;
        }
      });
  }
  
  //Format and Filtering/////////////////////////////////////////////////////////////
  
  formatTimestring() {
    for (let x = 0; x < this.array.length; x++) {
      var stringtime = String(this.array[x].weighing_time);
      
      if(stringtime.length == 3) {
        stringtime = '0' + stringtime;
      }
      
      if(this.array[x].weighing_time  || this.array[x].weighing_time != '') {
          var  newtime = stringtime.substring(0,2) +':'+ stringtime.substring(2,4);
          this.array[x].weighing_time = newtime;
      }
    }
 
  }
  
  formatDatestring() {
    for (let x = 0; x < this.array.length; x++) {
      var string_date = String(this.array[x].delivery_date);
      if(string_date.length == 8) {
        var year =  string_date.substring(0,4);
        var month = string_date.substring(4,6);
        var day = string_date.substring(6,8);
        var  new_datestring = year +'/'+  month +'/'+ day; 
        this.array[x].delivery_date = new_datestring;
      }  
    }
  }
  
  vendorFilter(code) {
    var vendor_name = '';
    var arrFilter = this.array.filter(x => x.vendor_code === code);
    
    vendor_name =arrFilter[0].vendor_name;
    return vendor_name;
  }
    
  subFilter(code) {
    var subvendor_name = '';
    var arrFilter = this.array.filter(x => x.subvendor_code === code);
    
    subvendor_name =arrFilter[0].subvendor_name;
    return subvendor_name;
  }
  
  viewPDF(data2) {
    
    
    var img_header = <HTMLImageElement>document.getElementById('imgToExport2');
    var img_footer = <HTMLImageElement>document.getElementById('imgToExport');
   
    var canvas = document.createElement('canvas');
        canvas.width = img_footer.width; 
        canvas.height = img_footer.height; 
        canvas.getContext('2d').drawImage(img_footer, 0, 0);
    var footer_url = canvas.toDataURL('image/png')
  
    var canvas2 = document.createElement('canvas');
        canvas2.width = img_header.width; 
        canvas2.height = img_header.height;  
        canvas2.getContext('2d').drawImage(img_header, 0, 0);
    var header_url = canvas2.toDataURL('image/png')
    
    var counter = 0;
    var pb = "";
    var pdf_objarr = [];
    var sel_count = 0;
    var sel_counter = 0;
    
    // Count checked/selected  row  ///////////////////////////
    this.array.forEach(sel_data => {
      if(sel_data.selected){
        sel_count = sel_count + 1;
      }
    });
    
    
    if(sel_count === 0){
      // No checked/selected row
      return;
    }
    
    this.array.forEach(data => {
  
      if(data.selected){
      
        sel_counter = sel_counter + 1;
        counter = counter + 1;

        if(counter == 3){
          if(sel_counter == sel_count){
            pb = "";
          }else{
            pb = "after";
          }
          counter = 0;
        }else{
          pb = "";
        }
        
        pdf_objarr.push([ 
          {  
            table: {
              widths: [510],
              body: [
                    [
                      {
                        stack: [
                          { columns:[  {image: header_url,width: 300, height:40,fit: [180, 180], margin:[0,10,0,5]},{text:"	伝票No."+data.weighing_no,style: 'trow'} ]},
                            // text:'計量証明書', style: 'header' },
                                { columns: [
                                            {
                                                table: {
                                                        widths:[ 55,200],
                                                        heights: [15,15,15,15,15,15,15,15],
                                                        body: [   
                                                              [{text:'船名',    style: 'trow'}, {text:this.ship_name,      style: 'trow'}],
                                                              [{text:'納入業者', style: 'trow'}, {text:this.vendor_name,    style: 'trow'}],
                                                              [{text:'代納業者', style: 'trow'}, {text:data.subvendor_name, style: 'trow'}],
                                                              // [{text:'品名 1',  style: 'trow'}, {text:data.r1_name + '      ' +  this.numFormat(data.rank_1) + ' kg', style: 'trow'}],
                                                              // [{text:'品名 2',  style: 'trow'}, {text:data.r2_name + '      ' + this.numFormat(data.rank_2) + ' kg',  style: 'trow'}],
                                                              // [{text:'品名 3',  style: 'trow'}, {text:data.r3_name + '      ' + this.numFormat(data.rank_3) + ' kg',  style: 'trow'}],
                                                              // [{text:'品名 4',  style: 'trow'}, {text:data.r4_name + '      ' + this.numFormat(data.rank_4) + ' kg',  style: 'trow'}]
                                                              [{text:'品名 1',  style: 'trow'},  [{columns: [ {text:data.item_1,  style: 'trow'}, {text:this.numFormat(data.rank_1) + ' kg',  style: 'trow'}]}]  ],   
                                                              [{text:'品名 2',  style: 'trow'},  [{columns: [ {text:data.item_2,  style: 'trow'}, {text:this.numFormat(data.rank_2) + ' kg',  style: 'trow'}]}]  ],     
                                                              [{text:'品名 3',  style: 'trow'},  [{columns: [ {text:data.item_3,  style: 'trow'}, {text:this.numFormat(data.rank_3) + ' kg',  style: 'trow'}]}]  ], 
                                                              [{text:'品名 4',  style: 'trow'},  [{columns: [ {text:data.item_4,  style: 'trow'}, {text:this.numFormat(data.rank_4) + ' kg',  style: 'trow'}]}]  ]
                                                                                                      
                                                              ],                                      
                                                        }, width: 300
                                            },
                                            {
                                                table: {
                                                        widths:[ 60,100],
                                                        heights: [20,20,20,20,20],
                                                        body: [
                                                              [{text:'総重量',    style: 'trow2'},  {text:this.numFormat(data.gross_weight)   + ' kg', style: 'trow2'}],
                                                              [{text:'空車重量',  style: 'trow2'},  {text:this.numFormat(data.tare_weight)    + ' kg',  style: 'trow2'}],
                                                              [{text:'正味重量',  style: 'trow2'},  {text:this.numFormat(data.net_weight)     + ' kg',  style: 'trow2'}],
                                                              [{text:'スケール引', style: 'trow2'}, {text:this.numFormat(data.reduced_weight) + ' kg',  style: 'trow2'}],
                                                              [{text:'取引重量',   style: 'trow2'}, {text:this.numFormat(data.weight)         + ' kg',  style: 'trow2'}],
                                                              ]
                                                        }
                                            }
                                  ]},
                                { columns: [
                                            {image: footer_url,width: 300, height:30,fit: [150, 150], margin:[0,10,0,5]},
                                            {
                                                table: {
                                                        widths:[ 60,100],
                                                        heights: [20],
                                                        body: [
                                                              [{text:'総重量', style: 'trow2'}, {text:data.inspector || '',  style: 'trow'}]
                                                              ]
                                                }
                                            }
                                            ],alignment:'justify'
                                }   
                        ], margin:[15,5,15,5]
                      },
                    ]
              ]
            },layout: {
              hLineStyle: function (i, node) {
                // return {dash: {length: 10, space: 4}};
                return {dash: {length: 4}};
              },
              vLineStyle: function (i, node) {
                return {dash: {length: 4}};
              },
            },pageBreak: pb
          }
        ]);
      }
    }); 
    
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    
    pdfMake.fonts = {
      IPAgothic: {
          normal:      'ipagp.ttf',
          bold:        'ipagp.ttf',
          italics:     'ipagp.ttf',
          bolditalics: 'ipagp.ttf'
      },
      IPAmincho: {
          normal:      'ipamp.ttf',
          bold:        'ipamp.ttf',
          italics:     'ipamp.ttf',
          bolditalics: 'ipamp.ttf'
      },
      Roboto : {
          normal:      'Roboto-Regular.ttf',
          bold:        'Roboto-Medium.ttf',
          italics:     'Roboto-Italic.ttf',
          bolditalics: 'Roboto-Italic.ttf'
      },
    }

    // Margin is  margin : [left,top,right,bottom]

    

  
    var docDefinition = {
      
        content: pdf_objarr,
        styles: {
          header: {
            fontSize: 15,
            font: 'IPAgothic',
            margin: [0, 5, 0, 10]
          }
          ,
          'jap': {
            font: 'IPAgothic',
          },
          trow: {
            margin: [0,2,0,0],
            font: 'IPAgothic',          
          },
          trow2: {
            margin: [0,5,10,0],
            font: 'IPAgothic',
            alignment: 'right'
          }
        
        },
        defaultStyle: {
          fontSize: 10
        }
    }

    pdfMake.createPdf(docDefinition).open();
  }

  buildTableBody(data, columns, headers) {
  var body = [];
  body.push(headers);
  
  data.forEach(function(row) {
      var dataRow = [];

      columns.forEach(function(column) {
        if(column == 'dayofweek'){
          dataRow.push({text:row[column].toString(), style: 'tableExample' });
        }else{
          dataRow.push(row[column].toString());
        }         
      })
      
      body.push(dataRow);
  });
  return body;
  }

  table(data, columns) {
  let  headers = [{text:'日', style: 'header'},
                {text:'曜日', style: 'header'}];
  
  return {
      table: {
          headerRows: 1,
          body: this.buildTableBody(data, columns, headers)
      }
  };
  }

  downloadCSV() {
    var fname = '管理用実績集計' +  '_' + this.from_date  + '_' + this.to_date;
    if(this.array.length > 0) {
      const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: '管理用実績集計',
        filename: fname,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      };
     
      const csvExporter = new ExportToCsv(options);  
      csvExporter.generateCsv(this.array);
    }  
  }
  
  toggle_sub(v_index,sub_index){
  
      if( this.result[v_index].values[sub_index].hidden ){
        this.result[v_index].values[sub_index].hidden = false;
     
      }else{
        this.result[v_index].values[sub_index].hidden = true;
    
      }
  }
  
  toggle_main(){
    
   var val = false;
    if (!this.total_only){
      val = true;
    }
    for (let index = 0; index <   this.result.length; index++) {
        for(  let c of this.result[index].values)  {
          c.hidden = val;
        }
    } 
  }
  
  numFormat(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
}




