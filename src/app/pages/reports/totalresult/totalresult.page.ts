import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { AuthguardService } from '../../../services/authguard.service';
import { Events }  from '@ionic/angular';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
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

 constructor(private reportAPI : ReportService, 
             private route : ActivatedRoute, 
             private router : Router, 
             private authGuard : AuthguardService, 
             public events : Events) {
               
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
  no_color = false;
  old_report = false;
  
  ngOnInit() {
    this.getParams();
    
    if(this.provider_id && this.vendor_code && this.ship_code && this.from_date && this.to_date && this.ship_trader) {
            var data = {
                    "provider_id": this.provider_id,
                    "vendor_code": this.vendor_code,
                    "ship_code": this.ship_code,
                    "from_date" : this.from_date,
                    "to_date" : this.to_date,
                    "ship_trader" : this.ship_trader}
              
          this.reportAPI.getTotalResult(data).subscribe(res => {
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
                    } else {
                        this.lblResult = 'レコードが見つかりません';
                        this.hide_btndl = true;
                    }

                } else {
                  this.authGuard.logout();
                  this.router.navigate(['/login'], {queryParams : {url: '/totalresult', topic: 'totalResult'}});
                }
              }
          });
    } else {
        this.lblResult = '無効なパラメータ';
    }
  }
  
  ngOnDestroy(): void {
      this.events.unsubscribe('totalResult');
  }
  
  getParams() {
    this.route.queryParams.subscribe(qparams => {
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
    subvendors.forEach(s => {   
      for(var x = 0; x < this.array.length; x ++) {
        if(this.array[x].subvendor_code == s && this.array[x].vendor_code == v ) {     
          if(sub_group.indexOf(s) !== -1) {          
          } else {
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

  
  subvTotal(v, s, field) {
    var subvendor_total = 0;
    for (let x = 0; x < this.array.length; x++) {
      if(this.array[x].subvendor_code == s && this.array[x].vendor_code == v ) {   
        subvendor_total = subvendor_total + this.array[x][field];    
      }  
    }
    return subvendor_total;
  }
  
  
  UnitCount(v, s) {
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
  
  
  selectAll(val,vendor) { 
    this.array.forEach(element => {
      if(element.vendor_code == vendor) {
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
    
    vendor_name = arrFilter[0].vendor_name;
    return vendor_name;
  }
    
  subFilter(code) {
    var subvendor_name = '';
    var arrFilter = this.array.filter(x => x.subvendor_code === code);
    
    subvendor_name = arrFilter[0].subvendor_name;
    return subvendor_name;
  }
  
  exportPDF() {
    var pdf_objarr = [];
    var bottom_border = [false,false,false, true];
    var no_border = [false,false,false, false];
    var empty_n = {text:' ', style:'jap', border: no_border};
    var empty_t2 = {text:' ', fillColor: '#c8c8c8' , border: bottom_border};
    var empty_ot = {text:' ', fillColor:  this.no_color ? '#c8c8c8' : '#cfe8fb' , border: bottom_border};
    var records = [];
     
    var header= [{text:'代納業者', style:'jap_header', border:bottom_border},
                 {text:'車番',     style:'jap_header', border:bottom_border},
                 {text:'グループ',  style:'jap_header',  border:bottom_border},
                 {text:'総重',      style:'jap_header', border:bottom_border},
                 {text:'自重',      style:'jap_header', border:bottom_border},
                 {text:'正味',      style:'jap_header',  border:bottom_border},
                 {text:'ダスト',    style:'jap_header', border:bottom_border},
                 {text:'実正味',    style:'jap_header', border:bottom_border},
                 {text:'ランク１',  style:'jap_header', border:bottom_border},
                 {text:'ランク２',  style:'jap_header', border:bottom_border},
                 {text:'ランク３',  style:'jap_header', border:bottom_border},
                 {text:'ランク４',  style:'jap_header', border:bottom_border},
                 {text:'日時',     style:'jap_header', border:bottom_border},
                 {text:'伝票No.',  style:'jap_header', border:bottom_border},
                ];
                
    var counter = 0;
    this.result.forEach( data => {
      counter = counter + 1;

      if(counter == 1) {
       
          records.push(header);
      }
       records.push([{text:data.vendor_name, style:'jap', colSpan:14, fontSize:10}]);
      
      data.values.forEach(detail => {
        
          var counter_2 = 0;
          detail.values.forEach(e => {
              counter_2 = counter_2 + 1;
              var ship = ' ';
              if(counter_2 == 1){
                ship = detail.subvendor_name;
              }
              
              records.push([{text:ship, font:'IPAgothic', margin:[3,5,5,0], fontSize:8, color: this.no_color ?  '' : '#185c21', border:no_border},
                    {text:e.car_no,                                 style:'jap', border:bottom_border},
                    {text:e.group_name,                             style:'jap', border:bottom_border},
                    {text:(e.gross_weight).toLocaleString('en'),    style:'jap_number',fillColor:  this.no_color ? '' : '#e6ffe6' },
                    {text:(e.tare_weight).toLocaleString('en'),     style:'jap_number',fillColor:  this.no_color ? '' : '#ffffe6' },
                    {text:(e.net_weight).toLocaleString('en'),      style:'jap_number',fillColor:  this.no_color ? '' : '#ffeee6' },
                    {text:(e.reduced_weight).toLocaleString('en'),  style:'jap_number',fillColor:  this.no_color ? '' : '#ffe6e6' },
                    {text:(e.weight).toLocaleString('en'),          style:'jap_number',fillColor:  this.no_color ? '' : '#e6ffff' },
                    {text:(e.rank_1).toLocaleString('en'),          style:'jap_number'},
                    {text:(e.rank_2).toLocaleString('en'),          style:'jap_number'},
                    {text:(e.rank_3).toLocaleString('en'),          style:'jap_number'},
                    {text:(e.rank_4).toLocaleString('en'),          style:'jap_number'},
                    {text:e.delivery_date,                          style:'jap', border:bottom_border},
                    {text:e.weighing_no,                            style:'jap_number'},
                    ]);     
                    
        });
        records.push([
                {text:detail.subvendor_name.replace(/\s/g, '') + '計', colSpan:4, style:'jap_total', border:bottom_border}, empty_t2, empty_t2, empty_t2,
                {text:(detail.unit_count).toLocaleString('en'),     style:'total_num'},
                {text:(detail.net_total).toLocaleString('en'),      style:'total_num'}, empty_t2,
                {text:(detail.weight_total).toLocaleString('en'),   style:'total_num'},
                {text:(detail.r1_total).toLocaleString('en'),       style:'total_num'},
                {text:(detail.r2_total).toLocaleString('en'),       style:'total_num'},
                {text:(detail.r3_total).toLocaleString('en'),       style:'total_num'},
                {text:(detail.r4_total).toLocaleString('en'),       style:'total_num'},
                {text:' ', colSpan:2,                               style:'total_num'}, empty_t2
                ]);   
         
      });
      
      // Set Overall Total ...........................................................................................
      if(counter == this.result.length) {
        records.push([empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,empty_n,])
        records.push([
          {text:' ', colSpan:4, style:'jap_ototal', border:bottom_border}, empty_ot, empty_ot, empty_ot,
          {text:'台数', style:'jap_ototal', border:bottom_border},
          {text:'正味重量', style:'jap_ototal', border:bottom_border}, empty_ot,
          {text:'実正味重量	', style:'jap_ototal', border:bottom_border},
          {text:'ランク１', style:'jap_ototal', border:bottom_border},
          {text:'ランク２', style:'jap_ototal', border:bottom_border},
          {text:'ランク３', style:'jap_ototal', border:bottom_border},
          {text:'ランク４', style:'jap_ototal', border:bottom_border},
          {text:' ', colSpan:2, style:'jap_ototal', border:bottom_border}, empty_ot
          ]);   
   
          
        records.push([
          {text:'全ての納入業者計', colSpan:4, font:'IPAgothic', fontSize:10, margin:[3,5,5,0], border:bottom_border},'','','',
          {text:(data.vunit_count).toLocaleString('en'),    style:'ototal_num'},
          {text:(data.vnet_total).toLocaleString('en'),      style:'ototal_num'},'',
          {text:(data.vweight_total).toLocaleString('en'),   style:'ototal_num'},
          {text:(data.vr1_total).toLocaleString('en'),       style:'ototal_num'},
          {text:(data.vr2_total).toLocaleString('en'),       style:'ototal_num'},
          {text:(data.vr3_total).toLocaleString('en'),       style:'ototal_num'},
          {text:(data.vr4_total).toLocaleString('en'),       style:'ototal_num'},
          {text:' ', colSpan:2,                              style:'ototal_num'},''
          ]);   
          records.push([{text:' ',colSpan: 14}])
      }
    });
    
    
    pdf_objarr.push([{
      table: {
          headerRows : 1,
          body:records,
               widths: ['*','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto']
      }, layout:'lightHorizontalLines'
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
      // {text: '管理用実績集計', style:'jap', fontSize:12, alignment: 'center'},
      var docDefinition = {
          pageOrientation: 'landscape',
          
          header: function(currentPage, pageCount) {
              return { 
                      columns:[{text: '納入業者:' + vendor + ' / 代納業者 : '+ ship, style: 'jap', alignment:'left', margin:[15,10,0,10] },
                              {text: '業者別明細表', style:'jap', fontSize:12, alignment: 'center'},
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
            total_num:  {font: 'Roboto', fontSize:8, fillColor: '#c8c8c8', bold:true, alignment:'right', margin:[0,5,10,0], border:bottom_border},
            jap_ototal: {font: 'IPAgothic', fontSize:8, fillColor: this.no_color ? '#c8c8c8' :'#cfe8fb', bold:true , alignment:'right', margin:[0,5,5,0]},
            ototal_num: {font: 'Roboto', fontSize:8, bold:true, alignment:'right', margin:[0,5,5,0], border:bottom_border},
          },
          defaultStyle: {
            fontSize: 7
          }
      }
      
      pdfMake.createPdf(docDefinition).open();
  
  }
  
  viewPDF() {
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
    
    
    if(sel_count === 0) {
      // No checked/selected row
      return;
    }
    // console.log(this.array);
    this.array.forEach(data => {
      
      //scale device
      var scale_device = '';
      if(data.scale_device){
         scale_device = (data.scale_device == 2) ? 'TAI1413 秤量 (目量) : 90t(20t)': 'TAD0451 秤量 (目量) : 90t(20t)' 
      }
      // scale_device = (data.scale_device == 1) ? 'TAI1413 体量 (目量) : 90t(20t)': 'TAD0451 体量 (目量) : 90t(20t)' ;
      var dd = data.weighing_date;

      var d_y = String(dd).substring(0,4);
      var d_m = String(dd).substring(4, 6);
      var d_d = String(dd).substring(6, 9);
   
      if(data.selected) {
        var tr_time = '';
        var gr_time = '';
   
        
        if(data.gross_time != 0) {
          let temp = ("0" + data.gross_time).slice(-4);
          gr_time =temp.substr(0,2) + ':' + temp.substr(2,4) ;
        }
      
        if(data.tare_time != 0) {
          let temp = ("0" + data.tare_time).slice(-4);
          tr_time =temp.substr(0,2) + ':' + temp.substr(2,4) ;
        }

        sel_counter = sel_counter + 1;
        counter = counter + 1;

        if(counter == 3) {
          if(sel_counter == sel_count) {
            pb = "";
          } else {
            pb = "after";
          }
          counter = 0;
        } else {
          pb = "";
        }
        
        pdf_objarr.push([ 
          {  
            table: {
              widths: [470],
              body: [
                    [
                      {stack:[
                          {columns:[{image: header_url, width:240, height:40,fit: [200,180], margin:[30,10,0,5]}, {text:scale_device, margin:[0,30,0,0], font: 'IPAgothic', fontSize: 7, }]},
                                {columns:[
                                            {
                                              table: {
                                                      widths:[ 55,180],
                                                      heights: [10,10,10,10,10,10,10,10],
                                                      body: [   
                                                            [{text:'日付 / 車番',   style: 'trow'}, {text:d_y + ' . ' + d_m + ' . ' + d_d + '    ' + '   No.:   '+data.weighing_no + '    /  ' + ' 車番:   ' + data.car_no,   style: 'trow'}],
                                                            [{text:'船名 • 置場名',  style: 'trow'}, {text:this.ship_name,      style: 'trow'}],
                                                            [{text:'納入業者',       style: 'trow'}, {text:this.vendor_name,    style: 'trow'}],
                                                            [{text:'代納業者',       style: 'trow'}, {text:data.subvendor_name, style: 'trow'}],   
                                                            [{text:'品名 1',  style: 'trow'},  [{columns: [ {text:data.item_1,  style: 'trow'}, {text:data.rank_1 == 0 ? ' ' : this.numFormat(data.rank_1) + ' kg',  style: 'trow'}]}]  ],   
                                                            [{text:'品名 2',  style: 'trow'},  [{columns: [ {text:data.item_2,  style: 'trow'}, {text:data.rank_2 == 0 ? ' ' : this.numFormat(data.rank_2) + ' kg',  style: 'trow'}]}]  ],     
                                                            [{text:'品名 3',  style: 'trow'},  [{columns: [ {text:data.item_3,  style: 'trow'}, {text:data.rank_3 == 0 ? ' ' : this.numFormat(data.rank_3) + ' kg',  style: 'trow'}]}]  ], 
                                                            [{text:'品名 4',  style: 'trow'},  [{columns: [ {text:data.item_4,  style: 'trow'}, {text:data.rank_4 == 0 ? ' ' : this.numFormat(data.rank_4) + ' kg',  style: 'trow'}]}]  ]
                                                                                              
                                                            ],                                      
                                                      }, width: 260, layout :{   
                                                                              hLineWidth: function (i, node) {
                                                                                return .5;
                                                                              },
                                                                              vLineWidth: function (i, node) {
                                                                                return .5;
                                                                              },
                                                                              hLineColor: function (i, node) {
                                                                                return 'gray';
                                                                              },
                                                                              vLineColor: function (i, node) {
                                                                                return 'gray';
                                                                              }
                                                                            }
                                            },
                                            {
                                              table: {
                                                      widths:[ 50,70,35],
                                                      heights: [10,10,10,10,10,10,25],
                                                      body: [
                                                            [{text:'総重量',    style: 'trow'},  {text:this.numFormat(data.gross_weight)   + ' kg', style: 'trow2',border:[true,true,false,true]},{text:gr_time,style: 'trow2', border:[false,true,true,true]}],
                                                            [{text:'空車重量',  style: 'trow'},  {text:this.numFormat(data.tare_weight)    + ' kg',  style: 'trow2',border:[true,true,false,true]},{text:tr_time,style: 'trow2', border:[false,true,true,true]}],
                                                            [{text:'正味重量',  style: 'trow'},  {text:this.numFormat(data.net_weight)     + ' kg',  style: 'trow2',border:[true,true,false,true]},{text:'', border:[false,true,true,true]}],
                                                            [{text:'スケール引', style: 'trow'}, {text:this.numFormat(data.reduced_weight) + ' kg',  style: 'trow2',border:[true,true,false,true]},{text:'', border:[false,true,true,true]}],
                                                            [{text:'取引重量',   style: 'trow'}, {text:this.numFormat(data.weight)         + ' kg',  style: 'trow2',border:[true,true,false,true]},{text:'', border:[false,true,true,true]}],
                                                            [{text:'検収者', style: 'trow'}, {text:data.inspector || '',  style: 'trow', colSpan:2},''],
                                                            [{text:' 特記事', style: 'trow'}, {text:data.remarks || '',  style: 'trow', colSpan:2},'']
                                                            ]
                                                      }, layout :{   
                                                                    hLineWidth: function (i, node) {
                                                                    return .5;
                                                                  },
                                                                  vLineWidth: function (i, node) {
                                                                    return .5;
                                                                  },
                                                                  hLineColor: function (i, node) {
                                                                    return 'gray';
                                                                  },
                                                                  vLineColor: function (i, node) {
                                                                    return 'gray';
                                                                  }
                                                                }
                                            }
                                          ]},
                                { columns:[{image: footer_url, width:300, height:30, fit: [200,150], margin:[0,1,0,5]}], alignment:'justify'}   
                        ], margin:[15,5,15,5]
                      },
                    ]
              ]
            },layout: {
              hLineStyle: function (i, node) {
                // return {dash: {length: 10, space: 4}};
                return {dash: {length: 2}};
              },
              vLineStyle: function (i, node) {
                return {dash: {length: 2}};
              },
              hLineWidth: function (i, node) {
                return .5;
              },
              vLineWidth: function (i, node) {
                return 0;
              },
              hLineColor: function (i, node) {
                return 'gray';
              },
              vLineColor: function (i, node) {
                return 'gray';
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
          header: {font: 'IPAgothic', fontSize: 15, margin:[0,5,0,10]},
          jap: { font: 'IPAgothic'},
          trow: {font: 'IPAgothic', margin: [0,2,0,0]},
          trow2: {font: 'IPAgothic',alignment:'right', margin:[0,2,10,0]}
        },
        defaultStyle: {
          fontSize: 8
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
          if(column == 'dayofweek') {
            dataRow.push({text:row[column].toString(), style: 'tableExample' });
          } else {
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
    let new_arr = [];
    let header = [];
    if(!this.old_report){
       header = ['日付', 	'伝票No.','配送日','検収者', 'コード_グループ', 'グループ', 'コード_納入業者','納入業者', 'コード_代納業者' ,'代納業者','車番','総重量',	'空車重量',	'正味重量',	 'ダスト','実正味' ,'総重量時間', '空車重量時間' ,'特記事', '時間', 'ランク１重量' ,	'ランク２重量' , 	'ランク３重量',	'ランク４重量','品名1', '品名2', '品名3', '品名4' 	];
      new_arr = this.array;
      new_arr.forEach(function(v){ delete v.scale_device, delete v.selected });
    }else{
      header = ['納入業者','代納業者','車番', `グループ`,'総重量',	'空車重量','ダスト',	'実正味重量',	'ランク１重量' ,	'ランク２重量' , 	'ランク３重量',	'ランク４重量',	'日付', '時間',	'伝票No.'	];
      for (let index = 0; index < this.array.length; index++) {
        let new_obj = {};
        new_obj['vendor_name'] = this.array[index].vendor_name;
        new_obj['subvendor_name'] = this.array[index].subvendor_name;
        new_obj['car_no'] = this.array[index].car_no;
        new_obj['group_name'] = this.array[index].group_name;
        new_obj['gross_weight'] = this.array[index].gross_weight;
        new_obj['tare_weight'] = this.array[index].tare_weight;
        new_obj['reduced_weight'] = this.array[index].reduced_weight;
        new_obj['net_weight']= this.array[index].net_weight;
        new_obj['rank_1'] = this.array[index].rank_1;
        new_obj['rank_2'] = this.array[index].rank_2;
        new_obj['rank_3'] = this.array[index].rank_3;
        new_obj['rank_4'] = this.array[index].rank_4;
        new_obj['weighing_date'] = this.array[index].weighing_date;
        new_obj['weighing_time'] = this.array[index].weighing_time;
        new_obj['weighing_no']= this.array[index].weighing_no;
        
        new_arr.push(new_obj);
      }
      
    }
   

    
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
            // useKeysAsHeaders: true,
            headers: header
      };
     
      const csvExporter = new ExportToCsv(options);  
      csvExporter.generateCsv(new_arr);
    }  
  }
  
  toggle_sub(v_index,sub_index) {
      if( this.result[v_index].values[sub_index].hidden ) {
        this.result[v_index].values[sub_index].hidden = false;
      } else {
        this.result[v_index].values[sub_index].hidden = true;
      }
  }
  
  toggle_main() {
    var val = false;
    if (!this.total_only) {
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
  
  weightPercent(percent,net){
    let x = percent / 100;
    let item_weight = net  * percent;
    return item_weight;
    
    
  }
}

