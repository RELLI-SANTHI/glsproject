/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { BreadcrumbService, Breadcrumb } from './breadcrumb.service'; // Adjust the import path as necessary
import { take } from 'rxjs/operators';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreadcrumbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default breadcrumbs', (done) => {
    service
      .getBreadcrumbs()
      .pipe(take(1))
      .subscribe((breadcrumbs) => {
        expect(breadcrumbs).toEqual([{ label: 'navmenu.home', url: '/home' }]);
        done();
      });
  });

  it('should add a breadcrumb', (done) => {
    const newBreadcrumb: Breadcrumb = { label: 'navmenu.about', url: '/about' };
    service.addBreadcrumb(newBreadcrumb);

    service
      .getBreadcrumbs()
      .pipe(take(1))
      .subscribe((breadcrumbs) => {
        expect(breadcrumbs).toContain(newBreadcrumb);
        done();
      });
  });

  it('should remove a breadcrumb', (done) => {
    const newBreadcrumb: Breadcrumb = { label: 'navmenu.about', url: '/about' };
    service.addBreadcrumb(newBreadcrumb);
    service.removeBreadcrumbFrom(newBreadcrumb);

    service
      .getBreadcrumbs()
      .pipe(take(1))
      .subscribe((breadcrumbs) => {
        expect(breadcrumbs).not.toContain(newBreadcrumb);
        done();
      });
  });

  it('should clear breadcrumbs', (done) => {
    const newBreadcrumb: Breadcrumb = { label: 'navmenu.about', url: '/about' };
    service.addBreadcrumb(newBreadcrumb);
    service.resetBreadcrumbs();

    service
      .getBreadcrumbs()
      .pipe(take(1))
      .subscribe((breadcrumbs) => {
        expect(breadcrumbs).toEqual([{ label: 'navmenu.home', url: '/home' }]);
        done();
      });
  });
});
