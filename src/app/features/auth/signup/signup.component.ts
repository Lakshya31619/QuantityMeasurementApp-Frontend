import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {

  form = { email: '', password: '' };

  constructor(private auth: AuthService) {}

  signup() {
    this.auth.signup(this.form).subscribe();
  }
}