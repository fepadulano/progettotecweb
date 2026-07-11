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

export interface RispostaAutenticazione {
  messaggio?: string;
  token?: string;
  errore?: string; // presente se le credenziali sono errate o se l'utente esiste già
}

export interface RispostaAvvioPartita {
  idPartita?: number; // assente se il backend fallisce (DB o Wikipedia irraggiungibile)
  testoCensurato?: string; // assente per lo stesso motivo
  errore?: string;
}

export interface RispostaTentativo {
  vittoria: boolean;
  tipo: string; // TESTO, TITOLO, ERRORE, GIA_INDOVINATA ecc.
  messaggio: string;
  punteggio?: number; // presente solo a fine partita vinta
  titoloOriginale?: string; // inviato solo in caso di vittoria
  testoInChiaro?: string; // inviato solo in caso di vittoria
  nuovoTestoCensurato?: string; // testo aggiornato dopo un tentativo valido
  errore?: string;
}

export interface VoceClassifica {
  id: number;
  username: string;
  partiteVinte: number;
  tempoMedioSecondi: number;
}

export interface RispostaAbbandono {
  messaggio?: string;
  titoloOriginale?: string;
  testoInChiaro?: string;
  errore?: string;
}

export interface RiepilogoPartitaConclusa {
  id: number;
  titoloArticolo: string;
  stato: string; // WON, ABANDONED
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

  registra(datiUtente: RichiestaRegistrazione): Observable<RispostaAutenticazione> {
    return this.http.post<RispostaAutenticazione>(`${this.baseUrl}/autenticazione/registrati`, datiUtente);
  }

  accedi(credenziali: RichiestaLogin): Observable<RispostaAutenticazione> {
    return this.http.post<RispostaAutenticazione>(`${this.baseUrl}/autenticazione/accedi`, credenziali);
  }

  avviaPartita(): Observable<RispostaAvvioPartita> {
    return this.http.get<RispostaAvvioPartita>(`${this.baseUrl}/partita/avvia`);
  }

  inviaTentativo(idPartita: number, parola: string, eTitolo: boolean): Observable<RispostaTentativo> {
    const payload = { idPartita, parola, eTitolo };
    return this.http.post<RispostaTentativo>(`${this.baseUrl}/partita/tentativo`, payload);
  }

  abbandonaPartita(idPartita: number): Observable<RispostaAbbandono> {
    return this.http.post<RispostaAbbandono>(`${this.baseUrl}/partita/abbandona`, { idPartita });
  }

  ottieniClassifica(): Observable<VoceClassifica[]> {
    return this.http.get<VoceClassifica[]>(`${this.baseUrl}/utenti/classifica`);
  }

  elencaPartiteConcluse(): Observable<RiepilogoPartitaConclusa[]> {
    return this.http.get<RiepilogoPartitaConclusa[]>(`${this.baseUrl}/partite-concluse`);
  }

  ottieniDettaglioPartita(id: number): Observable<DettaglioPartitaConclusa> {
    return this.http.get<DettaglioPartitaConclusa>(`${this.baseUrl}/partite-concluse/${id}`);
  }
}
