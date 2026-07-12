import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, DettaglioPartitaConclusa } from '../../services/api';

@Component({
  selector: 'app-storico-dettaglio',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './storico-dettaglio.html',
  styleUrl: './storico-dettaglio.css',
})
export class StoricoDettaglio implements OnInit {
  rotta = inject(ActivatedRoute);
  servizioApi = inject(ApiService);

  partita = signal<DettaglioPartitaConclusa | null>(null);
  caricamento = signal(true);
  messaggioErrore = signal('');

  ngOnInit() {
    const id = Number(this.rotta.snapshot.paramMap.get('id'));

    this.servizioApi.ottieniDettaglioPartita(id).subscribe({
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
