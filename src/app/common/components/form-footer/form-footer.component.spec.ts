import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

import { FormFooterComponent } from './form-footer.component';
import { GenericService } from '../../utilities/services/generic.service';
import { VIEW_MODE } from '../../app.constants';

// eslint-disable-next-line max-lines-per-function
describe('FormFooterComponent', () => {
  let component: FormFooterComponent;
  let fixture: ComponentFixture<FormFooterComponent>;
  let mockGenericService: jasmine.SpyObj<GenericService>;

  beforeEach(async () => {
    mockGenericService = jasmine.createSpyObj('GenericService', ['viewModeValue', 'sidebarOpenedValue'], {
      viewModeValue: VIEW_MODE.DESKTOP,
      sidebarOpenedValue: true
    });

    await TestBed.configureTestingModule({
      imports: [FormFooterComponent, TranslatePipe, TranslateModule.forRoot()],
      providers: [{ provide: GenericService, useValue: mockGenericService }, TranslateService]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit exitEvent when goToExit is called', () => {
    spyOn(component.exitEvent, 'emit');
    component.goToExit();
    expect(component.exitEvent.emit).toHaveBeenCalled();
  });

  it('should emit saveDraftExitEvent when saveDraftExit is called', () => {
    spyOn(component.saveDraftExitEvent, 'emit');
    component.saveDraftExit();
    expect(component.saveDraftExitEvent.emit).toHaveBeenCalled();
  });

  it('should emit nextBtnEvent when nextBtnEv is called', () => {
    spyOn(component.nextBtnEvent, 'emit');
    component.nextBtnEv();
    expect(component.nextBtnEvent.emit).toHaveBeenCalled();
  });

  it('should set dynamic stepper width based on view mode and sidebar state', () => {
    const setPropertySpy = spyOn(document.documentElement.style, 'setProperty');

    Object.defineProperty(mockGenericService, 'sidebarOpenedValue', { get: () => false });
    Object.defineProperty(mockGenericService, 'viewModeValue', { get: () => VIEW_MODE.DESKTOP });

    fixture = TestBed.createComponent(FormFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(setPropertySpy).toHaveBeenCalledWith('--dynamic-stepper-width', '4.25rem');
  });

  it('should set dynamic stepper width to 0rem for MOBILE view mode', fakeAsync(() => {
    const setPropertySpy = spyOn(document.documentElement.style, 'setProperty');
    Object.defineProperty(mockGenericService, 'viewModeValue', { get: () => VIEW_MODE.MOBILE });

    fixture = TestBed.createComponent(FormFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(setPropertySpy).toHaveBeenCalledWith('--dynamic-stepper-width', '0rem');
  }));
});
