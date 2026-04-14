import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

// Routes that guests are allowed to hit — a 401/403 on these should NOT
// redirect to login (guests can calculate without an account).
const GUEST_ALLOWED_PATHS = [
  '/api/conversion/convert',
  '/api/conversion/compare',
  '/api/arithmetic/add',
  '/api/arithmetic/subtract',
  '/api/arithmetic/multiply',
  '/api/arithmetic/divide',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/google'
];

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.tokenService.getToken();

    // Always attach JWT when we have one — this is how logged-in users
    // get their history saved server-side during calculate calls.
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 || error.status === 403) {
          const url = request.url;
          const isGuestAllowed = GUEST_ALLOWED_PATHS.some(path => url.includes(path));

          if (!isGuestAllowed) {
            // Protected route (e.g. /api/quantity/history) — clear token and redirect
            this.tokenService.clear();
            this.router.navigate(['/login']);
          }
          // Guest-allowed route — just surface the error, don't redirect
        }

        return throwError(() => error);
      })
    );
  }
}