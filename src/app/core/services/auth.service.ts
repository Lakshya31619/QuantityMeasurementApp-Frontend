import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// NOTE: This is the CORE auth service used by LoginComponent and SignupComponent.
// It does NOT include saveHistory — guest history replay is handled by
// replaying operations through QuantityService directly (in login.component.ts).

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
}