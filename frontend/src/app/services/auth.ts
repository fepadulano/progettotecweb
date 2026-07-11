import { Injectable, signal, computed, effect, WritableSignal } from '@angular/core';

export type AuthState = {
  user: string | null;
  token: string | null;
  isAuthenticated: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private statoAuth: WritableSignal<AuthState> = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  user = computed(() => this.statoAuth().user);
  token = computed(() => this.statoAuth().token);
  isAuthenticated = computed(() => this.statoAuth().isAuthenticated);

  constructor() {
    const tokenSalvato = localStorage.getItem('token');
    const utenteSalvato = localStorage.getItem('user');

    this.statoAuth.set({
      user: utenteSalvato,
      token: tokenSalvato,
      isAuthenticated: !!tokenSalvato,
    });

    // ogni volta che lo stato cambia, lo persistiamo nel localStorage
    effect(() => {
      const tokenAttuale = this.statoAuth().token;
      const utenteAttuale = this.statoAuth().user;

      if (tokenAttuale) {
        localStorage.setItem('token', tokenAttuale);
      } else {
        localStorage.removeItem('token');
      }

      if (utenteAttuale) {
        localStorage.setItem('user', utenteAttuale);
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  loginSuccess(token: string, username: string) {
    this.statoAuth.set({
      user: username,
      token: token,
      isAuthenticated: true,
    });
  }

  logout() {
    this.statoAuth.set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  }
}
