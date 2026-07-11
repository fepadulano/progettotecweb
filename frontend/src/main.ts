import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { Applicazione } from './app/applicazione';

bootstrapApplication(Applicazione, appConfig)
  .catch((err) => console.error(err));
