import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Register } from './components/register/register';
import { Game } from './components/game/game';
import { Home } from './components/home/home';
import { Leaderboard } from './components/leaderboard/leaderboard';
import { History } from './components/history/history';
import { HistoryDetail } from './components/history-detail/history-detail';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home, title: 'WikiBlank' },
  { path: 'leaderboard', component: Leaderboard, title: 'Classifica | WikiBlank' },
  { path: 'storico', component: History, title: 'Storico Partite | WikiBlank' },
  { path: 'storico/:id', component: HistoryDetail, title: 'Dettaglio Partita | WikiBlank' },
  { path: 'login', component: LoginComponent, title: 'Accedi | WikiBlank' },
  { path: 'register', component: Register, title: 'Registrati | WikiBlank' },
  { path: 'game', component: Game, canActivate: [authGuard], title: 'Gioca | WikiBlank' },
];
