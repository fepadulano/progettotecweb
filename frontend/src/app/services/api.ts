import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  messaggio?: string;
  token?: string;
  errore?: string; // presente se le credenziali sono errate o se l'utente esiste già
}

export interface StartGameResponse {
  idPartita?: number; // assente se il backend fallisce (DB o Wikipedia irraggiungibile)
  testoCensurato?: string; // assente per lo stesso motivo
  errore?: string;
}

export interface GuessResponse {
  vittoria: boolean;
  tipo: string; // TESTO, TITOLO, ERRORE, GIA_INDOVINATA ecc.
  messaggio: string;
  punteggio?: number; // presente solo a fine partita vinta
  titoloOriginale?: string; // inviato solo in caso di vittoria
  testoInChiaro?: string; // inviato solo in caso di vittoria
  nuovoTestoCensurato?: string; // testo aggiornato dopo un tentativo valido
  errore?: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  partiteVinte: number;
  tempoMedioSecondi: number;
}

export interface AbandonResponse {
  messaggio?: string;
  titoloOriginale?: string;
  testoInChiaro?: string;
  errore?: string;
}

export interface CompletedGameSummary {
  id: number;
  titoloArticolo: string;
  stato: string; // WON, ABANDONED
  tentativi: number;
  durataSecondi: number;
  username: string | null;
  giocataIl: string;
}

export interface CompletedGameDetail extends CompletedGameSummary {
  testoCensurato: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  startGame(): Observable<StartGameResponse> {
    return this.http.get<StartGameResponse>(`${this.baseUrl}/game/start`);
  }

  makeGuess(sessionId: number, word: string, isTitleGuess: boolean): Observable<GuessResponse> {
    const payload = { sessionId, word, isTitleGuess };
    return this.http.post<GuessResponse>(`${this.baseUrl}/game/guess`, payload);
  }

  abandonGame(sessionId: number): Observable<AbandonResponse> {
    return this.http.post<AbandonResponse>(`${this.baseUrl}/game/abandon`, { sessionId });
  }

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/users/leaderboard`);
  }

  getCompletedGames(): Observable<CompletedGameSummary[]> {
    return this.http.get<CompletedGameSummary[]>(`${this.baseUrl}/games`);
  }

  getCompletedGameDetail(id: number): Observable<CompletedGameDetail> {
    return this.http.get<CompletedGameDetail>(`${this.baseUrl}/games/${id}`);
  }
}
