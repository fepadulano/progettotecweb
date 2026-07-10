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
  apiService = inject(ApiService);

  entries = signal<LeaderboardEntry[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.apiService.getLeaderboard().subscribe({
      next: (data) => {
        this.entries.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare la classifica al momento.');
        this.loading.set(false);
      },
    });
  }
}
