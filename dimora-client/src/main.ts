import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {environment} from './environments/environment';

interface GoogleMapsConfig {
  key: string;
  v: string;
  [key: string]: string;
}

((config: GoogleMapsConfig) => {
  let loadPromise: Promise<unknown>;
  let script: HTMLScriptElement;
  let key: keyof GoogleMapsConfig;
  const API_NAME = "The Google Maps JavaScript API";
  const GOOGLE = "google";
  const IMPORT_LIB = "importLibrary";
  const CALLBACK = "__ib__";
  const doc = document;
  const win = (window as any);

  win[GOOGLE] = win[GOOGLE] || {};
  const maps = win[GOOGLE].maps = win[GOOGLE].maps || {};
  const libraries = new Set<string>();
  const params = new URLSearchParams();

  const load = () => loadPromise || (loadPromise = new Promise(async (resolve, reject) => {
    script = doc.createElement("script");
    params.set("libraries", [...libraries].join(","));

    for (key in config) {
      params.set(
        key.replace(/[A-Z]/g, m => "_" + m[0].toLowerCase()),
        config[key]
      );
    }

    params.set("callback", `${GOOGLE}.maps.${CALLBACK}`);
    script.src = `https://maps.${GOOGLE}apis.com/maps/api/js?${params}`;
    maps[CALLBACK] = resolve;
    script.onerror = () => reject(Error(API_NAME + " could not load."));
    script.nonce = doc.querySelector("script[nonce]")?.getAttribute("nonce") || "";
    doc.head.append(script);
  }));

  if (maps[IMPORT_LIB]) {
    console.warn(API_NAME + " only loads once. Ignoring:", config);
  } else {
    maps[IMPORT_LIB] = (lib: string, ...args: unknown[]) =>
      libraries.add(lib) && load().then(() => maps[IMPORT_LIB](lib, ...args));
  }
})({
  key: `${environment.googleMapsApiKey}`,
  v: "weekly",
  libraries: environment.googleMapsLibraries.join(","),
  region: "VN",
  language: "vi",

  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
});
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


