/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router, NavigationEnd } from '@angular/router';
import { BreadcrumbInterceptor } from './breadcrumb.interceptor';
import { BreadcrumbService } from '../../services/breadcrumb/breadcrumb.service';
import { of } from 'rxjs';
import { HttpRequest, HttpResponse } from '@angular/common/http';

describe('BreadcrumbInterceptor', () => {
  let interceptor: BreadcrumbInterceptor;
  let breadcrumbService: BreadcrumbService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BreadcrumbInterceptor,
        {
          provide: Router,
          useValue: {
            events: of(new NavigationEnd(0, '/home', '/home'))
          }
        },
        {
          provide: BreadcrumbService,
          useValue: {
            addBreadcrumb: jasmine.createSpy('addBreadcrumb'),
            resetBreadcrumbs: jasmine.createSpy('resetBreadcrumbs'),
            removeBreadcrumbFrom: jasmine.createSpy('removeBreadcrumbFrom')
          }
        }
      ]
    });

    interceptor = TestBed.inject(BreadcrumbInterceptor);
    breadcrumbService = TestBed.inject(BreadcrumbService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should pass through the request', () => {
    const httpRequest = new HttpRequest('GET', '/test');
    interceptor
      .intercept(httpRequest, {
        handle: () => of(new HttpResponse({ status: 200 }))
      })
      .subscribe((response: any) => {
        expect(response.status).toBe(200);
      });

    httpMock.verify();
  });
});
