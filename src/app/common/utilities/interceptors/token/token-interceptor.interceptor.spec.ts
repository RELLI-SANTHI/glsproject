import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TokenInterceptor } from './token-interceptor.interceptor';
import { LoggedUserService } from '../../services/user/logged-user.service';
import { UserProfileService } from '../../services/profile/user-profile.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerStatusService } from '../../services/spinner/spinner.service';
import { of } from 'rxjs';

describe('TokenInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let loggedUserServiceSpy: jasmine.SpyObj<LoggedUserService>;
  let userProfileServiceSpy: jasmine.SpyObj<UserProfileService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let spinnerServiceSpy: jasmine.SpyObj<SpinnerStatusService>;
  let modalRefSpy: jasmine.SpyObj<NgbModalRef>;

  beforeEach(() => {
    loggedUserServiceSpy = jasmine.createSpyObj('LoggedUserService', ['update']);
    userProfileServiceSpy = jasmine.createSpyObj('UserProfileService', ['getLoggedUser'], {
      impersonatedUser$: of(null)
    });
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    spinnerServiceSpy = jasmine.createSpyObj('SpinnerStatusService', ['show', 'hide']);
    modalRefSpy = jasmine.createSpyObj('NgbModalRef', ['result'], { result: Promise.resolve('closed') });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: LoggedUserService, useValue: loggedUserServiceSpy },
        { provide: UserProfileService, useValue: userProfileServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: SpinnerStatusService, useValue: spinnerServiceSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add custom headers to non-asset requests', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Access-Control-Allow-Origin')).toBeTrue();
    expect(req.request.headers.has('Access-Control-Expose-Headers')).toBeTrue();
    req.flush({});
  });

  it('should not add headers to asset requests', () => {
    httpClient.get('assets/data/app.config.json').subscribe();

    const req = httpMock.expectOne('assets/data/app.config.json');
    expect(req.request.headers.has('Access-Control-Allow-Origin')).toBeFalse();
    req.flush({});
  });

  it('should handle 403 errors by opening a modal', async () => {
    modalServiceSpy.open.and.returnValue(modalRefSpy);

    httpClient.get('/api/test').subscribe({
      error: () => {
        expect(modalServiceSpy.open).toHaveBeenCalled();
        expect(spinnerServiceSpy.hide).toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    await modalRefSpy.result;
  });

  it('should handle 201 responses by updating the user profile', () => {
    const mockUser = { id: 1, name: 'Test User' };
    userProfileServiceSpy.getLoggedUser.and.returnValue(of(mockUser));

    httpClient.get('/api/test').subscribe({
      error: () => {
        expect(userProfileServiceSpy.getLoggedUser).toHaveBeenCalled();
        expect(loggedUserServiceSpy.update).toHaveBeenCalledWith(mockUser);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 201, statusText: 'Created' });
  });

  it('should handle 201 responses by updating the user profile and navigating to home', fakeAsync(() => {
    const mockUser = { id: 1, name: 'Test User' };
    userProfileServiceSpy.getLoggedUser.and.returnValue(of(mockUser));

    httpClient.get('/api/test').subscribe({
      error: () => {
        expect(userProfileServiceSpy.getLoggedUser).toHaveBeenCalled();
        expect(loggedUserServiceSpy.update).toHaveBeenCalledWith(mockUser);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 201, statusText: 'Created' });

    tick(500);
  }));

  it('should handle 401 errors by opening a modal', () => {
    modalServiceSpy.open.and.returnValue(modalRefSpy);

    httpClient.get('/api/test').subscribe({
      error: () => {
        expect(modalServiceSpy.open).toHaveBeenCalled();
        expect(spinnerServiceSpy.hide).toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('should not open multiple modals for consecutive auth errors', () => {
    modalServiceSpy.open.and.returnValue(modalRefSpy);

    httpClient.get('/api/test1').subscribe({
      error: () => {
        expect(modalServiceSpy.open).toHaveBeenCalledTimes(1);
      }
    });

    const req1 = httpMock.expectOne('/api/test1');
    req1.flush({}, { status: 403, statusText: 'Forbidden' });

    httpClient.get('/api/test2').subscribe({
      error: () => {
        expect(modalServiceSpy.open).toHaveBeenCalledTimes(1);
      }
    });

    const req2 = httpMock.expectOne('/api/test2');
    req2.flush({}, { status: 401, statusText: 'Unauthorized' });
  });
});
