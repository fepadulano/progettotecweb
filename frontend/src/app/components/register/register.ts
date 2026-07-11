import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  apiService = inject(ApiService);
  router = inject(Router);

  submitted = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  handleRegister() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set(''); // resettiamo a ogni invio

    if (this.registerForm.invalid) {
      return;
    }

    this.apiService
      .register({
        username: this.registerForm.value.username as string,
        email: this.registerForm.value.email as string,
        password: this.registerForm.value.password as string,
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Registrazione completata! Ti stiamo portando al login...');
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 1800);
        },
        error: (err) => {
          if (err.error && (err.error.errore || err.error.messaggio)) {
            this.errorMessage.set(err.error.errore || err.error.messaggio);
          } else {
            this.errorMessage.set('Credenziali non valide o utente già registrato.');
          }
          console.error('Errore di registrazione:', err);
        },
      });
  }
}
