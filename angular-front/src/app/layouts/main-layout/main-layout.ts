import { Component, computed, inject, OnInit } from '@angular/core';
import { NavigationEnd, RouterLink, RouterOutlet, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  private session = inject(SessionService);
  private router = inject(Router);

  userName = this.session.userName;

  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isOnView = computed(() => this.url().startsWith('/view'));

  ngOnInit() {
    this.session.loadFromStorage();
  }
}
