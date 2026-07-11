import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Register } from './components/register/register';
import { Game } from './components/game/game';
import { Home } from './components/home/home';
import { Classifica } from './components/classifica/classifica';
import { Storico } from './components/storico/storico';
import { DettaglioStorico } from './components/storico-dettaglio/storico-dettaglio';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home, title: 'WikiBlank' },
  { path: 'classifica', component: Classifica, title: 'Classifica | WikiBlank' },
  { path: 'storico', component: Storico, title: 'Storico Partite | WikiBlank' },
  { path: 'storico/:id', component: DettaglioStorico, title: 'Dettaglio Partita | WikiBlank' },
  { path: 'login', component: LoginComponent, title: 'Accedi | WikiBlank' },
  { path: 'register', component: Register, title: 'Registrati | WikiBlank' },
  { path: 'game', component: Game, canActivate: [authGuard], title: 'Gioca | WikiBlank' },
];
