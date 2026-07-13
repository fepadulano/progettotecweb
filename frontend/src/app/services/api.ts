import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RichiestaRegistrazione {
  username: string;
  email: string;
  password: string;
}

export interface RichiestaLogin {
  email: string;
  password: string;
}

export interface AuthRes {
  messaggio: string; // testo dell'esito, positivo o negativo a seconda dello status HTTP
  token?: string; // presente solo nella risposta del login
  username?: string; // presente solo nella risposta del login
}

export interface AvvioPartitaRes {
  idPartita?: number; // assente se il backend fallisce (DB o Wikipedia irraggiungibile)
  testoCensurato?: string; // assente per lo stesso motivo
  errore?: string;
}

export interface TentativoRes {
  vittoria: boolean;
  tipo: string; // testo, titolo, errore, gia_indovinata ecc
  messaggio: string;
  punteggio?: number; // presente solo a fine partita vinta
  titoloOriginale?: string; // inviato solo in caso di vittoria
  testoInChiaro?: string; // inviato solo in caso di vittoria
  nuovoTestoCensurato?: string; // testo aggiornato dopo un tentativo valido
  errore?: string;
}

export interface ElementoClassifica {
  id: number;
  username: string;
  partiteVinte: number;
  tempoMedioSecondi: number;
}

export interface AbbandonoRes {
  messaggio?: string;
  titoloOriginale?: string;
  testoInChiaro?: string;
  errore?: string;
}

export interface RiepilogoPartitaConclusa {
  id: number;
  titoloArticolo: string;
  stato: string; // VINTA, ABBANDONATA
  tentativi: number;
  durataSecondi: number;
  username: string | null;
  giocataIl: string;
}

export interface DettaglioPartitaConclusa extends RiepilogoPartitaConclusa {
  testoCensurato: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registra(datiUtente: RichiestaRegistrazione): Observable<AuthRes> {
    return this.http.post<AuthRes>(`${this.baseUrl}/autenticazione/registrati`, datiUtente);
  }

  login(credenziali: RichiestaLogin): Observable<AuthRes> {
    return this.http.post<AuthRes>(`${this.baseUrl}/autenticazione/accedi`, credenziali);
  }

  avviaPartita(): Observable<AvvioPartitaRes> {
    return this.http.post<AvvioPartitaRes>(`${this.baseUrl}/partita/avvia`, {});
  }

  inviaTentativo(idPartita: number, parola: string, isTitolo: boolean): Observable<TentativoRes> {
    const payload = { idPartita, parola, isTitolo };
    return this.http.post<TentativoRes>(`${this.baseUrl}/partita/tentativo`, payload);
  }

  abbandonaPartita(idPartita: number): Observable<AbbandonoRes> {
    return this.http.post<AbbandonoRes>(`${this.baseUrl}/partita/abbandona`, { idPartita });
  }

  ottieniClassifica(): Observable<ElementoClassifica[]> {
    return this.http.get<ElementoClassifica[]>(`${this.baseUrl}/utenti/classifica`);
  }

  elencaPartiteConcluse(): Observable<RiepilogoPartitaConclusa[]> {
    return this.http.get<RiepilogoPartitaConclusa[]>(`${this.baseUrl}/partite-concluse`);
  }

  ottieniDettaglioPartita(id: number): Observable<DettaglioPartitaConclusa> {
    return this.http.get<DettaglioPartitaConclusa>(`${this.baseUrl}/partite-concluse/${id}`);
  }
}
