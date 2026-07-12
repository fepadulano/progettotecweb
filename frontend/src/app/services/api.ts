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

export interface AutenticazioneResponse {
  messaggio?: string;
  token?: string;
  username?: string; // presente solo nella risposta del login
  errore?: string; // presente se le credenziali sono errate o se l'utente esiste già
}

export interface AvvioPartitaResponse {
  idPartita?: number; // assente se il backend fallisce (DB o Wikipedia irraggiungibile)
  testoCensurato?: string; // assente per lo stesso motivo
  errore?: string;
}

export interface TentativoResponse {
  vittoria: boolean;
  tipo: string; // TESTO, TITOLO, ERRORE, GIA_INDOVINATA ecc.
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

export interface AbbandonoResponse {
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

  registra(datiUtente: RichiestaRegistrazione): Observable<AutenticazioneResponse> {
    return this.http.post<AutenticazioneResponse>(`${this.baseUrl}/autenticazione/registrati`, datiUtente);
  }

  login(credenziali: RichiestaLogin): Observable<AutenticazioneResponse> {
    return this.http.post<AutenticazioneResponse>(`${this.baseUrl}/autenticazione/accedi`, credenziali);
  }

  avviaPartita(): Observable<AvvioPartitaResponse> {
    return this.http.get<AvvioPartitaResponse>(`${this.baseUrl}/partita/avvia`);
  }

  inviaTentativo(idPartita: number, parola: string, isTitolo: boolean): Observable<TentativoResponse> {
    const payload = { idPartita, parola, isTitolo };
    return this.http.post<TentativoResponse>(`${this.baseUrl}/partita/tentativo`, payload);
  }

  abbandonaPartita(idPartita: number): Observable<AbbandonoResponse> {
    return this.http.post<AbbandonoResponse>(`${this.baseUrl}/partita/abbandona`, { idPartita });
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
