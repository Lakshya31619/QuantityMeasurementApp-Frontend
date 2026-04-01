import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:8080/api/auth';

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
    return this.http.post(`http://localhost:8080/api/history`, data);
  }
}