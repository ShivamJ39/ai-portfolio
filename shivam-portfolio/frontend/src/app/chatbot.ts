import {
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ChatTurn,
  PAGE_PATHS,
  PagePath,
  PortfolioApi,
  errorMessage,
} from './api';

interface ChatMessage {
  role: 'user' | 'model' | 'notice';
  text: string;
  route?: PagePath | null;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open()) {
      <aside
        id="portfolio-chat"
        class="chat-panel"
        aria-label="Shivam's portfolio assistant"
        (keydown.escape)="close()"
      >
        <header class="chat-header">
          <div>
            <strong>Shivam's AI assistant</strong>
            <small>Ask a question or explore the portfolio</small>
          </div>

          <button
            class="icon-button"
            type="button"
            aria-label="Close chat"
            (click)="close()"
          >
            ✕
          </button>
        </header>

        <div class="chat-shortcuts" aria-label="Suggested questions">
          @for (prompt of prompts; track prompt.label) {
            <button
              type="button"
              [disabled]="pending()"
              (click)="send(prompt.message)"
            >
              {{ prompt.label }}
            </button>
          }
        </div>

        <div
          #transcript
          class="chat-transcript"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
        >
          @for (message of messages(); track $index) {
            <div class="chat-message" [class.user]="message.role === 'user'">
              <span class="message-author">
                {{ message.role === 'user' ? 'You' : 'Assistant' }}
              </span>

              <p>{{ message.text }}</p>

              @if (message.route; as route) {
                <button
                  class="chat-route"
                  type="button"
                  (click)="visit(route)"
                >
                  View {{ routeLabel(route) }} →
                </button>
              }
            </div>
          }

          @if (pending()) {
            <p class="thinking" role="status">Thinking…</p>
          }
        </div>

        <form class="chat-form" (ngSubmit)="send()">
          <label class="sr-only" for="chat-message">
            Your message
          </label>

          <input
            #chatInput
            id="chat-message"
            name="message"
            [(ngModel)]="draft"
            placeholder="Ask about projects or say 'open skills'"
            maxlength="2000"
            autocomplete="off"
            [disabled]="pending()"
          >

          <button
            class="button primary"
            type="submit"
            aria-label="Send message"
            [disabled]="pending() || !draft.trim()"
          >
            ↑
          </button>
        </form>

        <div class="chat-footer">
          <span>AI answers may need verification.</span>

          <button
            type="button"
            [disabled]="pending()"
            (click)="clear()"
          >
            Clear
          </button>
        </div>
      </aside>
    }

    <button
      #launcher
      class="chat-launcher"
      type="button"
      aria-controls="portfolio-chat"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
    >
      {{ open() ? 'Close assistant ✕' : 'Ask my AI ✦' }}
    </button>
  `,
})
export class ChatbotComponent {
  private readonly api = inject(PortfolioApi);
  private readonly router = inject(Router);

  private readonly transcript =
    viewChild<ElementRef<HTMLDivElement>>('transcript');

  private readonly chatInput =
    viewChild<ElementRef<HTMLInputElement>>('chatInput');

  private readonly launcher =
    viewChild<ElementRef<HTMLButtonElement>>('launcher');

  readonly open = signal(false);
  readonly pending = signal(false);

  readonly messages = signal<ChatMessage[]>([
    this.welcomeMessage(),
  ]);

  readonly prompts = [
    { label: 'Projects', message: 'Show me projects' },
    { label: 'Skills', message: 'What technologies does Shivam use?' },
    { label: 'Contact', message: 'Open contact' },
  ];

  draft = '';

  constructor() {
    effect(() => {
      this.messages();
      this.pending();
      this.open();

      setTimeout(() => {
        const element = this.transcript()?.nativeElement;

        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      });
    });
  }

  private welcomeMessage(): ChatMessage {
    return {
      role: 'notice',
      text:
        "Hi! I can answer questions about Shivam's work and help you explore. Try 'show me projects' or ask about the PDF assistant.",
    };
  }

  toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }

    this.open.set(true);
    setTimeout(() => this.chatInput()?.nativeElement.focus());
  }

  close(): void {
    this.open.set(false);
    this.launcher()?.nativeElement.focus();
  }

  clear(): void {
    if (!this.pending()) {
      this.messages.set([this.welcomeMessage()]);
    }
  }

  routeLabel(route: PagePath): string {
    const labels: Record<PagePath, string> = {
      '/': 'Home',
      '/about': 'About',
      '/projects': 'Projects',
      '/skills': 'Skills',
      '/contact': 'Contact',
      '/projects#pdf-assistant': 'AI PDF Assistant',
      '/projects#portfolio-assistant': 'Portfolio AI Chatbot',
    };

    return labels[route];
  }

  async visit(route: PagePath): Promise<void> {
    if (!PAGE_PATHS.includes(route)) {
      return;
    }

    try {
      const navigated = await this.router.navigateByUrl(route);

      if (!navigated && this.router.url !== route) {
        throw new Error('Navigation did not complete.');
      }
    } catch {
      this.messages.update(messages => [
        ...messages,
        {
          role: 'notice',
          text: 'I could not open that page. Please use the navigation menu.',
        },
      ]);
    }
  }

  async send(suggestedMessage?: string): Promise<void> {
    const text = (suggestedMessage ?? this.draft).trim();

    if (!text || text.length > 2000 || this.pending()) {
      return;
    }

    const history: ChatTurn[] = this.messages()
      .flatMap(message =>
        message.role === 'notice'
          ? []
          : [{ role: message.role, content: message.text }],
      )
      .slice(-8);

    const currentUrl = this.router.url;

    const currentPage: PagePath =
      PAGE_PATHS.find(path => path === currentUrl) ?? '/';

    this.draft = '';
    this.pending.set(true);

    this.messages.update(messages => [
      ...messages,
      { role: 'user', text },
    ]);

    try {
      const result = await this.api.chat(text, currentPage, history);

      const route =
        result.route && PAGE_PATHS.includes(result.route)
          ? result.route
          : null;

      this.messages.update(messages => [
        ...messages,
        {
          role: 'model',
          text: result.answer,
          route,
        },
      ]);

      if (result.navigate && route) {
        await this.visit(route);
      }
    } catch (error) {
      this.messages.update(messages => [
        ...messages,
        {
          role: 'notice',
          text: errorMessage(error),
        },
      ]);
    } finally {
      this.pending.set(false);
      setTimeout(() => this.chatInput()?.nativeElement.focus());
    }
  }
}