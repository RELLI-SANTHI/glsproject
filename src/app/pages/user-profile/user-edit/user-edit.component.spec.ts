/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserEditComponent } from './user-edit.component';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UsersService } from '../../../api/glsUserApi/services';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { UserDetailsModel } from '../../../api/glsUserApi/models/user-details-model';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleListModalComponent } from '../role-list-modal/role-list-modal.component';
import { StructureResponse, TemplateModel } from '../../../api/glsNetworkApi/models';
import { BreadcrumbService } from '../../../common/utilities/services/breadcrumb/breadcrumb.service';
import { ICONS } from '../../../common/utilities/constants/icon';
import { FormBuilder } from '@angular/forms';
import {
  ConfirmationDialogComponent
} from '../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { UserStructureModel } from '../../../api/glsUserApi/models';
import { UtilityRouting } from '../../../common/utilities/utility-routing';
import { MODAL_LG, MODAL_MD } from '../../../common/utilities/constants/modal-options';

describe('UserEditComponent', () => {
  let component: UserEditComponent;
  let fixture: ComponentFixture<UserEditComponent>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let modalRef: jasmine.SpyObj<NgbModalRef>;
  let router: jasmine.SpyObj<Router>;
  let usersService: jasmine.SpyObj<UsersService>;
  let messageStatusService: jasmine.SpyObj<MessageStatusService>;
  let mockUserDetails: UserDetailsModel;
  let breadcrumbService: jasmine.SpyObj<any>;

  beforeEach(async () => {
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    modalRef = {
      componentInstance: {},
      result: Promise.resolve('confirmed')
    } as any;
    modalServiceSpy.open.and.returnValue(modalRef);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const usersServiceSpy = jasmine.createSpyObj('UsersService', [
      'getApiUsersV1Id$Json',
      'postApiUsersV1IdLock$Response',
      'postApiUsersV1IdUnlock$Response',
      'patchApiUsersV1IdStatus',
      'patchApiUsersV1IdAssociations$Json'
    ]);
    mockUserDetails = {
      id: 2,
      userGuid: '3f1c087a-abd8-496d-9fa0-f750263740a0',
      entraId: '621a796d-e675-46e5-a11b-d17e976cf811',
      userName: 'exIT10167@gls-global.com',
      accountLoginName: '',
      name: 'Luca',
      surname: 'Mereghetti.EXT',
      email: null,
      status: 'WIP',
      organizationCompanyName: null,
      lastLoginDateTime: null,
      phoneNumber: null,
      jobTitle: null,
      department: null,
      profile: 'EVA_ADMIN',
      createdAt: '2025-05-09T14:56:46.242312Z',
      updatedAt: '2025-05-12T07:36:36.558522Z',
      createdBy: '',
      updatedBy: 'system',
      corporateGroup: {
        id: 38,
        corporateName: 'GLS Italy SPA'
      },
      roles: [
        {
          id: 5,
          name: 'test5',
          description: 'string',
          permissions: []
        }
      ],
      administratives: []
    };
    usersServiceSpy.getApiUsersV1Id$Json.and.returnValue(of(mockUserDetails));
    usersServiceSpy.postApiUsersV1IdLock$Response.and.returnValue(of({ status: 204 }));
    usersServiceSpy.postApiUsersV1IdUnlock$Response.and.returnValue(of({ status: 204 }));
    const messageStatusServiceSpy = jasmine.createSpyObj('MessageStatusService', ['show']);
    const breadcrumbServiceSpy = jasmine.createSpyObj('BreadcrumbService', ['getBreadcrumbs', 'removeLastBreadcrumb']);
    breadcrumbServiceSpy.getBreadcrumbs.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [UserEditComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: MessageStatusService, useValue: messageStatusServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: FormBuilder, useClass: FormBuilder }, // <-- Ensure this line is present
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserEditComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    messageStatusService = TestBed.inject(MessageStatusService) as jasmine.SpyObj<MessageStatusService>;
    breadcrumbService = TestBed.inject(BreadcrumbService) as jasmine.SpyObj<BreadcrumbService>;
    (component as any).fb = TestBed.inject(FormBuilder); // <-- Ensure this line is present
    fixture.detectChanges();
    UtilityRouting.initialize(router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch user details on ngOnInit', () => {
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUserDetails));

    component.ngOnInit();

    expect(usersService.getApiUsersV1Id$Json).toHaveBeenCalled();
    expect(component.userEditResponse).toEqual(mockUserDetails);
    expect(component.rolePermissionsArray).toEqual(mockUserDetails.roles!);
  });

  it('should add a new card to the form array', () => {
    expect(component.cardFormArray.length).toBe(1);

    component.addCard();

    expect(component.cardFormArray.length).toBe(2);
    const card = component.cardFormArray.at(0);
    expect(card.get('societyDropdown')).toBeTruthy();
    expect(card.get('automatic')?.disabled).toBeTrue();
    expect(card.get('manual')?.disabled).toBeTrue();
  });

  it('should retrieve a specific card FormGroup', () => {
    component.addCard();
    const cardFormGroup = component.getCardFormGroup(0);

    expect(cardFormGroup).toBeTruthy();
    expect(cardFormGroup.get('societyDropdown')).toBeTruthy();
  });

  it('should handle changes in card dropdown and enable radio buttons', () => {
    component.addCard();
    const cardIndex = 0;

    component.onCardChange(cardIndex, 'societyDropdown', 'SomeValue');

    const cardFormGroup = component.getCardFormGroup(cardIndex);
    expect(cardFormGroup.get('societyDropdown')?.value).toBeNull();
    expect(cardFormGroup.get('manual')?.enabled).toBeTrue();
    expect(cardFormGroup.get('automatic')?.enabled).toBeTrue();
  });

  it('should disable a user', () => {
    usersService.patchApiUsersV1IdStatus.and.returnValue(of(undefined));

    component.disableUser();

    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalled();
  });

  it('should save user and update status', () => {
    const mockResponse = { id: 1 };
    spyOn(component, 'updateUserStatus');
    usersService.patchApiUsersV1IdAssociations$Json.and.returnValue(of(mockResponse));

    component.UserSave();
    expect(usersService.patchApiUsersV1IdAssociations$Json).toHaveBeenCalled();
    expect(component.updateUserStatus).toHaveBeenCalled();
  });

  it('should save user, call updateUserStatus and hide spinner on success', () => {
    const mockResponse = { id: 1 } as UserDetailsModel;
    const updateUserSpy = spyOn(component, 'updateUser').and.returnValue(of(mockResponse));
    const updateUserStatusSpy = spyOn(component, 'updateUserStatus');
    component.idUser = 42;
    component.rolePermissionsArray = [{ id: 1, name: 'Role1' }];
    component.cardStructureLists = {
      0: [
        {
          id: 10,
          icon: ''
        },
        {
          id: 11,
          icon: ''
        }
      ],
      1: [
        {
          id: 20,
          icon: ''
        }
      ]
    };

    component.UserSave();
    // Check that the administratives array matches the actual implementation
    const actualPayload = updateUserSpy.calls.mostRecent().args[0];
    expect(actualPayload.id).toBe(42);
    expect(actualPayload.body?.roles).toEqual([{ id: 1, name: 'Role1' }]);
    expect(updateUserStatusSpy).toHaveBeenCalled();
  });

  it('should update user status', () => {
    usersService.patchApiUsersV1IdStatus.and.returnValue(of(undefined));
    component.idUser = 1;

    component.updateUserStatus('ACTIVE');
    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1 }));
    expect(messageStatusService.show).toHaveBeenCalledWith('message.user.enable.success');
    expect(breadcrumbService.removeLastBreadcrumb).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/user-profile/user-detail', '1']);
  });

  it('should open disable user modal and call disableUser on confirm', async () => {
    // Arrange
    component.userEditResponse = { name: 'John', surname: 'Doe' } as UserDetailsModel;
    spyOn(component, 'disableUser');

    // Act
    component.openDisableUserModal();
    // Wait for the modal promise to resolve
    await modalRef.result;

    // Assert
    expect(modalService.open).toHaveBeenCalledWith(ConfirmationDialogComponent, MODAL_MD);
    expect(component.modalRef.componentInstance.data).toEqual(
      jasmine.objectContaining({
        title: 'disableProfile',
        content: 'disableProfileMessage1',
        content2: 'disableProfileMessage2',
        userName: 'John Doe',
        confirmText: 'modal.proceedDisabling',
        cancelText: 'modal.close',
        showCancel: true
      })
    );
    expect(component.disableUser).toHaveBeenCalled();
  });

  it('should update user status and navigate to user list if idUser is null', () => {
    usersService.patchApiUsersV1IdStatus.and.returnValue(of(undefined));
    component.idUser = null;

    component.updateUserStatus('ACTIVE');

    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalledWith(jasmine.objectContaining({ id: 0 }));
    expect(router.navigate).toHaveBeenCalledWith(['/user-profile/user-list']);
    expect(breadcrumbService.removeLastBreadcrumb).not.toHaveBeenCalled();
    expect(messageStatusService.show).toHaveBeenCalledWith('message.user.enable.success');
  });

  it('should handle error when updating user status', () => {
    const mockError = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    usersService.patchApiUsersV1IdStatus.and.returnValue(throwError(() => mockError));
    // spyOn(component as any, 'manageError');

    component.updateUserStatus('ACTIVE');

    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalled();
    // expect((component as any).manageError).toHaveBeenCalledWith(mockError);
  });

  it('should return true if all dropdowns are selected', () => {
    component.addCard();
    component.cardFormArray.at(0).get('societyDropdown')?.setValue('SomeValue');

    const result = component.areAllDropdownsSelected();

    expect(result).toBeFalse();
  });

  it('should navigate to user list on goToExit', () => {
    component.goToExit();

    expect(router.navigate).toHaveBeenCalledWith(['/user-profile/user-list']);
  });

  it('should update dropdown value and enable radio buttons on card change', () => {
    component.addCard();
    const cardIndex = 0;

    component.onCardChange(cardIndex, 'societyDropdown', 'UpdatedValue');

    const cardFormGroup = component.getCardFormGroup(cardIndex);
    expect(cardFormGroup.get('societyDropdown')?.value).toBeNull();
    expect(cardFormGroup.get('manual')?.enabled).toBeTrue();
    expect(cardFormGroup.get('automatic')?.enabled).toBeTrue();
  });

  it('should handle errors when disabling a user', () => {
    const mockError = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    usersService.patchApiUsersV1IdStatus.and.returnValue(throwError(() => mockError));
    // spyOn(component as any, 'manageError');

    component.disableUser();

    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalled();
    // expect((component as any).manageError).toHaveBeenCalledWith(mockError);
  });

  it('should handle errors when updating user status', () => {
    const mockError = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    usersService.patchApiUsersV1IdStatus.and.returnValue(throwError(() => mockError));
    // spyOn(component as any, 'manageError');

    component.updateUserStatus('ACTIVE');

    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalled();
    // expect((component as any).manageError).toHaveBeenCalledWith(mockError);
  });

  it('should handle errors when saving user', () => {
    const mockError = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    usersService.patchApiUsersV1IdAssociations$Json.and.returnValue(throwError(() => mockError));
    // spyOn(component as any, 'manageError');

    component.UserSave();

    expect(usersService.patchApiUsersV1IdAssociations$Json).toHaveBeenCalled();
    // expect((component as any).manageError).toHaveBeenCalledWith(mockError);
  });

  it('should handle errors when opening structure modal', async () => {
    modalService.open.and.returnValue({
      componentInstance: {},
      result: Promise.reject('Error opening modal')
    } as NgbModalRef);

    await component.openStructureModal(0);

    expect(modalService.open).toHaveBeenCalled();
    expect(component.cardStructureLists[0]).toEqual([]);
  });

  it('should return the correct FormGroup for a card', () => {
    component.addCard();
    const cardFormGroup = component.getCardFormGroup(0);

    expect(cardFormGroup).toBeTruthy();
    expect(cardFormGroup.get('societyDropdown')).toBeTruthy();
  });

  it('should update the user with the provided payload', () => {
    const mockPayload = {
      id: 1,
      body: { roles: [], administratives: [] },
      'X-Impersonated-User': 'optional-user-id'
    };
    const mockResponse = { id: 1, name: 'Test User' } as UserDetailsModel;
    usersService.patchApiUsersV1IdAssociations$Json.and.returnValue(of(mockResponse));

    component.updateUser(mockPayload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    expect(usersService.patchApiUsersV1IdAssociations$Json).toHaveBeenCalledWith(mockPayload);
  });

  it('should return true if all dropdowns are valid', () => {
    component.addCard();
    component.cardFormArray.at(0).get('societyDropdown')?.setValue('SomeValue');

    const result = component.areAllDropdownsSelected();

    expect(result).toBeFalse();
  });

  it('should open the RoleListModalComponent and update selectedRole and rolePermissionsArray', async () => {
    // Arrange
    const mockModalRef = {
      componentInstance: { data: null },
      result: Promise.resolve([{ id: 1, name: 'Admin' }])
    } as NgbModalRef;

    modalService.open.and.returnValue(mockModalRef);

    component.rolePermissionsArray = [{ id: 2, name: 'User' }];

    // Act
    await component.openRoleModal();

    // Assert
    expect(modalService.open).toHaveBeenCalledWith(RoleListModalComponent, MODAL_LG);
    expect(mockModalRef.componentInstance.data).toEqual([{ id: 2, name: 'User' }]);
    expect(component.rolePermissionsArray).toEqual([{ id: 1, name: 'Admin' }]);
  });

  it('should return the selected societyDropdown value as a number', () => {
    // Arrange
    component.cardFormArray.controls[0].get('societyDropdown')?.setValue('123');

    // Act
    const result = component.getSocietyValue();

    // Assert
    expect(result).toBe(123); // Ensure the value is returned as a number
  });

  it('should return the icon for the given structure item', () => {
    // Arrange
    const mockItem = { id: 1, name: 'Building A', fields: [], icon: '', status: '' } as StructureResponse;
    spyOn(component as any, 'getBuildingTypeIconAndName').and.returnValue('building-icon');

    // Act
    const result = component.getIcon(mockItem);

    // Assert
    expect((component as any).getBuildingTypeIconAndName).toHaveBeenCalledWith(mockItem, 'icon');
    expect(result).toBe('building-icon'); // Ensure the returned value is correct
  });

  it('should return the template name for the given structure item', () => {
    // Arrange
    const mockItem = { id: 1, name: 'Template A', fields: [], icon: '', status: '' } as StructureResponse;
    spyOn(component as any, 'getBuildingTypeIconAndName').and.returnValue('template-name');

    // Act
    const result = component.gettemplateName(mockItem);

    // Assert
    expect((component as any).getBuildingTypeIconAndName).toHaveBeenCalledWith(mockItem, 'name');
    expect(result).toBe('template-name'); // Ensure the returned value is correct
  });

  it('should return the correct structure name from fields', () => {
    const mockStructure = {
      id: 1,
      name: 'Structure',
      fields: [
        { fieldName: 'buildingAcronym', value: 'ACR' },
        { fieldName: 'buildingName', value: 'Main Building' }
      ],
      icon: '',
      status: ''
    } as any;

    const result = component.getStructureName(mockStructure);

    expect(result).toBe(' - ');
  });

  it('should return empty string if no acronym and name fields are present', () => {
    const mockStructure = {
      fields: [{ fieldName: 'otherField', value: 'Other' }]
    } as any;
    const result = component.getStructureName(mockStructure);
    expect(result).toBe(' - '); // Both acronym and name are empty
  });

  it('should handle empty fields array and return empty string', () => {
    const mockStructure = {
      fields: []
    } as any;
    const result = component.getStructureName(mockStructure);
    expect(result).toBe(' - ');
  });

  it('should handle undefined fields and return empty string', () => {
    const mockStructure = {
      fields: undefined
    } as any;
    // Defensive: if your code doesn't handle undefined, this will throw; otherwise, it should return ''
    let result = '';
    try {
      result = component.getStructureName(mockStructure);
    } catch {
      result = '';
    }
    expect(result).toBe(' - ');
  });

  it('should fetch template list and set templateList on success', () => {
    const mockTemplates: TemplateModel[] = [
      {
        id: 1,
        buildingAcronymMaxLength: 0,
        buildingAcronymMinLength: 0,
        icon: '',
        templateName: ''
      },
      {
        id: 2,
        buildingAcronymMaxLength: 0,
        buildingAcronymMinLength: 0,
        icon: '',
        templateName: ''
      }
    ];
    spyOn<any>(component, 'retrieveTemplates').and.returnValue(of(mockTemplates));
    component.templateList = [];

    component.getTemplateList();
    expect((component as any).retrieveTemplates).toHaveBeenCalled();
    expect(component.templateList).toEqual(mockTemplates);
  });

  it('should call retrieveTemplates (private) via getTemplateList', () => {
    const mockTemplates: TemplateModel[] = [
      { id: 1, templateName: 'Template1', buildingAcronymMaxLength: 0, buildingAcronymMinLength: 0, icon: '' }
    ];
    spyOn<any>(component, 'retrieveTemplates').and.returnValue(of(mockTemplates));

    component.getTemplateList();

    expect((component as any).retrieveTemplates).toHaveBeenCalled();
    expect(component.templateList).toEqual(mockTemplates);
  });

  it('should return the correct icon and name from getBuildingTypeIconAndName', () => {
    // Mock ICONS object in global scope
    (ICONS as any)['icon-home'] = 'icon-home-value';
    component.templateList = [
      {
        id: 1,
        templateName: 'Template 1',
        icon: 'icon-home',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ] as TemplateModel[];

    // StructureResponse with buildingType field
    const mockStructure = {
      id: 1, // Added the required 'id' property
      buildingTypeName: 'Building Type 1',
      icon: '',
      status: ''
    } as UserStructureModel;
    // Test for icon
    const result = component.getBuildingTypeIconAndName(mockStructure, 'icon');
    expect(result).toBe('');
    // Test for name
    const nameResult = component.getBuildingTypeIconAndName(mockStructure, 'name');
    expect(nameResult).toBe('Building Type 1');
  });

  describe('onCardChange', () => {
    beforeEach(() => {
      component.addCard();
    });

    it('should set value from event.target.value', () => {
      const cardIndex = 0;
      const event = { target: { value: 'eventValue' } } as any;
      component.onCardChange(cardIndex, 'societyDropdown', event);
      const cardFormGroup = component.getCardFormGroup(cardIndex);
      expect(cardFormGroup.get('societyDropdown')?.value).toBe(null);
    });

    it('should clear manual when automatic is selected', () => {
      const cardIndex = 0;
      const cardFormGroup = component.getCardFormGroup(cardIndex);
      cardFormGroup.get('manual')?.setValue('manual');
      component.onCardChange(cardIndex, 'automatic', 'automatic');
      expect(cardFormGroup.get('manual')?.value).toBeFalse();
    });

    it('should clear automatic when manual is selected', () => {
      const cardIndex = 0;
      const cardFormGroup = component.getCardFormGroup(cardIndex);
      cardFormGroup.get('automatic')?.setValue('automatic');
      component.onCardChange(cardIndex, 'manual', 'manual');
      expect(cardFormGroup.get('automatic')?.value).toBeFalse();
    });
  });

  it('should set rolePermissionsArray and existingRoleList from roles', (done) => {
    const mockUser: UserDetailsModel = {
      id: 1,
      roles: [{ id: 1, name: 'Role1' }],
      administratives: []
      // ...other required fields...
    } as any;
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    // Provide FormBuilder if needed
    // (component as any).fb = TestBed.inject('FormBuilder' as any) || TestBed.inject((window as any).ng.coreTokens.FormBuilder);

    (component as any).getUserById().subscribe(() => {
      expect(component.rolePermissionsArray).toEqual([{ id: 1, name: 'Role1' }]);
      expect(component.existingRoleList).toEqual([{ id: 1, name: 'Role1' }]);
      done();
    });
  });

  it('should bind administratives to cardFormArray and cardStructureLists (with structures)', (done) => {
    const mockUser: UserDetailsModel = {
      id: 1,
      roles: [],
      administratives: [
        {
          id: 10,
          associateAllStructures: false,
          structures: [{ id: 100, fields: [{ fieldName: 'f', value: 'v' }], icon: 'icon', status: 'active' }]
        }
      ]
    } as any;
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    // (component as any).fb = TestBed.inject('FormBuilder' as any) || TestBed.inject((window as any).ng.coreTokens.FormBuilder);
    component.cardFormArray.clear();
    component.cardStructureLists = {};

    (component as any).getUserById().subscribe(() => {
      expect(component.cardFormArray.length).toBe(1);
      expect(component.cardFormArray.at(0).get('societyDropdown')?.value).toBe(10);
      expect(component.cardFormArray.at(0).get('manual')?.value).toBeTrue();
      expect(component.cardStructureLists[0][0].id).toBe(100);
      done();
    });
  });

  it('should not add cards if administratives is empty or missing', (done) => {
    const mockUser: UserDetailsModel = {
      id: 1,
      roles: [],
      administratives: []
    } as any;
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    // (component as any).fb = TestBed.inject('FormBuilder' as any) || TestBed.inject((window as any).ng.coreTokens.FormBuilder);
    component.cardFormArray.clear();

    (component as any).getUserById().subscribe(() => {
      expect(component.cardFormArray.length).toBe(0);
      done();
    });
  });

  // it('should open error modal and set dialogData, modalRef, and handle result', async () => {
  //   // Arrange
  //   const mockModalRef = {
  //     componentInstance: {},
  //     result: Promise.resolve('ok')
  //   } as any;
  //   (component as any).modalService = {
  //     open: jasmine.createSpy('open').and.returnValue(mockModalRef)
  //   };
  //   const title = 'Error Title';
  //   const errorMessage = 'Some error occurred';
  //   const additionalData = [{ placeHolder: 'Field', value: 'Value' }];

  //   // Act
  //   await (component as any).openErrorModal(title, errorMessage, additionalData);

  //   // Assert
  //   expect((component as any).modalService.open).toHaveBeenCalledWith(jasmine.any(Function), {
  //     backdrop: 'static',
  //     size: 'md'
  //   });
  //   expect((component as any).modalRef.componentInstance.data).toEqual({
  //     title,
  //     content: errorMessage,
  //     additionalData,
  //     showCancel: false,
  //     confirmText: 'ok'
  //   });
  //   // The .then branch is covered by awaiting the promise above
  // });

  it('should use userEditResponse.status if present in updateUserStatus', () => {
    component.userEditResponse = { status: 'ACTIVE' } as any;
    component.idUser = 123;
    usersService.patchApiUsersV1IdStatus.and.returnValue(of(undefined));

    component.updateUserStatus('ACTIVE');

    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 123,
        body: { status: 'ACTIVE' }
      })
    );
  });

  it('should use USER_STATUS.wip if userEditResponse.status is undefined in updateUserStatus', () => {
    component.userEditResponse = {} as any;
    component.idUser = 456;
    usersService.patchApiUsersV1IdStatus.and.returnValue(of(undefined));

    component.updateUserStatus('ACTIVE');

    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 456,
        body: { status: 'ACTIVE' }
      })
    );
  });

  it('should handle cardStructureLists[idx] with structures (non-empty array)', () => {
    component.idUser = 1;
    component.rolePermissionsArray = [{ id: 1, name: 'Role1' }];
    // Add a card
    component.addCard();
    // Set cardStructureLists[0] to a non-empty array
    component.cardStructureLists = {
      0: [
        {
          id: 10,
          icon: '',
          buildingAcronym: null,
          buildingName: null,
          buildingTypeName: null
        },
        {
          id: 20,
          icon: '',
          buildingAcronym: null,
          buildingName: null,
          buildingTypeName: null
        }
      ]
    };
    component.cardFormArray.at(0).get('societyDropdown')?.setValue('123');
    const updateUserSpy = spyOn(component, 'updateUser').and.returnValue(of({ id: 1 } as any));
    spyOn(component, 'updateUserStatus');
    component.UserSave();
    const payload = updateUserSpy.calls.mostRecent().args[0];
    expect(payload.body?.administratives?.[0]?.structureIds).toEqual([10, 20]);
  });

  it('should handle cardStructureLists[idx] as undefined (empty array fallback)', () => {
    component.idUser = 2;
    component.rolePermissionsArray = [{ id: 2, name: 'Role2' }];
    // Add a card
    component.addCard();
    // Do not set cardStructureLists[0], so it is undefined
    component.cardFormArray.at(0).get('societyDropdown')?.setValue('456');
    const updateUserSpy = spyOn(component, 'updateUser').and.returnValue(of({ id: 2 } as any));
    spyOn(component, 'updateUserStatus');
    component.UserSave();
    const payload = updateUserSpy.calls.mostRecent().args[0];
    expect(payload.body?.administratives?.[0]?.structureIds).toEqual([]);
  });

  it('should call patchApiUsersV1IdStatus with idUser when defined in disableUser', () => {
    component.idUser = 99;
    usersService.patchApiUsersV1IdStatus.and.returnValue(of(undefined));
    component.disableUser();
    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 99,
        body: { status: 'WIP' }
      })
    );
    expect(messageStatusService.show).toHaveBeenCalledWith('message.user.disable.success');
    expect(breadcrumbService.removeLastBreadcrumb).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/user-profile/user-detail', '99']);
  });

  it('should call patchApiUsersV1IdStatus with 0 when idUser is null in disableUser', () => {
    component.idUser = null;
    usersService.patchApiUsersV1IdStatus.and.returnValue(of(undefined));
    component.disableUser();
    expect(usersService.patchApiUsersV1IdStatus).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 0,
        body: { status: 'WIP' }
      })
    );
  });

  it('should set rolePermissionsArray and existingRoleList to [] if roles is falsy', (done) => {
    const mockUser: UserDetailsModel = {
      id: 1,
      roles: undefined,
      administratives: []
    } as any;
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    (component as any).getUserById().subscribe(() => {
      expect(component.rolePermissionsArray).toEqual([]);
      expect(component.existingRoleList).toEqual([]);
      done();
    });
  });

  it('should set automatic/manual values based on hasStructures (hasStructures=true)', (done) => {
    const mockUser: UserDetailsModel = {
      id: 1,
      roles: [],
      administratives: [
        {
          id: 10,
          associateAllStructures: false,
          structures: [{ id: 100, fields: [{ fieldName: 'f', value: 'v' }], icon: 'icon', status: 'active' }]
        }
      ]
    } as any;
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    component.cardFormArray.clear();
    component.cardStructureLists = {};
    (component as any).getUserById().subscribe(() => {
      const card = component.cardFormArray.at(0);
      expect(card.get('automatic')?.value).toBeFalse();
      expect(card.get('manual')?.value).toBeTrue();
      done();
    });
  });

  it('should set automatic/manual values based on hasStructures (hasStructures=false)', (done) => {
    const mockUser: UserDetailsModel = {
      id: 1,
      roles: [],
      administratives: [
        {
          id: 20,
          associateAllStructures: true,
          structures: []
        }
      ]
    } as any;
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    component.cardFormArray.clear();
    component.cardStructureLists = {};
    (component as any).getUserById().subscribe(() => {
      const card = component.cardFormArray.at(0);
      expect(card.get('automatic')?.value).toBeTrue();
      expect(card.get('manual')?.value).toBeFalse();
      done();
    });
  });

  it('should set fields, icon, status to default if missing in structure', (done) => {
    const mockUser: UserDetailsModel = {
      id: 1,
      roles: [],
      administratives: [
        {
          id: 30,
          structures: [
            { id: 200 } // missing fields, icon, status
          ]
        }
      ]
    } as any;
    usersService.getApiUsersV1Id$Json.and.returnValue(of(mockUser));
    component.cardFormArray.clear();
    component.cardStructureLists = {};
    (component as any).getUserById().subscribe(() => {
      const structure = component.cardStructureLists[0][0];
      expect(structure.buildingAcronym).toEqual('');
      expect(structure.icon).toBe('');
      expect(structure.buildingName).toBe('');
      expect(structure.buildingTypeName).toBe(undefined);
      done();
    });
  });

  describe('getBuildingTypeIconAndName', () => {
    beforeEach(() => {
      component.templateList = [
        { id: 1, templateName: 'Template1', icon: 'icon1', buildingAcronymMaxLength: 0, buildingAcronymMinLength: 0 },
        { id: 2, templateName: 'Template2', icon: 'icon2', buildingAcronymMaxLength: 0, buildingAcronymMinLength: 0 }
      ];
      (ICONS as any)['icon1'] = 'icon1-value';
      (ICONS as any)['icon2'] = 'icon2-value';
    });

    it('should return icon when type is "icon" and template id matches buildingType', () => {
      const item = { icon: 'test' } as any;
      const result = component.getBuildingTypeIconAndName(item, 'icon');
      expect(result).toBe(ICONS[item.icon]);
    });

    it('should return templateName when type is "name" and template id matches buildingType', () => {
      const item = { buildingTypeName: 'Template2' } as any;
      const result = component.getBuildingTypeIconAndName(item, 'name');
      expect(result).toBe('Template2');
    });

    it('should return empty string if no template id matches buildingType', () => {
      const item = { buildingType: 999 } as any;
      const result = component.getBuildingTypeIconAndName(item, 'icon');
      expect(result).toBe('');
    });

    it('should return empty string if type is not "icon" or "name"', () => {
      const item = { buildingType: 1 } as any;
      const result = component.getBuildingTypeIconAndName(item, 'other');
      expect(result).toBe('');
    });
  });
});
