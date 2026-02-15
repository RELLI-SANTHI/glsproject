/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleService } from '../../../api/glsUserApi/services';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoleEditComponent } from './role-edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleModel } from '../../../api/glsUserApi/models';
import { USER_PROFILE_CONSTANTS } from '../constants/user-constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UtilityRouting } from '../../../common/utilities/utility-routing';
import { of } from 'rxjs';

describe('RoleEditComponent', () => {
  let component: RoleEditComponent;
  let fixture: ComponentFixture<RoleEditComponent>;
  let mockRoleService: any;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockTranslateStore: jasmine.SpyObj<TranslateStore>;
  let mockMessageStatusService: jasmine.SpyObj<MessageStatusService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  // Add cleanup after each test
  afterEach(() => {
    if (fixture) {
      // Manually call ngOnDestroy to ensure all subscriptions are properly unsubscribed
      if (component.ngOnDestroy) {
        component.ngOnDestroy();
      }
      fixture.destroy();
    }
    // Reset any jasmine timers
    jasmine.clock().uninstall();
  });

  beforeEach(async () => {
    // Mock RoleService
    mockRoleService = jasmine.createSpyObj('RoleService', [
      'getApiRoleV1Id$Json',
      'getApiRoleV1Permissions$Json',
      'postApiRoleV1IdLock$Response',
      'postApiRoleV1IdUnlock$Response',
      'postApiRoleV1$Json',
      'putApiRoleV1Id$Json'
    ]);
    const mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: { id: 1 } }
    });

    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);
    mockTranslateStore = jasmine.createSpyObj('TranslateStore', ['onTranslationChange', 'onLangChange', 'onDefaultLangChange']);
    mockMessageStatusService = jasmine.createSpyObj('MessageStatusService', ['show']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);

    mockRoleService.getApiRoleV1Id$Json.and.returnValue(of({}));
    mockRoleService.getApiRoleV1Permissions$Json.and.returnValue(of([]));
    mockRoleService.postApiRoleV1IdLock$Response.and.returnValue(of({ status: 204, body: {} }));
    mockRoleService.postApiRoleV1IdUnlock$Response.and.returnValue(of({ status: 204, body: {} }));
    mockRoleService.postApiRoleV1$Json.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [RoleEditComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TranslateStore, useValue: mockTranslateStore },
        { provide: MessageStatusService, useValue: mockMessageStatusService },
        { provide: Router, useValue: mockRouter }, // Provide the mock
        { provide: NgbModal, useValue: mockModalService }, // Provide the mock

        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleEditComponent);
    component = fixture.componentInstance;
    UtilityRouting.initialize(TestBed.inject(Router));
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize form group in ngOnInit', () => {
    // Arrange
    const mockFormBuilder = TestBed.inject(FormBuilder);
    const formGroupSpy = spyOn(mockFormBuilder, 'group').and.callThrough();

    // Act
    component.ngOnInit();

    // Assert
    expect(formGroupSpy).toHaveBeenCalled();
    expect(component.roleNameFormGroup).toBeDefined();
  });
  it('should call resizeMainPage.update with default value on ngOnDestroy', () => {
    // Arrange
    const resizeUpdateSpy = spyOn(component['genericService'].resizeMainPage, 'update');

    // Act
    component.ngOnDestroy();

    // Assert
    expect(resizeUpdateSpy).toHaveBeenCalledWith(jasmine.any(Function));
    const updateFunction = resizeUpdateSpy.calls.mostRecent().args[0];
    expect(updateFunction('someArgument')).toBe(component['genericService'].defaultValue());
  });

  it('should navigate to the role list page when goToExit is called', () => {
    // Act
    component.goToExit();

    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user-profile/role-list']);
  });

  it('should update the role data when onRoleListUpdated is called', () => {
    // Arrange
    const updatedRoleModel: RoleModel = { id: 1, name: 'Updated Role' } as RoleModel;

    // Act
    component.onRoleListUpdated(updatedRoleModel);

    // Assert
    expect(component.updatedRoleData).toEqual(updatedRoleModel);
  });

  it('should update updatedRoleData in onRoleListUpdated', () => {
    const role: RoleModel = { id: 2, name: 'Test' } as RoleModel;
    component.onRoleListUpdated(role);
    expect(component.updatedRoleData).toEqual(role);
  });

  xit('should call createNewRole and handle success', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    const mockFormBuilder = TestBed.inject(FormBuilder);
    component.roleNameFormGroup = mockFormBuilder.group({
      name: ['New Role']
    });
    const postSpy = (mockRoleService.postApiRoleV1$Json = jasmine.createSpy().and.returnValue({
      subscribe: (handlers: { next: () => void; error?: (error: HttpErrorResponse) => void }) => {
        handlers.next();
      }
    } as { subscribe: (handlers: { next: () => void; error?: (error: HttpErrorResponse) => void }) => void }));

    // Act
    component.save();

    // Assert
    expect(postSpy).toHaveBeenCalled();
    expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.role-list.enable.successCreate');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user-profile/role-list']);
  });

  xit('should handle error when createNewRole fails', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    const mockFormBuilder = TestBed.inject(FormBuilder);
    component.roleNameFormGroup = mockFormBuilder.group({
      name: ['New Role']
    });
    const errorObj = new HttpErrorResponse({ error: 'error' });
    const postSpy = (mockRoleService.postApiRoleV1$Json = jasmine.createSpy().and.returnValue({
      subscribe: (handlers: { next: () => void; error?: (error: HttpErrorResponse) => void }) => {
        handlers.error?.(errorObj);
      }
    } as { subscribe: (handlers: { next: () => void; error?: (error: HttpErrorResponse) => void }) => void }));
    const modalRefMock = {
      componentInstance: { data: null },
      result: Promise.resolve('confirmed')
    } as NgbModalRef;
    mockModalService.open.and.returnValue(modalRefMock);

    // Act
    component.save();

    // Assert
    expect(postSpy).toHaveBeenCalled();
    expect(mockModalService.open).toHaveBeenCalled(); // Ensure the modal is opened
  });

  it('should call roleService.putApiRoleV1Id$Json and handle success in editRole', () => {
    // Arrange
    const params = { id: 123, body: { id: 123, name: 'RoleName' } };
    component['idUser'] = 123;
    component.updatedRoleData = { id: 123, name: 'RoleName' };
    // Instead of reassigning the spy, update its return value
    mockRoleService.putApiRoleV1Id$Json.and.returnValue(of({}));

    // Act
    component.editRole();

    // Assert
    expect(mockRoleService.putApiRoleV1Id$Json).toHaveBeenCalledWith(params);
    expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.role-list.enable.successEdit');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user-profile/role-list']);
  });

  it('should call roleService.putApiRoleV1Id$Json and handle error in editRole', () => {
    // Arrange
    const params = { id: 123, body: { id: 123, name: 'RoleName' } };
    component['idUser'] = 123;
    component.updatedRoleData = { id: 123, name: 'RoleName' };
    const errorObj = new HttpErrorResponse({ error: 'error' });
    const putSpy = (mockRoleService.putApiRoleV1Id$Json = jasmine.createSpy().and.returnValue({
      subscribe: (handlers: { next: () => void; error?: (error: HttpErrorResponse) => void }) => {
        handlers.error?.(errorObj);
      }
    } as { subscribe: (handlers: { next: () => void; error?: (error: HttpErrorResponse) => void }) => void }));

    // Add this: mock the modal to prevent TypeError
    mockModalService.open.and.returnValue({
      componentInstance: {},
      result: Promise.resolve()
    } as NgbModalRef);

    // Act
    (component as RoleEditComponent).editRole();

    // Assert
    expect(putSpy).toHaveBeenCalledWith(params);
  });

  it('should set the dynamic stepper width in the document style', () => {
    // Arrange
    const width = '500px';
    const setPropertySpy = spyOn(document.documentElement.style, 'setProperty');

    // Act
    (component as any).setDynamicStepperWidth(width);

    // Assert
    expect(setPropertySpy).toHaveBeenCalledWith('--dynamic-stepper-width', width);
  });

  it('should update the role name form control and originalRoleName in updateRoleNameControl', () => {
    // Arrange
    component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
      name: ['Initial Name']
    });
    const newRoleName = 'Updated Role Name';

    // Act
    component.updateRoleNameControl(newRoleName);

    // Assert
    expect(component.roleNameFormGroup.get('name')?.value).toBe(newRoleName);
    expect(component.originalRoleName).toBe(newRoleName);
  });

  it('should call editRole when type is EDIT and checkIsSpecial returns false', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    spyOn(component, 'checkIsSpecial').and.returnValue(false);
    spyOn(component, 'editRole');
    component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
      name: ['Role Name']
    });

    // Act
    component.save();

    // Assert
    expect(component.editRole).toHaveBeenCalled();
  });

  it('should call openSaveConfirmationModal when type is EDIT and checkIsSpecial returns true', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    spyOn(component, 'checkIsSpecial').and.returnValue(true);
    spyOn(component, 'openSaveConfirmationModal');
    component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
      name: ['Role Name']
    });

    // Act
    component.save();

    // Assert
    expect(component.openSaveConfirmationModal).toHaveBeenCalled();
  });

  it('should call createNewRole when type is CREATE, form is valid, hasPermissions is true, and checkIsSpecial returns false', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    component.hasPermissions = true;
    spyOn(component, 'checkIsSpecial').and.returnValue(false);
    spyOn(component, 'createNewRole');
    component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
      name: ['Role Name']
    });
    component.roleNameFormGroup.markAsDirty();
    component.roleNameFormGroup.markAsTouched();

    // Act
    component.save();

    // Assert
    expect(component.createNewRole).toHaveBeenCalled();
  });

  it('should call openSaveConfirmationModal when type is CREATE, form is valid, hasPermissions is true, and checkIsSpecial returns true', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    component.hasPermissions = true;
    spyOn(component, 'checkIsSpecial').and.returnValue(true);
    spyOn(component, 'openSaveConfirmationModal');
    component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
      name: ['Role Name']
    });
    component.roleNameFormGroup.markAsDirty();
    component.roleNameFormGroup.markAsTouched();

    // Act
    component.save();

    // Assert
    expect(component.openSaveConfirmationModal).toHaveBeenCalled();
  });

  describe('roleNameChanged getter', () => {
    it('should return false if role name is unchanged', () => {
      component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
        name: ['Same Name']
      });
      component.originalRoleName = 'Same Name';
      expect(component.roleNameChanged).toBeFalse();
    });

    it('should return true if role name is changed', () => {
      component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
        name: ['Changed Name']
      });
      component.originalRoleName = 'Original Name';
      expect(component.roleNameChanged).toBeTrue();
    });

    it('should return true if originalRoleName is undefined and form value is set', () => {
      component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
        name: ['Some Name']
      });
      component.originalRoleName = undefined as any;
      expect(component.roleNameChanged).toBeTrue();
    });

      it('should return false if form control is missing', () => {
      component.roleNameFormGroup = TestBed.inject(FormBuilder).group({});
      component.originalRoleName = undefined as any;
      expect(component.roleNameChanged).toBeFalse();
    });
  });

  describe('checkIsSpecial', () => {
    it('should return true if any permission has isSpecial true', () => {
      component.updatedRoleData = {
        permissions: [
          { isSpecial: false },
          { isSpecial: true },
          { isSpecial: false }
        ]
      } as any;
      expect(component.checkIsSpecial()).toBeTrue();
    });

    it('should return false if no permission has isSpecial true', () => {
      component.updatedRoleData = {
        permissions: [
          { isSpecial: false },
          { isSpecial: false }
        ]
      } as any;
      expect(component.checkIsSpecial()).toBeFalse();
    });

    it('should return false if permissions is empty', () => {
      component.updatedRoleData = { permissions: [] } as any;
      expect(component.checkIsSpecial()).toBeFalse();
    });

    it('should return false if updatedRoleData is undefined', () => {
      component.updatedRoleData = undefined as any;
      expect(component.checkIsSpecial()).toBeFalse();
    });

    it('should return false if permissions is undefined', () => {
      component.updatedRoleData = {} as any;
      expect(component.checkIsSpecial()).toBeFalse();
    });
  });

  describe('createNewRole', () => {
    it('should call postApiRoleV1$Json and show success message and navigate on success', () => {
      // Arrange
      component.updatedRoleData = { id: 1, name: 'New Role' } as any;
      const postSpy = mockRoleService.postApiRoleV1$Json.and.returnValue(of({}));
      const messageSpy = mockMessageStatusService.show;
      spyOn(UtilityRouting, 'navigateToRoleList');

      // Act
      component.createNewRole();

      // Assert
      expect(postSpy).toHaveBeenCalledWith({ body: { id: 1, name: 'New Role' } });
      expect(messageSpy).toHaveBeenCalledWith('message.role-list.enable.successCreate');
      expect(UtilityRouting.navigateToRoleList).toHaveBeenCalled();
    });

    it('should call manageError on error', () => {
      // Arrange
      component.updatedRoleData = { id: 1, name: 'New Role' } as any;
      // Removed unused variable 'params'
      const errorObj = new HttpErrorResponse({ error: 'error' });
      mockRoleService.postApiRoleV1$Json.and.returnValue({
        subscribe: ({ error }: any) => error(errorObj)
      });
      const manageErrorSpy = spyOn(component['genericService'], 'manageError');

      // Act
      component.createNewRole();

      // Assert
      expect(manageErrorSpy).toHaveBeenCalledWith(errorObj);
    });
  });

  describe('openSaveConfirmationModal', () => {
    let modalRefMock: any;

    beforeEach(() => {
      modalRefMock = {
        componentInstance: {},
        result: Promise.resolve('confirmed')
      };
      mockModalService.open.and.returnValue(modalRefMock);
      component.updatedRoleData = { name: 'RoleName' } as any;
      component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
        name: ['RoleName']
      });
      component.hasPermissions = true;
    });

    it('should open modal and call editRole on EDIT type', async () => {
      component.type = USER_PROFILE_CONSTANTS.EDIT;
      spyOn(component, 'editRole');
      await component.openSaveConfirmationModal();
      // Simulate modal result resolution
      await modalRefMock.result;
      expect(mockModalService.open).toHaveBeenCalled();
      expect(modalRefMock.componentInstance.data).toEqual(jasmine.objectContaining({
        title: 'attention',
        content: 'extraConeMessage',
        showCancel: true,
        cancelText: 'modal.cancelText',
        confirmText: 'modal.confirmText',
        additionalData: [{ placeHolder: 'roleName', value: 'RoleName' }]
      }));
      expect(component.editRole).toHaveBeenCalled();
    });

    it('should open modal and call createNewRole on CREATE type with valid form and permissions', async () => {
      component.type = USER_PROFILE_CONSTANTS.CREATE;
      spyOn(component, 'createNewRole');
      component.roleNameFormGroup.markAsDirty();
      component.roleNameFormGroup.markAsTouched();
      await component.openSaveConfirmationModal();
      await modalRefMock.result;
      expect(mockModalService.open).toHaveBeenCalled();
      expect(component.createNewRole).toHaveBeenCalled();
    });

    it('should not call editRole or createNewRole if modal result is falsy', async () => {
      modalRefMock.result = Promise.resolve('');
      component.type = USER_PROFILE_CONSTANTS.EDIT;
      spyOn(component, 'editRole');
      spyOn(component, 'createNewRole');
      await component.openSaveConfirmationModal();
      await modalRefMock.result;
      expect(component.editRole).not.toHaveBeenCalled();
      expect(component.createNewRole).not.toHaveBeenCalled();
    });

    it('should not call createNewRole if form is invalid or hasPermissions is false', async () => {
      component.type = USER_PROFILE_CONSTANTS.CREATE;
      spyOn(component, 'createNewRole');
      component.hasPermissions = false;
      await component.openSaveConfirmationModal();
      await modalRefMock.result;
      expect(component.createNewRole).not.toHaveBeenCalled();

      // Now test with invalid form
      component.hasPermissions = true;
      component.roleNameFormGroup = TestBed.inject(FormBuilder).group({
        name: ['']
      });
      component.roleNameFormGroup.get('name')?.setErrors({ required: true });
      await component.openSaveConfirmationModal();
      await modalRefMock.result;
      expect(component.createNewRole).not.toHaveBeenCalled();
    });
  });

  describe('lockRole', () => {
    it('should call roleService.postApiRoleV1IdLock$Response with correct param and return observable', () => {
      const idRole = 123;
      const expectedParam = { id: idRole };
      const response$ = of({ status: 204 } as any);
      mockRoleService.postApiRoleV1IdLock$Response.and.returnValue(response$);

      const result$ = component.lockRole(idRole);

      expect(mockRoleService.postApiRoleV1IdLock$Response).toHaveBeenCalledWith(expectedParam);
      expect(result$).toBe(response$);
    });
  });

  describe('unlockRole', () => {
    it('should call roleService.postApiRoleV1IdUnlock$Response with correct param and return observable', () => {
      const idRole = 456;
      const expectedParam = { id: idRole };
      const response$ = of({ status: 204 } as any);
      mockRoleService.postApiRoleV1IdUnlock$Response.and.returnValue(response$);

      const result$ = component.unlockRole(idRole);

      expect(mockRoleService.postApiRoleV1IdUnlock$Response).toHaveBeenCalledWith(expectedParam);
      expect(result$).toBe(response$);
    });
  });
});
