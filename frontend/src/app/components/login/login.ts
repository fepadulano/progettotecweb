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
          if (risposta.token) {
            this.servizioAuth.loginSuccess(risposta.token, this.formLogin.value.email as string);
            this.router.navigateByUrl('/game');
          } else if (risposta.errore || risposta.messaggio) {
            // il backend a volte risponde 200 OK con un errore dentro il json
            this.messaggioErrore.set(risposta.errore || risposta.messaggio || 'Errore di login');
          }
        },
        error: (errore) => {
          // status 400/401/404: il messaggio vero è dentro errore.error
          if (errore.error && (errore.error.errore || errore.error.messaggio)) {
            this.messaggioErrore.set(errore.error.errore || errore.error.messaggio);
          } else {
            this.messaggioErrore.set('Credenziali errate');
          }
        },
      });
  }
}
