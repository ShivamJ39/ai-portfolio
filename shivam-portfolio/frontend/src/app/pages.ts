import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { map } from 'rxjs';

import { PortfolioApi, errorMessage } from './api';

type PageName = 'home' | 'about' | 'projects' | 'skills' | 'contact';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    @switch (page()) {
      @case ('home') {
        <section class="hero">
          <div>
            <p class="eyebrow">FULL-STACK DEVELOPMENT · AI SYSTEMS</p>

            <h1>
              Hi, I'm Shivam.<br>
              <span class="gradient-text">I build ideas into software.</span>
            </h1>

            <p class="lead">
              Full-stack developer and AI systems engineer building
              useful web experiences, reliable APIs, and intelligent tools.
            </p>

            <div class="actions">
              <a class="button primary" routerLink="/projects">
                Explore my work →
              </a>

              <a class="button secondary" routerLink="/contact">
                Let's talk
              </a>
            </div>

            <div class="hero-tags">
              <span>Python</span>
              <span>FastAPI</span>
              <span>JavaScript</span>
              <span>Generative AI</span>
            </div>
          </div>

          <div class="profile-card">
            <div class="monogram" aria-hidden="true">SJ</div>
            <p class="eyebrow">DEVELOPER PROFILE</p>
            <h2>Shivam</h2>
            <p>Full-Stack Developer<br>& AI Systems Engineer</p>
            <div class="code-line">ideas → code → impact</div>
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">WHAT I BUILD</p>
          <h2>Practical engineering. Intelligent experiences.</h2>

          <div class="grid three">
            <article class="card">
              <span class="card-number">01</span>
              <h3>Full-stack applications</h3>
              <p>
                Connected frontend experiences and REST APIs
                designed around real user needs.
              </p>
            </article>

            <article class="card">
              <span class="card-number">02</span>
              <h3>AI-powered tools</h3>
              <p>
                Document assistants, conversational interfaces,
                and retrieval augmented generation systems.
              </p>
            </article>

            <article class="card">
              <span class="card-number">03</span>
              <h3>Reliable services</h3>
              <p>
                Rate-limit handling, model fallbacks,
                and deployment strategies.
              </p>
            </article>
          </div>
        </section>
      }

      @case ('about') {
        <section class="section">
          <p class="eyebrow">ABOUT ME</p>
          <h1>Curious about problems.<br>Focused on building.</h1>

          <div class="grid two">
            <article class="card">
              <h2>My approach</h2>
              <p>
                I'm Shivam, a full-stack developer and AI systems
                engineer working with Python, JavaScript, and
                modern AI tooling.
              </p>
              <p>
                I enjoy connecting application interfaces with
                backend services and turning AI capabilities
                into useful products.
              </p>
            </article>

            <article class="card">
              <h2>Engineering interests</h2>
              <ul class="detail-list">
                <li>RESTful API design with FastAPI</li>
                <li>Retrieval augmented generation and vector search</li>
                <li>Conversational AI experiences</li>
                <li>Resilient services and cloud deployments</li>
              </ul>
              <a class="text-link" routerLink="/projects">
                See these ideas in my projects →
              </a>
            </article>
          </div>
        </section>
      }

      @case ('projects') {
        <section class="section">
          <p class="eyebrow">SELECTED WORK</p>
          <h1>Projects with a purpose.</h1>
          <p class="lead">
            A selection of applications connecting thoughtful
            interfaces, backend engineering, and AI.
          </p>

          <div class="grid two">
            @for (project of projects; track project.id) {
              <article class="card project-card" [id]="project.id">
                <div class="project-art" aria-hidden="true">
                  {{ project.symbol }}
                </div>

                <p class="eyebrow">{{ project.category }}</p>
                <h2>{{ project.name }}</h2>
                <p>{{ project.description }}</p>

                <ul class="detail-list">
                  @for (feature of project.features; track feature) {
                    <li>{{ feature }}</li>
                  }
                </ul>

                <div class="tags">
                  @for (technology of project.technologies; track technology) {
                    <span>{{ technology }}</span>
                  }
                </div>

                <a
                  class="text-link"
                  href="https://github.com/ShivamJ39"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore my GitHub ↗
                </a>
              </article>
            }
          </div>
        </section>
      }

      @case ('skills') {
        <section class="section">
          <p class="eyebrow">MY TOOLKIT</p>
          <h1>The tools behind the work.</h1>
          <p class="lead">
            Technologies I use across application development,
            AI systems, and deployment.
          </p>

          <div class="grid three">
            @for (group of skillGroups; track group.name) {
              <article class="card">
                <h2>{{ group.name }}</h2>

                <div class="tags">
                  @for (skill of group.skills; track skill) {
                    <span>{{ skill }}</span>
                  }
                </div>
              </article>
            }
          </div>
        </section>
      }

      @case ('contact') {
        <section class="section">
          <p class="eyebrow">GET IN TOUCH</p>
          <h1>Let's build something useful.</h1>

          <div class="grid two">
            <div>
              <p class="lead">
                Have a project, a question, or an opportunity?
                Send me a message.
              </p>

              <div class="card">
                <h2>Find me online</h2>

                <p>
                  <a
                    class="text-link"
                    href="https://github.com/ShivamJ39"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub ↗
                  </a>
                </p>

                <p>
                  <a
                    class="text-link"
                    href="www.linkedin.com/in/shivam-jadhav-41769a283"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn ↗
                  </a>
                </p>

                <p>
                  <a
                    class="text-link"
                    href="https://www.instagram.com/shivamj39"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram ↗
                  </a>
                </p>

                <p>
                  <a
                    class="text-link"
                    [href]="safeMailtoUrl"
                  >
                    {{ contactEmail }}
                  </a>
                </p>
              </div>
            </div>

            <form
              class="card contact-form"
              [formGroup]="form"
              (ngSubmit)="submitContact()"
              [attr.aria-busy]="sending()"
            >
              <label for="contact-name">Name</label>
              <input
                id="contact-name"
                formControlName="name"
                autocomplete="name"
                minlength="2"
                maxlength="100"
                required
              >

              <label for="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                formControlName="email"
                autocomplete="email"
                maxlength="254"
                required
              >

              <label for="contact-message">Message</label>
              <textarea
                id="contact-message"
                formControlName="message"
                rows="6"
                minlength="10"
                maxlength="5000"
                required
              ></textarea>

              @if (form.invalid && form.touched) {
                <p class="error" role="alert">
                  Enter your name, a valid email address,
                  and a message of at least 10 characters.
                </p>
              }

              <button
                class="button primary"
                type="submit"
                [disabled]="sending()"
              >
                {{ sending() ? 'Sending…' : 'Send message →' }}
              </button>

              @if (contactStatus()) {
                <p
                  role="status"
                  [class.error]="contactFailed()"
                  [class.success]="!contactFailed()"
                >
                  {{ contactStatus() }}
                </p>
              }
            </form>
          </div>
        </section>
      }
    }
  `,
})
export class PageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PortfolioApi);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  readonly page = toSignal(
    this.route.data.pipe(map(data => data['page'] as PageName)),
    { initialValue: 'home' as PageName },
  );

  readonly contactEmail = 'shivamjadhav1239@gmail.com';

  get safeMailtoUrl(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(`mailto:${this.contactEmail}`);
  }

  readonly sending = signal(false);
  readonly contactStatus = signal('');
  readonly contactFailed = signal(false);

  readonly form = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(/\S/),
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254),
    ]],
    message: ['', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(5000),
      Validators.pattern(/\S/),
    ]],
  });

  readonly projects = [
    {
      id: 'pdf-assistant',
      symbol: 'PDF ↗',
      category: 'AI · RETRIEVAL AUGMENTED GENERATION',
      name: 'AI PDF Assistant',
      description:
        'A full-stack document assistant that turns long PDFs into searchable knowledge.',
      features: [
        'Support for PDFs with 150+ pages',
        'FAISS vector search and Gemini embeddings',
        'Rate-limit backoff and model fallback strategies',
        'Render backend and Netlify frontend deployment',
      ],
      technologies: ['Python', 'FastAPI', 'FAISS', 'Gemini', 'JavaScript'],
    },
    {
      id: 'portfolio-assistant',
      symbol: 'AI ✦',
      category: 'AI · CONVERSATIONAL EXPERIENCE',
      name: 'Portfolio AI Chatbot',
      description:
        'A conversational portfolio guide helping visitors explore projects, skills, and contact information.',
      features: [
        'Answers grounded in portfolio information',
        'Conversation history and contextual responses',
        'Direct page navigation and suggested destinations',
        'FastAPI backend with structured Gemini responses',
      ],
      technologies: ['Angular', 'FastAPI', 'Gemini', 'TypeScript'],
    },
  ];

  readonly skillGroups = [
    {
      name: 'Frontend',
      skills: ['JavaScript', 'Angular', 'HTML', 'CSS'],
    },
    {
      name: 'Backend',
      skills: ['Python', 'FastAPI', 'Node.js', 'REST APIs'],
    },
    {
      name: 'AI & delivery',
      skills: ['FAISS', 'Gemini API', 'RAG', 'Docker', 'Git'],
    },
  ];

  async submitContact(): Promise<void> {
    if (this.sending()) {
      return;
    }

    const raw = this.form.getRawValue();

    // Validate the trimmed values that will actually be submitted.
    this.form.setValue({
      name: raw.name.trim(),
      email: raw.email.trim(),
      message: raw.message.trim(),
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending.set(true);
    this.contactStatus.set('');
    this.contactFailed.set(false);

    try {
      const result = await this.api.contact(this.form.getRawValue());
      this.contactStatus.set(result.message);
      this.form.reset();
    } catch (error) {
      this.contactFailed.set(true);
      this.contactStatus.set(errorMessage(error));
    } finally {
      this.sending.set(false);
    }
  }
}
