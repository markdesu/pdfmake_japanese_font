import { Injectable } from '@angular/core';
import { HttpParams, HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { CanActivate, Router, ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';

var CryptoJS = require("crypto-js");


const accessURL =  environment.api_address + "/api/access/inspector";

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthguardService implements CanActivate{

  constructor(private http: HttpClient, 
              public router: Router, 
              public route : ActivatedRoute) {}
  
  // User Details
  public user_id    = '';
  public username   = '';
  public name       = '';
  public user_type  = '';
  
  // Customer Details
  public provider_id;
  public customer_id;
  public customer_type;
  public vendor_code;
  public subvendor_code;
  public provider_prefix = '';
  public provider_name = '船積みネット';
  public mycompany = '';

  // User Attributes
  public is_customer_admin = false;
  public is_normal_user = false;
  public is_inspector = false;

  // Authorization 
  public isAuthenticated = false;
  public authorized_items = [];
  public enable_inspector_assign = false;
  public is_systemadmin = false;
  
  // Common Item
  item_000 = { title: 'アカウント設定' , url: '/user-setting', icon:'settings'};
  
  // Menu Items
  item_001 = { title: 'レポート サービス', url: '/generate-report', icon: 'list-box'};
  
  // Management
  item_023 = { title: 'ユーザーの管理', url:'/mng-users' , icon: 'people'};

  // Inspection
  item_004 = { title: 'スキャナ', url: '/qrscanner', icon: 'qr-scanner'};
  item_005 = { title: '着信車', url: '/vehicles', icon: 'bus'};
  item_006 = { title: '検査済み', url: '/inspection-logs', icon: 'paper'};
  
  // Dashboard
  item_007 = { title: 'ダッシュボード', url: '/dashboard', icon: 'apps'};
  
  // System Administrator
  ADM_001 = { title: 'ユーザ管理', url: '/serviceadmin/mng-users', icon: 'people'};
  ADM_002 = { title: '会社情報管理', url: '/serviceadmin/mng-company', icon: 'business'};
  ADM_003 = { title: '契約管理', url: '/serviceadmin/mng-contracts', icon: 'ribbon'};
  

  private authorized_paths = [];
  public session;
  
  
  canActivate(route: ActivatedRouteSnapshot, state : RouterStateSnapshot):boolean {

    if(this.getSessionData()) {
      this.isAuthenticated = true;
      var target_routepath = state.url.split('/')[1] ; 
      var target_routepath2 = state.url.split('?')[0] ; 

      target_routepath = '/' + target_routepath;

      if(this.authorized_paths.some(e => e.url === state.url) 
      || this.authorized_paths.some(e => e.url === target_routepath)  || this.authorized_paths.some(e => e.url ===   target_routepath2)) {
        return true;  
      } else {
        this.router.navigate(['/']);
        return false;  
      }
    } else {   
      route.data = {  data: 'entity' };
      this.router.navigate(['/login'], {queryParams : {url: state.url}});
      this.isAuthenticated = false;  
      return false;    
    }
  }
  
 
  getSessionData() {
    const sessionData = localStorage.getItem('Session');
    if(sessionData) {
      try {
        var bytes = CryptoJS.AES.decrypt(sessionData.toString(), '123');
        var decryptedData1 = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        var decryptedData; 
      } catch {
        console.log('Session Data is invalid.');
        this.logout();
        return;
      }
    
      // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if(decryptedData1.length > 1) {
 
        var prov = localStorage.getItem('Provider_Prefix');

        if(prov) {
          let index = decryptedData1.findIndex(x => x.prefix == prov);
          var decryptedData = decryptedData1[index];
        } else {
          var decryptedData = decryptedData1[0];
        }
      } else { 
        var decryptedData = decryptedData1[0];
      }

      //Session Obj   
      this.session = decryptedData;
  
      //  User Details
      this.user_id          = decryptedData.id;
      this.username         = decryptedData.username;
      this.name             = decryptedData.name;
      this.user_type        = decryptedData.user_type;
      
      //  Customer   Details
      this.provider_id      = decryptedData.provider_id;
      this.customer_id      = decryptedData.customer_id;
      this.customer_type    = decryptedData.customer_type;
      this.vendor_code      = decryptedData.vendor_code;
      this.subvendor_code   = decryptedData.subvendor_code;
      
      
    
      if(decryptedData.company == '' || decryptedData.company == 'na') {
        this.mycompany   = '-';
      } else {
        this.mycompany   = decryptedData.company;
      }
      
      this.provider_prefix  = localStorage.getItem('Provider_Prefix');
      this.provider_name    = localStorage.getItem('Provider');

      // User Attributes
      if(decryptedData.is_admin === 1) {
        this.is_customer_admin = true;
      } else {
        this.is_customer_admin = false;
      }
      
      if(decryptedData.is_inspector === 1) {
        this.is_inspector = true;
      } else {
        this.is_inspector = false;
      }
        
      return true;
      
    } else {
        return false;
    }
  }  


  isLoggedIn() {
    if(this.getSessionData()) {
      this.isAuthenticated = true;
      this.setAuthority();
      return true;
    } else {
      this.isAuthenticated= false;
      return false;
    }
  }
  
  
  logout() {
    var user_class = this.user_type;
    
    localStorage.removeItem('Session');
    localStorage.removeItem('Session_ID');
    localStorage.removeItem('Session_Token');
    localStorage.removeItem('Provider');
    localStorage.removeItem('Provider_Prefix');
    
    this.user_id          = '';
    this.username         = '';
    this.name             = '';
    this.user_type        = '';
    this.provider_id      = '';
    this.customer_type    = '';
    this.vendor_code      = '';
    this.subvendor_code   = '';
    this.provider_prefix  = '';
    this.provider_name    = '船積みネット';
    this.mycompany        = '';
    
    this.is_customer_admin  = false;
    this.is_inspector     = false;
    this.isAuthenticated  = false;
    this.enable_inspector_assign = false;
    
    this.authorized_items = [];

    if(user_class === 'inspector') {
      this.router.navigate(['/inspection/login']);
    } else
    if(user_class === 'system_admin') {
      this.router.navigate(['/serviceadmin/index']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  
  // Menu Item Controll
  
  setAuthority() {
      this.authorized_items = [];
      this.authorized_paths = [];

      // Inspection             ////////// 
      if(this.user_type === "inspector") {     
        this.authorized_items.push(this.item_004);    
        this.authorized_items.push(this.item_005);
        this.authorized_items.push(this.item_006);
        this.authorized_items.push(this.item_000);
      }
      
      // Customer Type Provider   ///////// 
      if(this.customer_type === 1) {
          this.authorized_items.push(this.item_007);
          if(this.is_inspector) {
            this.authorized_items.push(this.item_004);    
            this.authorized_items.push(this.item_005);
            this.authorized_items.push(this.item_006);
            this.authorized_paths.push({url:'/weighing-detail'});
          }   
          this.authorized_items.push(this.item_001);
          if(this.is_customer_admin) {
              this.authorized_items.push(this.item_023);
              this.enable_inspector_assign = true;
          }
          this.authorized_paths.push({url:'/report-ship'});
          this.authorized_paths.push({url:'/totalresult'});
          this.authorized_paths.push({url:'/report-ledger'});
          this.authorized_paths.push({url:'/report-shipaggregate'});
          this.authorized_paths.push({url:'/report-shipaggregatelist'});
          this.authorized_items.push(this.item_000);

      }
      
      // Customer Type Vendor   ////////// 
      else if(this.customer_type === 2) {
          this.authorized_items.push(this.item_007);
          this.authorized_items.push(this.item_001);
          if(this.is_customer_admin) {
            this.authorized_items.push(this.item_023);
          }
          this.authorized_paths.push({url:'/report-ship'});
          this.authorized_paths.push({url:'/totalresult'});
          this.authorized_paths.push({url:'/report-ledger'});
          this.authorized_items.push(this.item_000);
      }
      
      // Customer Type Subvendor ////////// 
      else if(this.customer_type === 3) {
          this.authorized_items.push(this.item_007);
          this.authorized_items.push(this.item_001);
          if(this.is_customer_admin) {
            this.authorized_items.push(this.item_023);
          }
          this.authorized_paths.push({url:'/report-ledger'});
          this.authorized_items.push(this.item_000);
      }
    
      if(this.user_type === "system_admin") {
        this.authorized_items.push(this.ADM_001);
        this.authorized_items.push(this.ADM_002);
        this.authorized_items.push(this.ADM_003);
        this.provider_name = 'サービス管理ツール'
      }
   
      for (let index = 0; index < this.authorized_items.length; index++) {
        this.authorized_paths.push({url:this.authorized_items[index].url});
      }

  }
  
  //Access API
  execLogin(username: string, password: string, user_level: string): Observable<any> {
    const params = new HttpParams().set('username', username).set('password', password).set('user_level', user_level);
    return this.http.get(accessURL,{params}).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  private extractData(res: Response){
    let body = res;
    return body || {};
  }
  
  private handleError(error: HttpErrorResponse){
    if(error.error instanceof ErrorEvent ){
      console.error('An error occurred:', error.error.message);
    }else{
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
}



// Commenet Area Below .......................................................
