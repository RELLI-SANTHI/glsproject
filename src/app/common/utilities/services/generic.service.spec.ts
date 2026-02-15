import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericService } from './generic.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VIEW_MODE } from '../../app.constants';

const mockNgbModal = {
  open: jasmine.createSpy('open').and.returnValue({
    componentInstance: {},
    result: Promise.resolve('mockResult'),
    close: jasmine.createSpy('close')
  })
};

describe('GenericService', () => {
  let service: GenericService;
  let modalService: NgbModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: NgbModal, useValue: mockNgbModal }]
    });
    service = TestBed.inject(GenericService);
    modalService = TestBed.inject(NgbModal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update resizeMainPage signal on resizePage (isUserImpressed false)', () => {
    service.isUserImpressed.set(false);
    service.resizePage();
    expect(service.resizeMainPage()).toBe('8.75rem');
  });

  it('should update resizeMainPage signal on resizePage (isUserImpressed true)', () => {
    service.isUserImpressed.set(true);
    service.resizePage();
    expect(service.resizeMainPage()).toBe('12rem');
  });

  it('should get viewModeValue and sidebarOpenedValue', () => {
    service.viewMode.set(VIEW_MODE.DESKTOP);
    service.sidebarOpened.set(true);
    expect(service.viewModeValue).toBe(VIEW_MODE.DESKTOP);
    expect(service.sidebarOpenedValue).toBeTrue();
  });

  it('should call getPageType and update routePageType', () => {
    const spy = spyOn<any>(service['routePageType'], 'next');
    service.getPageType('test');
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should open error modal with openErrorModal', async () => {
    service.openErrorModal('title', 'msg');
    expect(modalService.open).toHaveBeenCalled();
  });

  it('should handle error with manageError (with innerException)', () => {
    const err = {
      error: { innerException: { internalCode: 'ERR', additionalData: [{ placeHolder: 'p', value: 1 }] } }
    } as HttpErrorResponse;
    spyOn(service, 'openErrorModal');
    service.manageError(err);
    expect(service.openErrorModal).toHaveBeenCalledWith(
      'attention',
      'serviceMessage.ERR',
      [{ placeHolder: 'p', value: 1 }]
    );
  });

  it('should handle error with manageError (without innerException)', () => {
    const err = {
      error: JSON.stringify({ innerException: { internalCode: 'GEN', additionalData: undefined } })
    } as HttpErrorResponse;
    spyOn(service, 'openErrorModal');
    service.manageError(err);
    expect(service.openErrorModal).toHaveBeenCalledWith(
      'attention',
      'serviceMessage.GEN',
      undefined
    );
  });

  it('should handle error with manageError (fallback)', () => {
    const err = { error: 'not a json' } as HttpErrorResponse;
    spyOn(service, 'openErrorModal');
    service.manageError(err);
    expect(service.openErrorModal).toHaveBeenCalledWith(
      'attention',
      'serviceMessage.genericError'
    );
  });

  it('should open error modal with callback and showCancel', async () => {
    const callback = jasmine.createSpy('callback');
    // Mock modalService.open to return an object with result property
    (modalService.open as jasmine.Spy).and.returnValue({
      componentInstance: {},
      result: Promise.resolve('ok')
    } as any);
    service.openErrorModal('title', 'msg', undefined, 'confirm', callback, true);
    expect(service.dialogData.showCancel).toBeTrue();
    // Simulate callback invocation
    await service.modalRef.result.then(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it('should handle exception in openErrorModal gracefully', () => {
    // Forza un errore su modalService.open
    (modalService.open as jasmine.Spy).and.throwError('modal error');
    expect(() =>
      service.openErrorModal('title', 'msg')
    ).not.toThrow();
  });

  it('should compute defaultValue based on isUserImpressed', () => {
    service.isUserImpressed.set(true);
    expect(service.defaultValue()).toBe('7rem');
    service.isUserImpressed.set(false);
    expect(service.defaultValue()).toBe('3.5rem');
  });

  it('should set dialogData correctly in openErrorModal', () => {
    service.openErrorModal('t', 'm', [{ placeHolder: 'p', value: 2 }], 'ok', undefined, false);
    expect(service.dialogData).toEqual({
      title: 't',
      content: 'm',
      additionalData: [{ placeHolder: 'p', value: 2 }],
      showCancel: false,
      confirmText: 'ok'
    });
  });
});
