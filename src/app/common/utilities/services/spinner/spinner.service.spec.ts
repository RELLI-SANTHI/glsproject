import { TestBed } from '@angular/core/testing';
import { SpinnerStatusService } from './spinner.service';

describe('SpinnerStatusService', () => {
  let service: SpinnerStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpinnerStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have loaderState initialized to false', () => {
    expect(service.loaderState()).toBe(false);
  });

  it('should set loaderState to true when show() is called', () => {
    service.show();
    expect(service.loaderState()).toBe(true);
  });

  it('should set loaderState to false when hide() is called', () => {
    service.show();
    service.hide();
    expect(service.loaderState()).toBe(false);
  });
});
