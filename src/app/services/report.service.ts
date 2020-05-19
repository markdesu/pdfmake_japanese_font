import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const reportURL = environment.api_address + "/api/report";
const httpOptions = {headers: new HttpHeaders({'Content-Type':'application/json'})};

@Injectable({
  providedIn: 'root'
})

export class ReportService {

  constructor(private http: HttpClient) { }
  
  getTotalResult(data): Observable<any> {
    return this.http.post(reportURL+ '/adminoverallreport',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  getAdminShipReport(data): Observable<any> {
    return this.http.post(reportURL+ '/adminshipreport',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
   
  getAdminLedgerReport(data): Observable<any> {
    return this.http.post(reportURL+ '/adminledgerreport',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }
  
  getShipAggregateReport(data): Observable<any> {
    return this.http.post(reportURL+ '/shipaggregate',data,httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
   }

   
  getShipAggregateListReport(data): Observable<any> {
  return this.http.post(reportURL+ '/shipaggregatelist',data,httpOptions).pipe(
    map(this.extractData),
    catchError(this.handleError));
  }
  
  
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
  
  formatterDBDate(selected_date: Date) {
    var day = selected_date.getDate().toString();
    var month = (selected_date.getMonth() + 1).toString();
    var year = selected_date.getFullYear().toString();
    (day.length == 1) && (day = '0' + day);
    (month.length == 1) && (month = '0' + month);
  
    var formatted_date= year +'' + month+''+day;
  
    return formatted_date;
  }

}

