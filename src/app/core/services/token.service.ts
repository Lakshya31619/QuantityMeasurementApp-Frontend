import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TokenService {

  static readonly KEY = 'auth_token';

  private platformId = inject(PLATFORM_ID);

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TokenService.KEY, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TokenService.KEY);
    }
    return null;
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TokenService.KEY);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}