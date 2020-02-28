import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpInterceptor,HttpRequest, HttpHandler,HttpEvent, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

var sha1 = require('sha1');
var CryptoJS = require("crypto-js");

const httpOptions = {
  headers: new HttpHeaders({'Content-Type':'application/json'})
};


const weighingUrl = environment.api_address + "/api/weighing";
const accessUrl = environment.api_address + "/api/access/inspector";
const masterUrl = environment.api_address + "/api/shipmst";
const checkerUrl = environment.api_address + "/api/checker";
const verifyUrl = environment.api_address + "/api/verifytoken";
const reportURL = environment.api_address + "/api/report";
@Injectable({
  providedIn: 'root'
})

export class WeighingService implements HttpInterceptor{

  constructor(private http: HttpClient) { }
  
  intercept( req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = localStorage.getItem('Session_Token');
    const sessionData = localStorage.getItem('Session');
    var session = 'XXXXXXXXXXXXXXXXXXXXXXXXXX';
    var mytoken = 'XXXXXXXXXXXXXXXXXXXXXXXXXX';
    if(sessionData !== null){
      
      var bytes  = CryptoJS.AES.decrypt(sessionData.toString(), '123');
      var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      session = sha1(JSON.stringify(decryptedData)) || '';
    }

   
    if(idToken !== null){
      mytoken=idToken
    }
    
    
    const nheaders = new HttpHeaders({
      'Session':  session,
      'Authorization': mytoken
    })
   
    const newRequest = req.clone({headers:nheaders});
      // const newRequest = req.clone({ headers: req.headers.set('Authorization', mytoken) });
    return next.handle(newRequest);
  }
   
  getWeighing(id,provider_id): Observable<any>{
    return this.http.get(weighingUrl+'/gw/' + id + '/' + provider_id).pipe(
        map(this.extractData),
        catchError(this.handleError));
  } 
  
  getNextRecord(id,provider_id): Observable<any>{
    return this.http.get(weighingUrl+ '/nav/' + id + '/' + provider_id).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
     
  getWeighingDetails(id): Observable<any>{
    return this.http.get(weighingUrl+ '/wd/' +id).pipe(
    map(this.extractData),
    catchError(this.handleError));
  }
  
  updateWeighing(data): Observable<any>{
    return this.http.post(weighingUrl + '/update',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
    
  }
  
  createWDetails(data): Observable<any>{
    // console.log(data);
    return this.http.post(weighingUrl+ '/create/wd',data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
    
  }

  updateWeighingDetails(data): Observable<any>{
    return this.http.post(weighingUrl + '/update/wd',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError)); 
  }
    
  createInspectionLog(data): Observable<any>{
    var d = new Date,
    datetoday = [d.getFullYear(),
              d.getMonth()+1,
              d.getDate()
              ].join('-')+' '+
              [d.getHours(),
              d.getMinutes(),
              d.getSeconds()].join(':');

    data['inspection_date'] = datetoday;
    return this.http.post(weighingUrl+ '/inspectionlog',data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  
  }
  
  getIncVehicles(provider): Observable<any>{
    var date = this.formatterDBDate(new Date());
    return this.http.get(weighingUrl+ '/vehicles/' + provider + '/' + date).pipe(
      map(this.extractData),
      catchError(this.handleError));
  } 
    
  getInspectionLogs(inspector_id): Observable<any>{
    return this.http.get(weighingUrl+ '/inspectionlog/' + inspector_id).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  TokenValidity():  Observable<any>{
    return this.http.get(verifyUrl).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  
  // Checking /////////////////////////////////////////////////////////////////////////////
   
  checkAccessCode(id): Observable<any>{
    return this.http.get(accessUrl + '/' + id).pipe(
      map(this.extractData),
      catchError(this.handleError)); 
  }

  checkWeighing(provider_id,weighing_date, weighing_no): Observable<any>{
    return this.http.get(checkerUrl+'/check/' + weighing_no + '/' +provider_id + '/' + weighing_date).pipe(
        map(this.extractData),
        catchError(this.handleError));
  }
   
  checkWeighing_id(id,provider_id): Observable<any>{
    return this.http.get(checkerUrl+'/check/' + id + '/' +provider_id).pipe(
        map(this.extractData),
        catchError(this.handleError));
  }
  
  checkShipTrader(ship_code,vendor_code,provider_id): Observable<any>{
    return this.http.get(checkerUrl+'/check/shiptrader/' + ship_code + '/' +  vendor_code + '/' + provider_id).pipe(
        map(this.extractData),
        catchError(this.handleError));
  }
  
  
  

  //Master Data Service/////////////////////////////////////////////////////////////////////  
  
  getItems(provider): Observable<any>{
    return this.http.get(masterUrl+ '/m/items/' + provider).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  getVendors(provider): Observable<any>{
    return this.http.get(masterUrl+ '/m/vendors/' + provider).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  getCustomers(): Observable<any>{
    return this.http.get(masterUrl+ '/m/customers').pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  getInspectors(provider): Observable<any>{
    return this.http.get(masterUrl+ '/m/inspectors/'+provider).pipe(
      map(this.extractData),
    catchError(this.handleError));
  }
  
  getShipVendors(provider,vendor_code,fdate,tdate): Observable<any>{
    return this.http.get(masterUrl+ '/m/shipvendor/' + provider + '/' + vendor_code + '/' + fdate + '/' + tdate).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  getAllShips(provider,fdate,tdate): Observable<any>{
    return this.http.get(masterUrl+ '/m/ships/' + provider + '/' + fdate + '/' + tdate).pipe(
      map(this.extractData),
    catchError(this.handleError));
  }
  
  getPerShipVendors(provider,ship_code): Observable<any>{
    return this.http.get(masterUrl+ '/m/pershipvendors/' + provider + '/' + ship_code).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
    
  getRelatedSubvendors(provider,vendor_code,fdate,tdate): Observable<any>{
    return this.http.get(masterUrl+ '/m/relsubvendor/' + provider + '/' + vendor_code + '/' + fdate + '/' + tdate).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  getProviders():Observable <any>{
    return this.http.get(masterUrl+ '/m/provider').pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  getProviderDetails(provider):Observable <any>{
    return this.http.get(masterUrl+ '/m/provider/' + provider).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  // Master Data Update
  
 
  
  
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };
    
  private extractData(res: Response) {
    let body = res;
    return body || { };
  }
  
  formatterDBDate(selected_date: Date){
    var day = selected_date.getDate().toString();
    var month = (selected_date.getMonth() + 1).toString();
    var year = selected_date.getFullYear().toString();
    (day.length == 1) && (day = '0' + day);
    (month.length == 1) && (month = '0' + month);
  
    var formatted_date= year +'' + month+''+day;
  
    return formatted_date;
  }
}
