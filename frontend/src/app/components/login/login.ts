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
export class Login {
  servizioApi = inject(ApiService);
  servizioAuth = inject(AuthService);
  router = inject(Router);

  inviato = signal(false);
  messaggioErrore = signal('');

  formLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  accedi() {
    this.inviato.set(true);
    this.messaggioErrore.set('');

    if (this.formLogin.invalid) {
      return;
    }

    this.servizioApi
      .login({
        email: this.formLogin.value.email as string,
        password: this.formLogin.value.password as string,
      })
      .subscribe({
        next: (risposta) => {
          this.servizioAuth.loginSuccess(risposta.token!, risposta.username!);
          this.router.navigateByUrl('/partita');
        },
        error: (errore) => {
          // status non-2xx: lo status HTTP dice già che è un errore, basta il messaggio
          this.messaggioErrore.set(errore.error?.messaggio ?? 'Credenziali errate');
        },
      });
  }
}
