import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {environment} from '../environments/environment';
import {authReducer} from './ngrx/reducer/auth.reducer';
import * as authEffects from './ngrx/effects/auth.effects';
import {provideHttpClient} from '@angular/common/http';
import {searchReducer} from './ngrx/reducer/search.reducer';
import * as searchEffects from './ngrx/effects/search.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      auth: authReducer,
      search: searchReducer
    }),
    provideEffects(
      authEffects,
      searchEffects
    ),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideHttpClient()
  ],
};
