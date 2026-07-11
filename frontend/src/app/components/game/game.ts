import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit {
  servizioApi = inject(ApiService);

  idPartita = signal<number | null>(null);
  testoCensurato = signal('');
  messaggioPartita = signal('Caricamento partita in corso...');
  vittoria = signal(false);
  partitaConclusa = signal(false); // true sia in caso di vittoria che di abbandono

  controlloTentativo = new FormControl('', Validators.required);

  ngOnInit() {
    this.iniziaNuovaPartita();
  }

  iniziaNuovaPartita() {
    this.messaggioPartita.set('Caricamento partita in corso...');
    this.servizioApi.avviaPartita().subscribe({
      next: (risposta) => {
        if (risposta.errore) {
          this.messaggioPartita.set(risposta.errore);
        } else {
          this.idPartita.set(risposta.idPartita!);
          this.testoCensurato.set(risposta.testoCensurato!);
          this.messaggioPartita.set('Partita iniziata! Prova a indovinare.');
          this.vittoria.set(false);
          this.partitaConclusa.set(false);
          this.controlloTentativo.reset();
        }
      },
      error: (errore) =>
        this.messaggioPartita.set(
          errore?.error?.errore ?? 'Errore di connessione al server.',
        ),
    });
  }

  tentativo(isTitolo: boolean) {
    const idPartita = this.idPartita();
    if (this.controlloTentativo.invalid || !idPartita) return;

    const parola = this.controlloTentativo.value as string;

    this.servizioApi.inviaTentativo(idPartita, parola, isTitolo).subscribe({
      next: (risposta) => {
        if (risposta.errore) {
          this.messaggioPartita.set(risposta.errore);
          return;
        }

        this.messaggioPartita.set(risposta.messaggio);

        if (risposta.nuovoTestoCensurato) {
          this.testoCensurato.set(risposta.nuovoTestoCensurato);
        }

        if (risposta.vittoria) {
          this.vittoria.set(true);
          this.partitaConclusa.set(true);
          if (risposta.testoInChiaro) {
            this.testoCensurato.set(risposta.testoInChiaro);
          }
        }

        this.controlloTentativo.reset();
      },
      error: () => this.messaggioPartita.set('Errore durante il tentativo.'),
    });
  }

  abbandona() {
    const idPartita = this.idPartita();
    if (!idPartita) return;

    this.servizioApi.abbandonaPartita(idPartita).subscribe({
      next: (risposta) => {
        this.messaggioPartita.set(risposta.messaggio ?? 'Partita abbandonata.');
        if (risposta.testoInChiaro) {
          this.testoCensurato.set(risposta.testoInChiaro);
        }
        this.partitaConclusa.set(true);
      },
      error: () => this.messaggioPartita.set("Errore durante l'abbandono della partita."),
    });
  }
}
