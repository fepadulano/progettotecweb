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
  apiService = inject(ApiService);

  games = signal<CompletedGameSummary[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.apiService.getCompletedGames().subscribe({
      next: (data) => {
        this.games.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare lo storico delle partite.');
        this.loading.set(false);
      },
    });
  }
}
