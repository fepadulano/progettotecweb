import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './applicazione.html',
  styleUrl: './applicazione.css'
})
export class Applicazione {
  servizioAuth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.servizioAuth.logout();
    this.router.navigateByUrl('/home');
  }
}
