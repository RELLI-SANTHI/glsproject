import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { TokenInterceptor } from './common/utilities/interceptors/token/token-interceptor.interceptor';
import { BreadcrumbInterceptor } from './common/utilities/interceptors/breadcrumb/breadcrumb.interceptor';
import { environment } from '../environments/environment';
import { GlsNetworkApiInterfaceModule } from './api/glsNetworkApi/gls-network-api-interface.module';
import { GlsUserApiInterfaceModule } from './api/glsUserApi/gls-user-api-interface.module';

// Required for MSAL
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';
import {
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalModule,
  MsalService
} from '@azure/msal-angular';
import { GlsAdministrativeApiInterfaceModule } from './api/glsAdministrativeApi/gls-administrative-api-interface.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { registerLocaleData } from '@angular/common';

import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt);

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      // 'Application (client) ID' of app registration in the Microsoft Entra admin center - this value is a GUID
      clientId: environment.login_azure.clientId,
      // Full directory URL, in the form of https://login.microsoftonline.com/Enter_the_Tenant_Info_Here<tenant>
      authority: environment.login_azure.authority,
      // Must be the same redirectUri as what was provided in your app registration.
      redirectUri: environment.login_azure.redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE
    }
  });
}

// MSAL Interceptor is required to request access tokens in order to access the protected resource (Graph)
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, string[]>();
  // protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);
  protectedResourceMap.set(environment.SERVICE_API.glsNetworkApi, [
    environment.login_azure.ApplicationIDURI + environment.login_azure.beExposeApi
  ]);

  protectedResourceMap.set(environment.SERVICE_API.glsUserApi, [
    environment.login_azure.ApplicationIDURI + environment.login_azure.beExposeApi
  ]);
  protectedResourceMap.set(environment.SERVICE_API.glsAdministrativeApi, [
    environment.login_azure.ApplicationIDURI + environment.login_azure.beExposeApi
  ]);

  protectedResourceMap.set(environment.SERVICE_API.glsAdministrativeApi, [
    environment.login_azure.ApplicationIDURI + environment.login_azure.beExposeApi
  ]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

// MSAL Guard is required to protect routes and require authentication before accessing protected routes
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [environment.login_azure.ApplicationIDURI + environment.login_azure.beExposeApi]
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BreadcrumbInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'it-IT' },
    importProvidersFrom(
      GlsNetworkApiInterfaceModule.forRoot({ rootUrl: environment.SERVICE_API.glsNetworkApi }),
      GlsUserApiInterfaceModule.forRoot({ rootUrl: environment.SERVICE_API.glsUserApi }),
      GlsAdministrativeApiInterfaceModule.forRoot({ rootUrl: environment.SERVICE_API.glsAdministrativeApi }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      MsalModule.forRoot(MSALInstanceFactory(), MSALGuardConfigFactory(), MSALInterceptorConfigFactory()),
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory
      })
    ),
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
