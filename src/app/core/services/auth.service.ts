import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = `${environment.authUrl}/api/auth`;

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
}