import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  router = inject(Router);

  submitted = signal(false);
  errorMessage = signal('');

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  handleLogin() {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      return;
    }

    this.apiService
      .login({
        email: this.loginForm.value.email as string,
        password: this.loginForm.value.password as string,
      })
      .subscribe({
        next: (response) => {
          if (response.token) {
            this.authService.loginSuccess(response.token, this.loginForm.value.email as string);
            this.router.navigateByUrl('/game');
          } else if (response.errore || response.message) {
            // il backend a volte risponde 200 OK con un errore dentro il json
            this.errorMessage.set(response.errore || response.message || 'Errore di login');
          }
        },
        error: (err) => {
          // status 400/401/404: il messaggio vero è dentro err.error
          if (err.error && (err.error.errore || err.error.message)) {
            this.errorMessage.set(err.error.errore || err.error.message);
          } else {
            this.errorMessage.set('Credenziali errate');
          }
        },
      });
  }
}
