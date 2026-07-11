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
  apiService = inject(ApiService);

  sessionId = signal<number | null>(null);
  censoredText = signal('');
  gameMessage = signal('Caricamento partita in corso...');
  isVictory = signal(false);
  gameOver = signal(false); // true sia in caso di vittoria che di abbandono

  guessControl = new FormControl('', Validators.required);

  ngOnInit() {
    this.startNewGame();
  }

  startNewGame() {
    this.gameMessage.set('Caricamento partita in corso...');
    this.apiService.startGame().subscribe({
      next: (res) => {
        if (res.errore) {
          this.gameMessage.set(res.errore);
        } else {
          this.sessionId.set(res.idPartita!);
          this.censoredText.set(res.testoCensurato!);
          this.gameMessage.set('Partita iniziata! Prova a indovinare.');
          this.isVictory.set(false);
          this.gameOver.set(false);
          this.guessControl.reset();
        }
      },
      error: (err) =>
        this.gameMessage.set(
          err?.error?.errore ?? 'Errore di connessione al server.',
        ),
    });
  }

  makeGuess(isTitle: boolean) {
    const sessionId = this.sessionId();
    if (this.guessControl.invalid || !sessionId) return;

    const word = this.guessControl.value as string;

    this.apiService.makeGuess(sessionId, word, isTitle).subscribe({
      next: (res) => {
        if (res.errore) {
          this.gameMessage.set(res.errore);
          return;
        }

        this.gameMessage.set(res.messaggio);

        if (res.nuovoTestoCensurato) {
          this.censoredText.set(res.nuovoTestoCensurato);
        }

        if (res.vittoria) {
          this.isVictory.set(true);
          this.gameOver.set(true);
          if (res.testoInChiaro) {
            this.censoredText.set(res.testoInChiaro);
          }
        }

        this.guessControl.reset();
      },
      error: () => this.gameMessage.set('Errore durante il tentativo.'),
    });
  }

  handleAbandon() {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.apiService.abandonGame(sessionId).subscribe({
      next: (res) => {
        this.gameMessage.set(res.messaggio ?? 'Partita abbandonata.');
        if (res.testoInChiaro) {
          this.censoredText.set(res.testoInChiaro);
        }
        this.gameOver.set(true);
      },
      error: () => this.gameMessage.set("Errore durante l'abbandono della partita."),
    });
  }
}
