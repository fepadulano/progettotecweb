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
  servizioApi = inject(ApiService);
  router = inject(Router);

  inviato = signal(false);
  messaggioErrore = signal('');
  messaggioSuccesso = signal('');

  formRegistrazione = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  registrati() {
    this.inviato.set(true);
    this.messaggioErrore.set('');
    this.messaggioSuccesso.set(''); // resettiamo a ogni invio

    if (this.formRegistrazione.invalid) {
      return;
    }

    this.servizioApi
      .registra({
        username: this.formRegistrazione.value.username as string,
        email: this.formRegistrazione.value.email as string,
        password: this.formRegistrazione.value.password as string,
      })
      .subscribe({
        next: () => {
          this.messaggioSuccesso.set('Registrazione completata! Ti stiamo portando al login...');
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 1800);
        },
        error: (errore) => {
          if (errore.error && (errore.error.errore || errore.error.messaggio)) {
            this.messaggioErrore.set(errore.error.errore || errore.error.messaggio);
          } else {
            this.messaggioErrore.set('Credenziali non valide o utente già registrato.');
          }
          console.error('Errore di registrazione:', errore);
        },
      });
  }
}
