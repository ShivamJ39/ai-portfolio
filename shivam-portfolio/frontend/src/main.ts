import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  Routes,
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';

import { App } from './app/app';
import { PageComponent } from './app/pages';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PageComponent,
    title: 'Shivam | Full-Stack Developer & AI Engineer',
    data: { page: 'home' },
  },
  {
    path: 'about',
    component: PageComponent,
    title: 'About | Shivam',
    data: { page: 'about' },
  },
  {
    path: 'projects',
    component: PageComponent,
    title: 'Projects | Shivam',
    data: { page: 'projects' },
  },
  {
    path: 'skills',
    component: PageComponent,
    title: 'Skills | Shivam',
    data: { page: 'skills' },
  },
  {
    path: 'contact',
    component: PageComponent,
    title: 'Contact | Shivam',
    data: { page: 'contact' },
  },
  {
    path: '**',
    redirectTo: '',
  },
];

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
  ],
}).catch(error => console.error(error));