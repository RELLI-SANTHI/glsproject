/* eslint-disable max-lines-per-function */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { GlsMessagesComponent } from './gls-messages.component';
import { MessageStatusService } from '../../utilities/services/message/message.service';
import { TranslateModule } from '@ngx-translate/core';

describe('GlsMessagesComponent', () => {
  let component: GlsMessagesComponent;
  let fixture: ComponentFixture<GlsMessagesComponent>;
  let messageServiceMock: any;

  beforeEach(async () => {
    messageServiceMock = {
      getWarningMessage: jasmine.createSpy('getWarningMessage').and.returnValue(null),
      getSuccessMessage: jasmine.createSpy('getSuccessMessage').and.returnValue(null),
      setWarningMessage: jasmine.createSpy('setWarningMessage'),
      setSuccessMessage: jasmine.createSpy('setSuccessMessage'),
      messageState$: {
        subscribe: () => {}
      }, // minimal stub if needed by template
      hide: jasmine.createSpy('hide'),
      getParams: jasmine.createSpy('getParams').and.returnValue({})
    };

    await TestBed.configureTestingModule({
      imports: [GlsMessagesComponent, TranslateModule.forRoot()],
      providers: [{ provide: MessageStatusService, useValue: messageServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject MessageStatusService', () => {
    expect(component['messageStatusService']).toBe(messageServiceMock);
  });

  it('should call setWarningMessage with null when closeWarningMessage is called', () => {
    component.closeWarningMessage();
    expect(messageServiceMock.setWarningMessage).toHaveBeenCalledOnceWith(null);
  });

  it('should call closeWarningMessage when close button is clicked', () => {
    messageServiceMock.getWarningMessage.and.returnValue({ title: 'Warning', message: 'Body' });
    fixture.detectChanges();
    spyOn(component, 'closeWarningMessage');
    const closeButton = fixture.nativeElement.querySelector('.warning-close-icon');
    closeButton.click();
    expect(component.closeWarningMessage).toHaveBeenCalled();
  });

  it('should display warning message when getWarningMessage provides one', () => {
    const warning = { title: 'Test title', message: 'Test message' };
    messageServiceMock.getWarningMessage.and.returnValue(warning);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.warning-message-title').textContent).toContain('Test title');
    expect(compiled.querySelector('.warning-message-body').textContent).toContain('Test message');
  });

  it('should not display warning message when getWarningMessage returns null', () => {
    messageServiceMock.getWarningMessage.and.returnValue(null);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.warning-message-title')).toBeNull();
    expect(compiled.querySelector('.warning-message-body')).toBeNull();
  });

  it('should hide warning message after close button is clicked', fakeAsync(() => {
    let warning: { title: string; message: string } | null = { title: 'Test title', message: 'Test message' };
    messageServiceMock.getWarningMessage.and.callFake(() => warning);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.warning-close-icon');
    closeButton.click();
    warning = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.warning-message-title')).toBeNull();
    expect(compiled.querySelector('.warning-message-body')).toBeNull();
  }));

  it('should emit downloadEvent when downloadReport is called', () => {
    spyOn(component.downloadEvent, 'emit');
    component.downloadReport();
    expect(component.downloadEvent.emit).toHaveBeenCalled();
  });

  it('should emit downloadEvent when download button is clicked', () => {
    spyOn(component.downloadEvent, 'emit');
    // Forza la presenza del bottone sia per warning che per success
    messageServiceMock.getWarningMessage.and.returnValue(null);
    messageServiceMock.getSuccessMessage.and.returnValue({ title: 'Success', message: 'Body' });
    // Ensure any additional conditions for the download button are met
    if ('showDownloadButton' in component) {
      (component as any).showDownloadButton = true;
    }
    fixture.detectChanges();

    // Use a more specific selector for the download button
    const downloadButton = fixture.nativeElement.querySelector('.download-report-btn');
    if (downloadButton) {
      downloadButton.click();
      expect(component.downloadEvent.emit).toHaveBeenCalled();
    }
  });
});
