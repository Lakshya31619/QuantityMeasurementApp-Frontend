import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { GuestHistoryService } from '../../../core/services/guest-history.service';
import { QuantityService } from '../../../core/services/quantity.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

declare const google: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  form = { email: '', password: '' };

  private platformId = inject(PLATFORM_ID);

  constructor(
    private auth: AuthService,
    private tokenService: TokenService,
    private guestHistory: GuestHistoryService,
    private quantityService: QuantityService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.tokenService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.loadGoogleButton(), 300);
    }
  }

  loadGoogleButton() {
    if (typeof google === 'undefined') return;
    google.accounts.id.initialize({
      client_id: '1006158982714-55dkjfupq1oqkeg8ukpcar1j9929q1rs.apps.googleusercontent.com',
      callback: (res: any) => this.handleGoogleLogin(res)
    });
    const btn = document.getElementById('google-btn');
    if (btn) {
      btn.innerHTML = '';
      google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large' });
    }
  }

  private replayGuestHistory(afterReplay: () => void) {
    if (!isPlatformBrowser(this.platformId)) {
      afterReplay();
      return;
    }

    const entries: any[] = this.guestHistory.getHistory();

    if (!entries.length) {
      afterReplay();
      return;
    }

    const replays$ = entries.map((entry: any) => {
      const op = entry.operation as string;
      const payload = entry.payload;

      const call$ = (() => {
        switch (op) {
          case 'convert':  return this.quantityService.convert(payload);
          case 'add':      return this.quantityService.add(payload);
          case 'subtract': return this.quantityService.subtract(payload);
          case 'multiply': return this.quantityService.multiply(payload);
          case 'divide':   return this.quantityService.divide(payload);
          case 'compare':  return this.quantityService.compare(payload);
          default:         return of(null);
        }
      })();

      // Never let a single failed replay block the rest
      return call$.pipe(catchError(err => {
        console.error('Replay failed for', op, err);
        return of(null);
      }));
    });

    forkJoin(replays$).subscribe(() => {
      this.guestHistory.clear();
      afterReplay();
    });
  }

  login(): void {
    this.auth.login(this.form).subscribe({
      next: (res: any) => {
        this.tokenService.setToken(res.token);
        this.replayGuestHistory(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (err) => console.error('Login failed', err)
    });
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  handleGoogleLogin(response: any): void {
    this.auth.googleLogin(response.credential).subscribe({
      next: (res: any) => {
        this.tokenService.setToken(res.token);
        this.replayGuestHistory(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (err) => console.error('Google login failed', err)
    });
  }
}