/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelationshipListTableComponent } from './relationship-list-table.component';
import { ElementRef } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Router } from '@angular/router';

// eslint-disable-next-line max-lines-per-function
describe('RelationshipListTableComponent', () => {
  let component: RelationshipListTableComponent;
  let fixture: ComponentFixture<RelationshipListTableComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RelationshipListTableComponent, TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore, { provide: Router, useValue: routerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RelationshipListTableComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    let mockTable: jasmine.SpyObj<DatatableComponent>;
    let mockWrapper: ElementRef;
    let resizeCallback: ResizeObserverCallback | undefined;

    beforeEach(() => {
      class ResizeObserverMock {
        observe = jasmine.createSpy('observe');
        disconnect = jasmine.createSpy('disconnect');

        constructor(cb: ResizeObserverCallback) {
          resizeCallback = cb;
        }
      }

      (window as any).ResizeObserver = ResizeObserverMock;

      mockTable = jasmine.createSpyObj('DatatableComponent', ['recalculate']);
      mockWrapper = new ElementRef(document.createElement('div'));

      (component as any).table = () => mockTable;
      (component as any).datatableWrapper = () => mockWrapper;
    });

    it('should initialize ResizeObserver and call recalculate on resize', () => {
      component.ngAfterViewInit();

      resizeCallback!([], {} as ResizeObserver);

      expect(mockTable.recalculate).toHaveBeenCalled();
    });
  });

  it('should disconnect ResizeObserver on destroy', () => {
    const disconnectSpy = jasmine.createSpy('disconnect');
    (component as any).resizeObserver = { disconnect: disconnectSpy };

    component.ngOnDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should have a goToCustomersDetail method', () => {
    expect(typeof component.goToCustomersDetail).toBe('function');
  });

  it('getFirstResult restituisce il valore corretto', () => {
    (component as any).currentPage = () => 2;
    (component as any).pageSize = () => 10;
    expect(component.getFirstResult()).toBe(11);
  });

  it('getLastResult restituisce il valore corretto', () => {
    (component as any).currentPage = () => 2;
    (component as any).pageSize = () => 10;
    (component as any).totalItems = () => 25;
    expect(component.getLastResult()).toBe(20);
  });

  it('getLastResult non supera totalItems', () => {
    (component as any).currentPage = () => 3;
    (component as any).pageSize = () => 10;
    (component as any).totalItems = () => 25;
    expect(component.getLastResult()).toBe(25);
  });

  it('ngOnDestroy non lancia errori se resizeObserver è undefined', () => {
    (component as any).resizeObserver = undefined;
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('goToCustomersDetail emette il valore corretto', () => {
    spyOn(component.itemIdSelected, 'emit');
    component.goToCustomersDetail(123);
    expect(component.itemIdSelected.emit).toHaveBeenCalledWith(123);
  });
});
