import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CompletedGameSummary } from '../../services/api';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  servizioApi = inject(ApiService);

  partite = signal<CompletedGameSummary[]>([]);
  caricamento = signal(true);
  messaggioErrore = signal('');

  ngOnInit() {
    this.servizioApi.getCompletedGames().subscribe({
      next: (dati) => {
        this.partite.set(dati);
        this.caricamento.set(false);
      },
      error: () => {
        this.messaggioErrore.set('Impossibile caricare lo storico delle partite.');
        this.caricamento.set(false);
      },
    });
  }
}
