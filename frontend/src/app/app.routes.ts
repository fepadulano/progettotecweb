import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Partita } from './components/partita/partita';
import { Home } from './components/home/home';
import { Classifica } from './components/classifica/classifica';
import { Storico } from './components/storico/storico';
import { StoricoDettaglio } from './components/storico-dettaglio/storico-dettaglio';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home, title: 'WikiBlank' },
  { path: 'classifica', component: Classifica, title: 'Classifica | WikiBlank' },
  { path: 'storico', component: Storico, title: 'Storico Partite | WikiBlank' },
  { path: 'storico/:id', component: StoricoDettaglio, title: 'Dettaglio Partita | WikiBlank' },
  { path: 'login', component: Login, title: 'Accedi | WikiBlank' },
  { path: 'register', component: Register, title: 'Registrati | WikiBlank' },
  { path: 'partita', component: Partita, canActivate: [authGuard], title: 'Gioca | WikiBlank' },
];
