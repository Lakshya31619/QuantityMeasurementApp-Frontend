import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = `${environment.apiUrl}/api/auth`;

  private HISTORY_API = `${environment.apiUrl}/api/quantity/history`;

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.API}/login`, data);
  }

  signup(data: any) {
    return this.http.post(`${this.API}/signup`, data);
  }

  googleLogin(token: string) {
    return this.http.post(`${this.API}/google`, { token });
  }

  saveHistory(data: any) {
    return this.http.post(this.HISTORY_API, data);
  }
}