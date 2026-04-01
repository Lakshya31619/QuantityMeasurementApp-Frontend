import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuantityService {

  private API = 'http://localhost:8080/api/quantity';

  constructor(private http: HttpClient) {}

  convert(data: any): Observable<any> {
    return this.http.post(`${this.API}/convert`, data);
  }

  add(data: any): Observable<any> {
    return this.http.post(`${this.API}/add`, data);
  }

  subtract(data: any): Observable<any> {
    return this.http.post(`${this.API}/subtract`, data);
  }

  multiply(data: any): Observable<any> {
    return this.http.post(`${this.API}/multiply`, data);
  }

  divide(data: any): Observable<any> {
    return this.http.post(`${this.API}/divide`, data);
  }

  compare(data: any): Observable<any> {
    return this.http.post(`${this.API}/compare`, data);
  }

  getHistory(): Observable<any> {
    return this.http.get(`${this.API}/history`);
  }
}