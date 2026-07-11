import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { Applicazione } from './app/app';

bootstrapApplication(Applicazione, appConfig)
  .catch((err) => console.error(err));
