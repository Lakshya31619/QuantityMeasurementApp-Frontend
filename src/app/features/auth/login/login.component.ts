import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

declare const google: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

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
            client_id: '1006158982714-55dkjfupq1oqkeg8ukpcar1j9929q1rs.apps.googleusercontent.com',
            callback: (res: any) => this.handleGoogleLogin(res)
          });

          google.accounts.id.renderButton(
            document.getElementById("google-btn"),
            { theme: "outline", size: "large" }
          );

        }

      }, 500);
    }
  }

  login() {
    this.auth.login(this.form).subscribe((res: any) => {
      localStorage.setItem('auth_token', res.token);
      this.router.navigate(['/dashboard']);
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  handleGoogleLogin(response: any) {
    const token = response.credential;

    this.auth.googleLogin(token).subscribe((res: any) => {
      localStorage.setItem('auth_token', res.token);
      this.router.navigate(['/dashboard']);
    });
  }
}