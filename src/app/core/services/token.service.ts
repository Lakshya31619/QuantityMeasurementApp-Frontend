import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {

  private KEY = 'auth_token';

  setToken(token: string) {
    localStorage.setItem(this.KEY, token);
  }

  getToken() {
    return localStorage.getItem(this.KEY);
  }

  clear() {
    localStorage.removeItem(this.KEY);
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}