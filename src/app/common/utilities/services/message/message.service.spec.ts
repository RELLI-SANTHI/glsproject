import { TestBed } from '@angular/core/testing';
import { MessageStatusService } from './message.service';
import { AlertMessage } from '../../../models/alert-message';

// eslint-disable-next-line max-lines-per-function
describe('MessageStatusService', () => {
  let service: MessageStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update messageState$ when show is called', (done) => {
    const testMessage = 'Test message';
    service.show(testMessage);
    service.messageState$.subscribe((message) => {
      expect(message).toBe(testMessage);
      done();
    });
  });

  it('should set messageState$ to null when hide is called', (done) => {
    service.hide();
    service.messageState$.subscribe((message) => {
      expect(message).toBeNull();
      done();
    });
  });

  it('should set and retrieve warningMessage correctly', () => {
    const testWarning: AlertMessage = { title: 'Warning Title', message: 'Warning Message' };
    service.setWarningMessage(testWarning);
    expect(service.getWarningMessage()).toEqual(testWarning);
  });

  it('should return null for warningMessage after setting it to null', () => {
    service.setWarningMessage(null);
    expect(service.getWarningMessage()).toBeNull();
  });
  it('should set and retrieve params correctly', () => {
    const params = { foo: 'bar', baz: 123 };
    service.setWarningMessage(null, params);
    expect(service.getParams()).toEqual(params);
  });

  it('should return empty object if params are not set', () => {
    service.setWarningMessage(null);
    expect(service.getParams()).toEqual({});
  });

  it('should set and retrieve successMessage correctly', () => {
    const testSuccess: AlertMessage = { title: 'Success Title', message: 'Success Message', showDownloadReportButton: true };
    service.setSuccessMessage(testSuccess);
    expect(service.getSuccessMessage()).toEqual(testSuccess);
  });

  it('should return null for successMessage after setting it to null', () => {
    service.setSuccessMessage(null);
    expect(service.getSuccessMessage()).toBeNull();
  });
});
