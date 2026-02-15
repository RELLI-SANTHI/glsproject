/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationErrorModalComponent } from './authorization-error-modal.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { UtilityRouting } from '../../utilities/utility-routing';

describe('AuthorizationErrorModalComponent', () => {
  let component: AuthorizationErrorModalComponent;
  let fixture: ComponentFixture<AuthorizationErrorModalComponent>;
  let activeModal: NgbActiveModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationErrorModalComponent, TranslateModule.forRoot()],
      providers: [NgbActiveModal, TranslateService, TranslateStore]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    activeModal = TestBed.inject(NgbActiveModal);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return 401 error message when errorCode is 401', () => {
    component.errorCode = 401;
    expect(component.getMessage()).toBe('modal.serviceMessage.httpErrors.401');
  });

  it('should return 403 error message when errorCode is 403', () => {
    component.errorCode = 403;
    expect(component.getMessage()).toBe('modal.serviceMessage.httpErrors.403');
  });

  it('should return generic error message for any other error code', () => {
    component.errorCode = 500;
    expect(component.getMessage()).toBe('modal.serviceMessage.genericError');
  });

  it('should close the modal with true value when reload is called', () => {
    const closeSpy = spyOn(activeModal, 'close');
    spyOn(UtilityRouting, 'relocateToHome');

    component.reload();

    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('should call UtilityRouting.relocateToHome when reload is called', () => {
    spyOn(activeModal, 'close');
    const relocateSpy = spyOn(UtilityRouting, 'relocateToHome');

    component.reload();

    expect(relocateSpy).toHaveBeenCalled();
  });

  it('should properly inject the error code', () => {
    TestBed.resetTestingModule();

    const testErrorCode = 403;
    TestBed.configureTestingModule({
      imports: [AuthorizationErrorModalComponent, TranslateModule.forRoot()],
      providers: [NgbActiveModal, TranslateService, TranslateStore, { provide: NgbModal, useValue: testErrorCode }]
    }).compileComponents();

    const testFixture = TestBed.createComponent(AuthorizationErrorModalComponent);
    const testComponent = testFixture.componentInstance;

    expect(testComponent.errorCode).toBe(testErrorCode);
    expect(testComponent.getMessage()).toBe('modal.serviceMessage.httpErrors.403');
  });

  // we are unable to test because in this method we are trying to reload the full page.
  xit('should close the modal and redirect to /home', () => {
    // Spy on the activeModal.close method
    const closeSpy = spyOn(activeModal, 'close');

    // Mock window.location.href
    const locationSpy = spyOnProperty(window, 'location', 'get').and.returnValue({
      ...window.location, // Spread the existing properties of the Location object
      href: '/home'
    });

    component.reload();

    // Assert that the modal was closed with the correct argument
    expect(closeSpy).toHaveBeenCalledWith(true);
    // Assert that the page was redirected to /home
    expect(locationSpy().href).toBe('/home');
  });
});
