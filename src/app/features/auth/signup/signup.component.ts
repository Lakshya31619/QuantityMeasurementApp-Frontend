import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
    private router: Router
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      setTimeout(() => {

        if (typeof google !== 'undefined') {

          google.accounts.id.initialize({
            client_id: '1006158982714-55dkjfupq1oqkeg8ukpcar1j9929q1rs.apps.googleusercontent.com', // 🔴 replace this
            callback: (res: any) => this.handleGoogleLogin(res)
          });

          google.accounts.id.renderButton(
            document.getElementById("google-btn-signup"),
            { theme: "outline", size: "large" }
          );

        } else {
          console.error('Google script not loaded');
        }

      }, 500);
    }
  }

  signup() {
    this.auth.signup(this.form).subscribe(() => {
      alert('Signup successful');
      this.router.navigate(['/login']);
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  handleGoogleLogin(response: any) {
    const token = response.credential;

    this.auth.googleLogin(token).subscribe((res: any) => {
      localStorage.setItem('auth_token', res.token);
      this.router.navigate(['/dashboard']);
    });
  }
}