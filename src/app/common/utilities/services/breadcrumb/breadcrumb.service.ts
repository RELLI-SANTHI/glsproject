import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbs: Breadcrumb[] = [{ label: 'navmenu.home', url: '/home' }];
  private breadcrumbsSubject: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>(this.breadcrumbs);

  getBreadcrumbs(): Observable<Breadcrumb[]> {
    return this.breadcrumbsSubject.asObservable();
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push(breadcrumb);
    this.breadcrumbsSubject.next(this.breadcrumbs);
  }

  removeBreadcrumbFrom(breadcrumb: Breadcrumb): void {
    // remove the element and all next elements
    const index = this.breadcrumbs.findIndex((b) => b.label === breadcrumb.label);
    if (index !== -1) {
      this.breadcrumbs = this.breadcrumbs.slice(0, index);
    }
    this.breadcrumbsSubject.next(this.breadcrumbs);
  }

  removeLastBreadcrumb(): void {
    // remove the last element
    this.breadcrumbs.pop();
    this.breadcrumbsSubject.next(this.breadcrumbs);
  }

  resetBreadcrumbs(): void {
    this.breadcrumbs = [{ label: 'navmenu.home', url: '/home' }];
    this.breadcrumbsSubject.next(this.breadcrumbs);
  }
}
