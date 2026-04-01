import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';

declare const google: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {

  form = {
    email: '',
    password: ''
  };

  private platformId = inject(PLATFORM_ID);

  constructor(
    private auth: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

    const btn = document.getElementById('google-btn-signup');

    if (btn) {
      btn.innerHTML = '';
      google.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large"
      });
    }
  }

  signup() {

    if (!this.form.email || !this.form.password) {
      alert('Email and Password are required');
      return;
    }

    const payload = {
      email: this.form.email.trim(),
      password: this.form.password.trim()
    };

    console.log('Signup payload:', payload);

    this.auth.signup(payload).subscribe({
      next: () => {
        alert('Signup successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Signup failed', err);
        alert(err.error?.message || 'Signup failed');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  handleGoogleLogin(response: any) {
    this.auth.googleLogin(response.credential).subscribe((res: any) => {
      this.tokenService.setToken(res.token);
      this.router.navigate(['/dashboard']);
    });
  }
}