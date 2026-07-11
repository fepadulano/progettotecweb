import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService, ElementoClassifica } from '../../services/api';

@Component({
  selector: 'app-classifica',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './classifica.html',
  styleUrl: './classifica.css',
})
export class Classifica implements OnInit {
  servizioApi = inject(ApiService);

  elementi = signal<ElementoClassifica[]>([]);
  caricamento = signal(true);
  messaggioErrore = signal('');

  ngOnInit() {
    this.servizioApi.ottieniClassifica().subscribe({
      next: (dati) => {
        this.elementi.set(dati);
        this.caricamento.set(false);
      },
      error: () => {
        this.messaggioErrore.set('Impossibile caricare la classifica al momento.');
        this.caricamento.set(false);
      },
    });
  }
}
