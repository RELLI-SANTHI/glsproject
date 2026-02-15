/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuardService } from './auth-guard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityRouting } from '../../utility-routing';
import { UtilityProfile } from '../../utility-profile';
import { UserProfileService } from '../profile/user-profile.service';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('AuthGuardService', () => {
  let service: AuthGuardService;
  let routerSpy: jasmine.SpyObj<Router>;
  let userProfileServiceMock: jasmine.SpyObj<UserProfileService>;
  let utilityProfileSpy: jasmine.Spy;
  let utilityRoutingSpy: jasmine.Spy;
  let mockRoute: ActivatedRouteSnapshot;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userProfileServiceMock = jasmine.createSpyObj('UserProfileService', ['getProfilePermissions']);

    // Spy on static methods
    utilityProfileSpy = spyOn(UtilityProfile, 'checkAccessProfile');
    utilityRoutingSpy = spyOn(UtilityRouting, 'navigateToHome');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthGuardService,
        { provide: Router, useValue: routerSpy },
        { provide: UserProfileService, useValue: userProfileServiceMock }
      ]
    });

    UtilityRouting.initialize(TestBed.inject(Router));

    service = TestBed.inject(AuthGuardService);

    // Create a mock route
    mockRoute = { data: {} } as ActivatedRouteSnapshot;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow access when user has permission', () => {
    // Arrange
    mockRoute.data = {
      profile: 'admin',
      functionality: 'users',
      permission: 'read'
    };
    utilityProfileSpy.and.returnValue(true);

    // Act
    const result = service.canActivate(mockRoute);

    // Assert
    expect(result).toBe(true);
    expect(utilityProfileSpy).toHaveBeenCalledWith(
      jasmine.any(Object),
      'admin',
      'users',
      'read'
    );
    expect(utilityRoutingSpy).not.toHaveBeenCalled();
  });

  it('should deny access when user does not have permission', () => {
    // Arrange
    mockRoute.data = {
      profile: 'user',
      functionality: 'admin-panel',
      permission: 'write'
    };
    utilityProfileSpy.and.returnValue(false);

    // Act
    const result = service.canActivate(mockRoute);

    // Assert
    expect(result).toBe(false);
    expect(utilityProfileSpy).toHaveBeenCalledWith(
      jasmine.any(Object),
      'user',
      'admin-panel',
      'write'
    );
    expect(utilityRoutingSpy).toHaveBeenCalled();
  });

  it('should handle profile as string array', () => {
    // Arrange
    mockRoute.data = {
      profile: ['admin', 'manager'],
      functionality: 'reports',
      permission: 'read'
    };
    utilityProfileSpy.and.returnValue(true);

    // Act
    const result = service.canActivate(mockRoute);

    // Assert
    expect(result).toBe(true);
    expect(utilityProfileSpy).toHaveBeenCalledWith(
      jasmine.any(Object),
      ['admin', 'manager'],
      'reports',
      'read'
    );
  });

  it('should handle missing route data properties', () => {
    // Arrange
    mockRoute.data = {
      // No properties specified
    };
    utilityProfileSpy.and.returnValue(false);

    // Act
    const result = service.canActivate(mockRoute);

    // Assert
    expect(result).toBe(false);
    expect(utilityProfileSpy).toHaveBeenCalledWith(
      jasmine.any(Object),
      undefined,
      undefined,
      undefined
    );
    expect(utilityRoutingSpy).toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    // Arrange
    const subscription1 = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    const subscription2 = jasmine.createSpyObj('Subscription', ['unsubscribe']);

    // Access private property using any type casting
    (service as any).subscriptionList = [subscription1, subscription2];

    // Act
    service.ngOnDestroy();

    // Assert
    expect(subscription1.unsubscribe).toHaveBeenCalled();
    expect(subscription2.unsubscribe).toHaveBeenCalled();
  });
});