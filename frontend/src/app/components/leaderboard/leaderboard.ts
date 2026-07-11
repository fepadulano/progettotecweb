import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService, LeaderboardEntry } from '../../services/api';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard implements OnInit {
  servizioApi = inject(ApiService);

  voci = signal<LeaderboardEntry[]>([]);
  caricamento = signal(true);
  messaggioErrore = signal('');

  ngOnInit() {
    this.servizioApi.getLeaderboard().subscribe({
      next: (dati) => {
        this.voci.set(dati);
        this.caricamento.set(false);
      },
      error: () => {
        this.messaggioErrore.set('Impossibile caricare la classifica al momento.');
        this.caricamento.set(false);
      },
    });
  }
}
