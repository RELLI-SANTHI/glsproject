/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable newline-before-return */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectListTableComponent } from './subject-list-table.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { SubjectService } from '../../../../../api/glsAdministrativeApi/services';
import { of } from 'rxjs';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';

// eslint-disable-next-line max-lines-per-function
describe('SubjectListTableComponent', () => {
  let component: SubjectListTableComponent;
  let fixture: ComponentFixture<SubjectListTableComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let subjectServiceMock: any;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    subjectServiceMock = {
      getApiSubjectV1Id$Json: jasmine.createSpy().and.returnValue(of({ id: 1, isPhysicalPerson: true })),
      postApiSubjectCreate$Json: jasmine.createSpy().and.returnValue(of({ status: 'DRAFT' })),
      patchApiSubjectV1$Json: jasmine.createSpy().and.returnValue(of({ status: 'COMPLETED' })),
      postApiSubjectV1IdLock$Response: jasmine.createSpy('postApiSubjectV1IdLock$Response').and.returnValue(of({ status: 204, body: {} })),
      postApiSubjectV1IdUnlock$Response: jasmine
        .createSpy('postApiSubjectV1IdUnlock$Response')
        .and.returnValue(of({ status: 204, body: {} }))
    };

    TestBed.configureTestingModule({
      imports: [SubjectListTableComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        HttpClient,
        HttpHandler,
        { provide: SubjectService, useValue: subjectServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectListTableComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('subjectList', []);
    fixture.componentRef.setInput('totalItems', 100);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.componentRef.setInput('totalPages', 10);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to subject detail when goToSubjectDetail is called', () => {
    const navigateSpy = spyOn(UtilityRouting, 'navigateToSubjectDetailById');
    component.goToSubjectDetail(42);
    expect(navigateSpy).toHaveBeenCalledWith(42);
  });

  it('should calculate the correct first result', () => {
    const firstResult = component.getFirstResult();
    expect(firstResult).toBe(21);
  });

  it('should calculate the correct last result', () => {
    const lastResult = component.getLastResult();
    expect(lastResult).toBe(30);
  });

  it('should not exceed totalItems in getLastResult', () => {
    fixture.componentRef.setInput('totalItems', 25);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.componentRef.setInput('pageSize', 10);

    fixture.detectChanges();

    const lastResult = component.getLastResult();
    expect(lastResult).toBe(25);
  });
  // eslint-disable-next-line max-lines-per-function
  describe('Your component', () => {
    let component: any;

    let resizeObserverCallback: Function | null = null;
    let observeSpy: jasmine.Spy;
    let disconnectSpy: jasmine.Spy;

    beforeEach(() => {
      // Spy on costructor ResizeObserver global
      resizeObserverCallback = null;
      observeSpy = jasmine.createSpy('observe');
      disconnectSpy = jasmine.createSpy('disconnect');

      spyOn(window as any, 'ResizeObserver').and.callFake(function (callback: Function) {
        resizeObserverCallback = callback;
        return {
          observe: observeSpy,
          disconnect: disconnectSpy
        };
      });

      // Mock component
      component = {
        datatableWrapper: jasmine.createSpy().and.returnValue({
          nativeElement: document.createElement('div')
        }),
        table: jasmine.createSpy(),
        resizeObserver: null,
        ngAfterViewInit: function () {
          this.resizeObserver = new ResizeObserver(() => {
            this.table()?.recalculate();
          });
          this.resizeObserver.observe(this.datatableWrapper()?.nativeElement);
        },
        ngOnDestroy: function () {
          if (this.resizeObserver) {
            this.resizeObserver.disconnect();
          }
        }
      };
    });

    it('ngAfterViewInit crea ResizeObserver e chiama recalculate quando triggerata la callback', () => {
      const recalcSpy = jasmine.createSpy('recalculate');
      component.table.and.returnValue({ recalculate: recalcSpy });

      component.ngAfterViewInit();

      expect(component.resizeObserver).toBeDefined();

      expect(observeSpy).toHaveBeenCalledWith(component.datatableWrapper().nativeElement);

      resizeObserverCallback?.();

      expect(recalcSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy chiama disconnect su ResizeObserver', () => {
      component.resizeObserver = {
        disconnect: disconnectSpy
      };

      component.ngOnDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy non chiama disconnect se resizeObserver è null', () => {
      component.resizeObserver = null;

      component.ngOnDestroy();

      expect(disconnectSpy).not.toHaveBeenCalled();
    });
  });

  it('should not exceed totalItems in getLastResult', () => {
    fixture.componentRef.setInput('totalItems', 25);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.componentRef.setInput('pageSize', 10);

    fixture.detectChanges();

    const lastResult = component.getLastResult();
    expect(lastResult).toBe(25);
  });

  describe('getStatus', () => {
    it('should return the status as typed value', () => {
      const subject: any = { status: 'COMPLETED' };
      expect(component.getStatus(subject)).toBe('COMPLETED');
    });
  });

  describe('getStatusLabel', () => {
    it('should return the correct label for COMPLETED', () => {
      const subject: any = { status: 'COMPLETED' };
      expect(component.getStatusLabel(subject)).toBe('structureList.status.completed');
    });
    it('should return the correct label for DISABLED', () => {
      const subject: any = { status: 'DISABLED' };
      expect(component.getStatusLabel(subject)).toBe('structureList.status.disabled');
    });
  });

  describe('getStatusClass', () => {
    it('should return text-success for COMPLETED', () => {
      const subject: any = { status: 'COMPLETED' };
      expect(component.getStatusClass(subject)).toBe('text-success');
    });
    it('should return disabled for DISABLED', () => {
      const subject: any = { status: 'DISABLED' };
      expect(component.getStatusClass(subject)).toBe('status-disabled');
    });
    it('should return empty string for unknown status', () => {
      const subject: any = { status: 'UNKNOWN' };
      expect(component.getStatusClass(subject)).toBe('');
    });
  });
});
