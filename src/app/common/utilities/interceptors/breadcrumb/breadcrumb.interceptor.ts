import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb/breadcrumb.service';
import { pathExceptions } from './path-exceptions';

@Injectable()
export class BreadcrumbInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private breadcrumbService: BreadcrumbService
  ) {
    // intercept the route change event
    this.router.events.subscribe((event) => {
      // check if the event is of type NavigationEnd
      // and if the URL after the redirect is defined

      // if the URL is empty, do nothing
      // if the URL is equal to '/', do nothing
      if (event instanceof NavigationEnd && event.urlAfterRedirects) {
        const url = event.urlAfterRedirects;
        // if the URL is defined, split it into parts
        const tmpPaths = url.length > 0 ? url.split('/') : [];
        const newPages = this.detectExceptions(tmpPaths);

        // and take the second part (the page)
        const newPage = newPages.length > 1 ? newPages[1] : '';
        if (newPage.length) {
          if (newPage.includes('home') || newPage === '/') {
            // if the URL is '/' or '/home', call the clearBreadcrumbs service and do not add anything
            this.breadcrumbService.resetBreadcrumbs();

            return;
          }
          // if the page is defined, create a breadcrumb object
          const breadcrumb = { label: 'breadcrumb.' + newPage, url: url };
          // if the page is already present in the breadcrumbs, do not add it and remove all subsequent ones
          this.breadcrumbService.removeBreadcrumbFrom(breadcrumb);
          // and add it to the breadcrumb service
          this.breadcrumbService.addBreadcrumb(breadcrumb);
        }
      }
    });
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req);
  }

  /**
   * Clean the list paths from the pathExceptions
   * @param listPaths
   * @private
   */
  private detectExceptions(listPaths: string[]): string[] {
    return listPaths.filter((path) => !pathExceptions.includes(path));
  }
}
