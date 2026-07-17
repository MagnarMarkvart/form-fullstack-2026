import { Injectable, computed, inject, signal } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { User } from '../models/user.model';

const STORAGE_KEY = 'userId';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private graphql = inject(GraphqlService);

  private currentUser = signal<User | null>(null);
  private sessionLoadError = signal<string | null>(null);

  /** Full session user for the structured view. */
  user = this.currentUser.asReadonly();
  loadError = this.sessionLoadError.asReadonly();

  /** Reactive user name for the header; null when no session. */
  userName = computed(() => this.currentUser()?.name ?? null);

  /** Loads the saved session (if any) from the backend using the stored id. */
  loadFromStorage() {
    const userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) return;

    this.sessionLoadError.set(null);
    this.graphql.getSessionUser(userId).subscribe({
      next: (user) => {
        if (user) {
          this.currentUser.set(user);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      },
      error: () => {
        this.sessionLoadError.set(
          'Your saved registration could not be loaded. Please try again later.',
        );
      },
    });
  }

  /**  Called after a successful save. */
  setUser(user: User) {
    localStorage.setItem(STORAGE_KEY, user.id);
    this.currentUser.set(user);
  }

  /** Clears the local session after registration data has been wiped. */
  clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
    this.sessionLoadError.set(null);
  }
}
