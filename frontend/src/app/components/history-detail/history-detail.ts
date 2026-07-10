import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, CompletedGameDetail } from '../../services/api';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './history-detail.html',
  styleUrl: './history-detail.css',
})
export class HistoryDetail implements OnInit {
  route = inject(ActivatedRoute);
  apiService = inject(ApiService);

  game = signal<CompletedGameDetail | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.apiService.getCompletedGameDetail(id).subscribe({
      next: (data) => {
        this.game.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Partita non trovata.');
        this.loading.set(false);
      },
    });
  }
}
