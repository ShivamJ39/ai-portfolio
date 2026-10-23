import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { ChatbotComponent } from './chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ChatbotComponent,
  ],
  template: `
    <a class="skip-link" href="#page-content">
      Skip to content
    </a>

    <header
      class="portfolio-header"
      (keydown.escape)="closeMenu(menuToggle)"
    >
      <div class="portfolio-header-inner">
        <a
          class="brand"
          routerLink="/"
          aria-label="Shivam home"
          (click)="menuOpen.set(false)"
        >
          Shivam<span>.</span>
        </a>

        <button
          #menuToggle
          class="menu-toggle"
          type="button"
          aria-controls="portfolio-navigation"
          [attr.aria-expanded]="menuOpen()"
          [attr.aria-label]="
            menuOpen() ? 'Close navigation menu' : 'Open navigation menu'
          "
          (click)="menuOpen.update(toggleMenu)"
        >
          <span class="menu-icon" [class.is-open]="menuOpen()" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>

          <span>{{ menuOpen() ? 'Close' : 'Menu' }}</span>
        </button>

        <nav
          id="portfolio-navigation"
          class="portfolio-nav"
          [class.is-open]="menuOpen()"
          aria-label="Main navigation"
        >
          @for (item of navigation; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              ariaCurrentWhenActive="page"
              (click)="menuOpen.set(false)"
            >
              {{ item.label }}
              <span class="mobile-nav-arrow" aria-hidden="true">↗</span>
            </a>
          }
        </nav>
      </div>
    </header>

    <main id="page-content" class="container" tabindex="-1">
      <router-outlet />
    </main>

    <footer class="site-footer container">
      <p>© {{ year }} Shivam. Built with Angular & FastAPI.</p>
      <a routerLink="/contact">Start a conversation ↗</a>
    </footer>

    <app-chatbot />
  `,
})
export class App {
  private readonly router = inject(Router);

  readonly year = new Date().getFullYear();
  readonly menuOpen = signal(false);

  readonly toggleMenu = (open: boolean): boolean => !open;

  readonly navigation = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/skills', label: 'Skills' },
    { path: '/contact', label: 'Contact' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  closeMenu(button: HTMLButtonElement): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      button.focus();
    }
  }
}