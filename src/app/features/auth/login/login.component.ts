import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const google: any;

@Component({
  standalone: true,
   imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  private platformId = inject(PLATFORM_ID);

  // ✅ ADD THIS
  form = {
    email: '',
    password: ''
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof google !== 'undefined') {

          google.accounts.id.initialize({
            client_id: 'YOUR_GOOGLE_CLIENT_ID',
            callback: (response: any) => this.handleGoogleLogin(response)
          });

          google.accounts.id.renderButton(
            document.getElementById("google-btn"),
            { theme: "outline", size: "large" }
          );

        }
      }, 500);
    }
  }

  // ✅ ADD THIS
  login() {
    this.auth.login(this.form).subscribe((res: any) => {
      localStorage.setItem('auth_token', res.token);
    });
  }

  handleGoogleLogin(response: any) {
    const token = response.credential;

    this.auth.googleLogin(token).subscribe((res: any) => {
      localStorage.setItem('auth_token', res.token);
    });
  }
}