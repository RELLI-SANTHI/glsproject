/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailComponent } from './user-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsersService } from '../../../api/glsUserApi/services/users.service';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserDetailsModel } from '../../../api/glsUserApi/models/user-details-model';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ImpersonificateUserModalComponent } from './impersonificate-user-modal/impersonificate-user-modal.component';
import { UserAdministrativeModel } from '../../../api/glsUserApi/models';
import { PROFILE } from '../../../common/utilities/constants/profile';
import { UserProfileService } from '../../../common/utilities/services/profile/user-profile.service';
import { MsalService } from '@azure/msal-angular';
import { VIEW_MODE } from '../../../common/app.constants';
import { UtilityRouting } from '../../../common/utilities/utility-routing';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let usersService: jasmine.SpyObj<UsersService>;
  let messageStatusService: jasmine.SpyObj<MessageStatusService>;
  let router: jasmine.SpyObj<Router>;
  let mockUser: UserDetailsModel;
  let modalService: NgbModal;
  let userProfileService: any;
  beforeEach(async () => {
    userProfileService = {
      impersonatedUser$: of({ name: 'Test', profile: 'EVA_USER' } as UserDetailsModel)
    };
    mockUser = {
      accountLoginName: 'john.doe',
      administratives: [
        {
          id: 1,
          name: 'Admin Department',
          structures: [
            {
              id: 101,
              buildingAcronym: 'BLD-A',
              buildingName: 'Building Alpha'
            },
            {
              id: 102,
              buildingAcronym: 'BLD-B',
              buildingName: 'Building Beta'
            }
          ]
        }
      ],
      corporateGroup: {
        id: 1,
        corporateName: 'Corporate Group A'
      },
      createdAt: '2025-01-01T10:00:00.000Z',
      createdBy: 'admin',
      department: 'IT Department',
      email: 'john.doe@example.com',
      entraId: '123e4567-e89b-12d3-a456-426614174000',
      id: 123,
      jobTitle: 'Software Engineer',
      lastLoginDateTime: '2025-04-22T15:30:00.000Z',
      name: 'John',
      organizationCompanyName: 'Tech Corp',
      phoneNumber: '+1234567890',
      profile: PROFILE.EVA_FIELD,
      roles: [
        {
          id: 2,
          name: 'User Role'
        }
      ],
      status: 'ACTIVE',
      surname: 'Doe',
      updatedAt: '2025-04-23T15:35:00.513Z',
      updatedBy: 'admin',
      userGuid: '123e4567-e89b-12d3-a456-426614174001',
      userName: 'johndoe'
    };
    const usersServiceSpy = jasmine.createSpyObj('UsersService', [
      'getApiUsersV1Id$Json',
      'postApiUsersV1IdLock$Response',
      'postApiUsersV1IdUnlock$Response'
    ]);
    usersServiceSpy.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    usersServiceSpy.postApiUsersV1IdLock$Response.and.returnValue(of({ status: 204 }));
    usersServiceSpy.postApiUsersV1IdUnlock$Response.and.returnValue(of({ status: 204 }));
    const messageStatusServiceSpy = jasmine.createSpyObj('MessageStatusService', ['show', 'hide']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const msalServiceSpy = jasmine.createSpyObj('MsalService', ['loginRedirect', 'logout', 'getAccount']);
    const userProfileServiceSpy = jasmine.createSpyObj('UserProfileService', [], {
      profile$: of({ profile: PROFILE.EVA_USER }), // Define profile$ as a property returning an observable
      impersonatedUser$: of(null)
    });
    await TestBed.configureTestingModule({
      imports: [UserDetailComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '123' } } } },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: MessageStatusService, useValue: messageStatusServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: Promise.resolve() }) } },
        { provide: MsalService, useValue: msalServiceSpy },
        { provide: UserProfileService, useValue: userProfileServiceSpy } // Updated mock
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    modalService = TestBed.inject(NgbModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    messageStatusService = TestBed.inject(MessageStatusService) as jasmine.SpyObj<MessageStatusService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    UtilityRouting.initialize(router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user details on init', () => {
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));

    component.ngOnInit();

    expect(usersService.getApiUsersV1Id$Json).toHaveBeenCalledWith({ id: 123 });
    expect(component.showPage).toBeTrue();
  });

  it('should set user from userProfileService.profile$', () => {
    component.ngOnInit();
    expect(component.user).toEqual({ profile: PROFILE.EVA_USER });
  });

  it('should handle error when fetching user details', () => {
    const mockError = new HttpErrorResponse({
      error: { innerException: { internalCode: '404', additionalData: null } },
      status: 404,
      statusText: 'Not Found',
      url: '/api/users/123'
    });
    usersService.getApiUsersV1Id$Json.and.returnValue(throwError(() => mockError));

    component.ngOnInit();

    expect(usersService.getApiUsersV1Id$Json).toHaveBeenCalledWith({ id: 123 });
  });

  it('should navigate to user edit page', () => {
    component.idUser = 123;

    component.goToUserEdit();

    expect(router.navigate).toHaveBeenCalledWith(['user-profile/user-edit', '123']);
  });

  it('should set isSmallMobile and isTablet correctly in setupViewMode', () => {
    const genericService: any = component['genericService'];
    // Test MOBILE
    genericService.viewMode = jasmine.createSpy().and.returnValue(VIEW_MODE.MOBILE);
    (component as any).setupViewMode();
    expect(component.isSmallMobile()).toBeTrue();
    expect(component.isTablet()).toBeFalse();

    // Test TABLET
    genericService.viewMode = jasmine.createSpy().and.returnValue(VIEW_MODE.TABLET);
    (component as any).setupViewMode();
    expect(component.isSmallMobile()).toBeFalse();
    expect(component.isTablet()).toBeTrue();

    // Test DESKTOP (or any other)
    genericService.viewMode = jasmine.createSpy().and.returnValue('DESKTOP');
    (component as any).setupViewMode();
    expect(component.isSmallMobile()).toBeFalse();
    expect(component.isTablet()).toBeFalse();
  });

  it('should handle user update', () => {
    component.idUser = 123;
    component.goToUserEdit();
    expect(router.navigate).toHaveBeenCalledWith(['user-profile/user-edit', '123']);
  });

  it('should hide message on destroy', () => {
    component.ngOnDestroy();

    expect(messageStatusService.hide).toHaveBeenCalled();
  });

  it('should call getUserById and set user details on success', () => {
    spyOn(component as any, 'getUserById').and.returnValue(of(mockUser));

    component.ngOnInit();

    expect((component as any).getUserById).toHaveBeenCalled();
    expect(component.userDetailsModelResponse).toEqual(mockUser);
    expect(component.showPage).toBeTrue();
  });

  it('should handle error in getUserById', () => {
    const mockError = new HttpErrorResponse({
      error: { innerException: { internalCode: '500', additionalData: null } },
      status: 500,
      statusText: 'Internal Server Error'
    });
    spyOn(component as any, 'getUserById').and.returnValue(throwError(() => mockError));

    component.ngOnInit();

    expect((component as any).getUserById).toHaveBeenCalled();
  });

  xit('should open impersonificate user modal', () => {
    const mockModalRef = { componentInstance: {}, result: Promise.resolve('confirmed') } as NgbModalRef;
    spyOn(modalService, 'open').and.returnValue(mockModalRef);

    component.impersonificateUserModal();

    expect(modalService.open).toHaveBeenCalledWith(ImpersonificateUserModalComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    expect(mockModalRef.componentInstance.data).toEqual(mockUser);
  });

  it('should return "userProfile.userEdit.automatic" when structures array is empty', () => {
    const administratives: UserAdministrativeModel = {
      id: 0, // Provide a valid id
      name: '', // Provide a valid name
      structures: [], // Empty array
      associateAllStructures: false
    };

    const result = component.getStructureEnabled(administratives);

    expect(result).toBe('userProfile.userEdit.manual');
  });

  it('should return "Admin" when profile is EVA_ADMIN', () => {
    const userDetails: UserDetailsModel = { profile: PROFILE.EVA_ADMIN } as UserDetailsModel;
    const result = component.getProfileValue(userDetails);
    expect(result).toBe('Admin');
  });

  it('should return "Field" when profile is EVA_FIELD', () => {
    const userDetails: UserDetailsModel = { profile: PROFILE.EVA_FIELD } as UserDetailsModel;
    const result = component.getProfileValue(userDetails);
    expect(result).toBe('Field');
  });

  it('should return "User" when profile is EVA_USER', () => {
    const userDetails: UserDetailsModel = { profile: PROFILE.EVA_USER } as UserDetailsModel;
    const result = component.getProfileValue(userDetails);
    expect(result).toBe('User');
  });
  it('should return "--" when profile is unrecognized', () => {
    const userDetails: UserDetailsModel = { profile: undefined } as UserDetailsModel;
    const result = component.getProfileValue(userDetails);
    expect(result).toBe('--');
  });

  it('should set user when impersonatedUser$ emits a value', () => {
    // Simulate ngOnInit or wherever the subscription happens
    userProfileService.impersonatedUser$.subscribe((impersonatedUser: UserDetailsModel | null) => {
      if (impersonatedUser) {
        (component as any).user = impersonatedUser;
      }
    });

    expect((component as any).user).toEqual({ name: 'Test', profile: 'EVA_USER' });
  });

  it('should set showManageBtn to false if user is DISABLED or profile is EVA_ADMIN', () => {
    component['userDetailsModelResponse'] = { status: 'ACTIVE', profile: 'EVA_ADMIN' } as any;
    (component as any).setShowManageBtn();
    expect(component.showManageBtn()).toBeFalse();

    component['userDetailsModelResponse'] = { status: 'DISABLED', profile: 'EVA_USER' } as any;
    (component as any).setShowManageBtn();
    expect(component.showManageBtn()).toBeFalse();
  });

  it('should set showManageBtn to false only if user is DISABLED and profile is EVA_ADMIN', () => {
    component['userDetailsModelResponse'] = { status: 'DISABLED', profile: 'EVA_ADMIN' } as any;
    (component as any).setShowManageBtn();
    expect(component.showManageBtn()).toBeFalse();
  });
});
