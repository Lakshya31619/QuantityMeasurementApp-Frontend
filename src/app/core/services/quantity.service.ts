import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuantityService {

  private CONV  = `${environment.conversionUrl}/api/conversion`;
  private ARITH = `${environment.arithmeticUrl}/api/arithmetic`;
  private HIST  = `${environment.historyUrl}/api/history`;

  constructor(private http: HttpClient) {}

  convert(data: any): Observable<any> {
    return this.http.post(`${this.CONV}/convert`, data);
  }

  compare(data: any): Observable<any> {
    return this.http.post(`${this.CONV}/compare`, data);
  }

  add(data: any): Observable<any> {
    return this.http.post(`${this.ARITH}/add`, data);
  }

  subtract(data: any): Observable<any> {
    return this.http.post(`${this.ARITH}/subtract`, data);
  }

  multiply(data: any): Observable<any> {
    return this.http.post(`${this.ARITH}/multiply`, data);
  }

  divide(data: any): Observable<any> {
    return this.http.post(`${this.ARITH}/divide`, data);
  }

  getHistory(): Observable<any> {
    return this.http.get(`${this.HIST}`);
  }

  saveHistory(data: any): Observable<any> {
    return this.http.post(`${this.HIST}/save`, data);
  }
}