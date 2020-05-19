import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpRequest, HttpHandler,HttpEvent} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const sha1 = require('sha1');
const CryptoJS = require("crypto-js");
const httpOptions = {
  headers: new HttpHeaders({'Content-Type':'application/json'})
};

const management_url = environment.api_address + "/api/shippingmng";
const accessUrl = environment.api_address + "/api/access";

@Injectable({
  providedIn: 'root'
})

export class ManagementService {

  constructor(private http: HttpClient) { }
  
  intercept( req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const idToken = localStorage.getItem('Session_Token');
    const sessionData = localStorage.getItem('Session');
    var session;
    
    if(sessionData !== null) {
        var bytes  = CryptoJS.AES.decrypt(sessionData.toString(), '123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        session = sha1(JSON.stringify(decryptedData)) || '';
    } else {
        session = 'XXXXXXXXXXXXXXXXXXXXXXXXXX';
    }
    
    var mytoken = 'XXXXXXXXXXXXXXXXXXXXXXXXXX';
        
    if(idToken !== null) {
        mytoken=idToken;
    }
    
    const new_headers = new HttpHeaders({
      'Session':  session,
      'Authorization': mytoken
    })
   
    const newRequest = req.clone({headers:new_headers});

    return next.handle(newRequest);
  }

   //Company Users //////////////////////////////
   
  createUser(data): Observable<any> {
    // data.password = sha1(data.password);
    return this.http.post(management_url+ '/createuser',data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  
  }
  
  updateUser(data): Observable<any> {
    return this.http.post(management_url + '/update/user',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
    
  }
  
  checkloginid(data): Observable<any> {
    return this.http.post(management_url + '/checkloginid',data,httpOptions).pipe(
      map(this.extractData),catchError(this.handleError));
  }
  
  checkemail(data): Observable<any> {
    return this.http.post(management_url + '/checkemail',data,httpOptions).pipe(
      map(this.extractData),catchError(this.handleError));
  }
    
    
  deleteUser(user_id): Observable<any> {
    return this.http.post(management_url + '/delete/user/'+ user_id,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
    
  }
  
  
  getCustomers(): Observable<any> {
    return this.http.get(management_url+ '/customers').pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  getCustomerUsers(customer): Observable<any> {
    return this.http.get(management_url+ '/customerusers/'+ customer).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  
  createCustomer(data): Observable<any> {
    return this.http.post(management_url+ '/createcustomer',data, httpOptions).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  updateCustomer(data): Observable<any> {
    return this.http.post(management_url+ '/updatecustomer',data, httpOptions).pipe(
      map(this.extractData),
    catchError(this.handleError));
    
  }
  
  deleteCustomer(customer_id): Observable<any> {
    return this.http.post(management_url+ '/deletecustomer/'+ customer_id, httpOptions).pipe(
      map(this.extractData),
    catchError(this.handleError));
  }
  
  getContracts(customer): Observable<any> {
    return this.http.get(management_url+ '/contracts/'+customer).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  
  updateContract(data): Observable<any> {
    return this.http.post(management_url+ '/updatecontract',data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  
  deleteContract(provider,customer): Observable<any> {
    return this.http.post(management_url+ '/deletecontract/'+ provider +'/'+customer,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  
  //Inspector Users //////////////////////////////
  
  getAllInspectors(provider): Observable<any> {
    return this.http.get(management_url+ '/inspectors/' + provider).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  createInspector(data): Observable<any> {
    // data.password = sha1(data.password);
    return this.http.post(management_url+ '/create/inspector',data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  updateInspector(data): Observable<any> {
    return this.http.post(management_url + '/update/inspector',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  deleteInspector(inspector_id): Observable<any> {
    return this.http.post(management_url + '/delete/inspector/'+ inspector_id,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));   
  }
  
  resetPassword(data): Observable<any> {
    data.password = sha1(data.password);
    data.new_password = sha1(data.new_password);
    return this.http.post(management_url + '/resetpassword/', data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }    
  
  reissuePassword(data): Observable<any> {
    // data.password = sha1(data.password);
    return this.http.post(accessUrl + '/reissuepassword', data, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  
  }
  
  private extractData(res: Response) {
    let body = res;
    return body || {};
  }
  
  private handleError(error: HttpErrorResponse) {
    if(error.error instanceof ErrorEvent ) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
  
}
