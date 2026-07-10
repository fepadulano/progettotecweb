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
  private authState: WritableSignal<AuthState> = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  user = computed(() => this.authState().user);
  token = computed(() => this.authState().token);
  isAuthenticated = computed(() => this.authState().isAuthenticated);

  constructor() {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    this.authState.set({
      user: storedUser,
      token: storedToken,
      isAuthenticated: !!storedToken,
    });

    // ogni volta che lo stato cambia, lo persistiamo nel localStorage
    effect(() => {
      const currentToken = this.authState().token;
      const currentUser = this.authState().user;

      if (currentToken) {
        localStorage.setItem('token', currentToken);
      } else {
        localStorage.removeItem('token');
      }

      if (currentUser) {
        localStorage.setItem('user', currentUser);
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  loginSuccess(token: string, username: string) {
    this.authState.set({
      user: username,
      token: token,
      isAuthenticated: true,
    });
  }

  logout() {
    this.authState.set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  }
}
