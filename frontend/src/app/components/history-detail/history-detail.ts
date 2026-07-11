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
  rotta = inject(ActivatedRoute);
  servizioApi = inject(ApiService);

  partita = signal<CompletedGameDetail | null>(null);
  caricamento = signal(true);
  messaggioErrore = signal('');

  ngOnInit() {
    const id = Number(this.rotta.snapshot.paramMap.get('id'));

    this.servizioApi.getCompletedGameDetail(id).subscribe({
      next: (dati) => {
        this.partita.set(dati);
        this.caricamento.set(false);
      },
      error: () => {
        this.messaggioErrore.set('Partita non trovata.');
        this.caricamento.set(false);
      },
    });
  }
}
