/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleListModalComponent } from './role-list-modal.component';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoleService } from '../../../api/glsUserApi/services';
import { PermissionAssignmentModel } from '../../../api/glsUserApi/models';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { VIEW_MODE } from '../../../common/app.constants';

describe('RoleListModalComponent', () => {
  let component: RoleListModalComponent;
  let fixture: ComponentFixture<RoleListModalComponent>;
  let activeModal: NgbActiveModal;

  let roleService: jasmine.SpyObj<any>;

  const mockRoles = [
    {
      id: 1,
      name: 'Admin',
      description: 'Administrator role',
      permissions: [
        { id: 101, name: 'Permission1', accessType: 'Read' } as PermissionAssignmentModel,
        { id: 102, name: 'Permission2', accessType: 'Write' } as PermissionAssignmentModel
      ]
    },
    {
      id: 2,
      name: 'User',
      description: 'Standard user role',
      permissions: [{ id: 103, name: 'Permission3', accessType: 'Read' } as PermissionAssignmentModel]
    },
    {
      id: 3,
      name: 'Guest',
      description: null,
      permissions: null
    }
  ];
  beforeEach(async () => {
    roleService = jasmine.createSpyObj('roleService', ['postApiRoleV1Search$Json']);
    // Set a default return value for all tests
    roleService.postApiRoleV1Search$Json.and.returnValue(of({ roles: mockRoles }));

    await TestBed.configureTestingModule({
      imports: [RoleListModalComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [NgbActiveModal, { provide: RoleService, useValue: roleService }]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListModalComponent);
    component = fixture.componentInstance;
    activeModal = TestBed.inject(NgbActiveModal);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isSmallMobile and isTablet correctly in setupViewMode', () => {
    // Mock genericService
    const genericService: any = component['genericService'];

    // Test MOBILE
    genericService.viewMode = jasmine.createSpy().and.returnValue(VIEW_MODE.MOBILE);
    component.isSmallMobile = { set: jasmine.createSpy() } as any;
    component.isTablet = { set: jasmine.createSpy() } as any;
    component['setupViewMode']();
    expect(component.isSmallMobile.set).toHaveBeenCalledWith(true);
    expect(component.isTablet.set).toHaveBeenCalledWith(false);

    // Test TABLET
    genericService.viewMode = jasmine.createSpy().and.returnValue(VIEW_MODE.TABLET);
    component.isSmallMobile = { set: jasmine.createSpy() } as any;
    component.isTablet = { set: jasmine.createSpy() } as any;
    component['setupViewMode']();
    expect(component.isSmallMobile.set).toHaveBeenCalledWith(false);
    expect(component.isTablet.set).toHaveBeenCalledWith(true);

    // Test DESKTOP (or any other)
    genericService.viewMode = jasmine.createSpy().and.returnValue('DESKTOP');
    component.isSmallMobile = { set: jasmine.createSpy() } as any;
    component.isTablet = { set: jasmine.createSpy() } as any;
    component['setupViewMode']();
    expect(component.isSmallMobile.set).toHaveBeenCalledWith(false);
    expect(component.isTablet.set).toHaveBeenCalledWith(false);
  });

  it('should call closeModal and close the modal', () => {
    spyOn(activeModal, 'close');
    component.closeModal();
    expect(activeModal.close).toHaveBeenCalledWith(false);
  });

  it('should call save and close the modal with selected roles', () => {
    spyOn(activeModal, 'close');
    component.selectedRole = [mockRoles[0]];
    component.save();
    expect(activeModal.close).toHaveBeenCalledWith(component.selectedRole);
  });

  it('should filter roles based on search value', () => {
    component.allRoles = [...mockRoles];
    component.roleData = [...mockRoles];
    (component as any).filterRoles('Admin');
    expect(component.roleData).toEqual([mockRoles[0]]);
  });
  it('should filter roles based on search value', () => {
    component.roleData = [...mockRoles];
    component.allRoles = [...mockRoles]; // Ensure allRoles is set for filterRoles to work
    component['filterRoles']('Admin');
    // Add this line to repopulate roleData after filtering, as filterRoles updates roleData internally
    expect(component.roleData).toEqual([mockRoles[0]]);
  });

  it('should populate roleCheckboxArray correctly', () => {
    component.roleData = [...mockRoles];
    component.selectedRole = [];
    component.populateRoleCheckboxArray();
    expect(component.roleCheckboxArray.length).toBe(3);
    expect(component.roleCheckboxArray[0].isChecked).toBe(false);
    expect(component.roleCheckboxArray[1].isDisabled).toBe(false);
  });

  it('should handle checkbox change correctly', () => {
    component.roleCheckboxArray = [{ ...mockRoles[0], isChecked: false, isDisabled: false }];
    const event = { target: { checked: true } } as unknown as Event;
    component.onCheckboxChange(1, event);
    expect(component.roleCheckboxArray[0].isChecked).toBeTrue();
    expect(component.selectedRole).toContain(component.roleCheckboxArray[0]);
  });

  it('should remove role from selectedRole when unchecked', () => {
    component.roleCheckboxArray = [{ ...mockRoles[0], isChecked: true, isDisabled: false }];
    component.selectedRole = [component.roleCheckboxArray[0]];
    const event = { target: { checked: false } } as unknown as Event;
    component.onCheckboxChange(1, event);
    expect(component.selectedRole).not.toContain(component.roleCheckboxArray[0]);
  });

  it('should enable save button if any checkbox is checked', () => {
    component.roleCheckboxArray = [
      { ...mockRoles[0], isChecked: true, isDisabled: false },
      { ...mockRoles[1], isChecked: false, isDisabled: true }
    ];
    expect(component.enableSaveButton()).toBeTrue();
  });

  it('should disable save button if no checkbox is checked', () => {
    component.roleCheckboxArray = [
      { ...mockRoles[0], isChecked: false, isDisabled: false },
      { ...mockRoles[1], isChecked: false, isDisabled: true }
    ];
    expect(component.enableSaveButton()).toBeFalse();
  });

  it('should add controls in roleCheckboxFormGroup', () => {
    component.roleData = [...mockRoles];
    component.roleCheckboxFormGroup();
    expect(component.roleFormGroup.contains('role_1')).toBeTrue();
    expect(component.roleFormGroup.get('role_1')?.disabled).toBeFalse();
    expect(component.roleFormGroup.contains('role_2')).toBeTrue();
    expect(component.roleFormGroup.get('role_2')?.disabled).toBeFalse();
  });

  // it('should open error modal with correct data', () => {
  //   spyOn(component['modalService'], 'open').and.returnValue({
  //     componentInstance: { data: null },
  //     result: Promise.resolve('ok')
  //   } as NgbModalRef);
  //   component.openErrorModal('Error', 'An error occurred');
  //   expect(component['modalService'].open).toHaveBeenCalled();
  //   expect(component.dialogData).toEqual({
  //     title: 'Error',
  //     content: 'An error occurred',
  //     additionalData: undefined,
  //     showCancel: false,
  //     confirmText: 'ok'
  //   });
  // });

  it('should track roles by ID', () => {
    expect(component.trackByRoleId(0, mockRoles[0])).toBe(1);
  });

  it('should track permissions by ID', () => {
    const permission = { id: 1, name: 'Permission1', accessType: 'Read' } as PermissionAssignmentModel;
    const result = component.trackByPermissionsId(0, permission);
    expect(result).toBe(permission.id);
  });

  it('should call setupSearchListener and filter roles on input change', () => {
    spyOn(component as any, 'filterRoles');
    component.setupSearchListener();
    component.roleFormGroup.get('searchRoleControlName')?.setValue('Admin');
    expect(component['filterRoles']).toHaveBeenCalledWith('Admin');
  });

  it('should call searchRole and filter roles', () => {
    component.roleData = [...mockRoles];
    component.roleFormGroup.get('searchRoleControlName')?.setValue('Admin');
    spyOn<any>(component, 'filterRoles');
    component.searchRole();
    expect(component['filterRoles']).toHaveBeenCalledWith('Admin');
  });

  it('should not add duplicate roles to selectedRole on checkbox change', () => {
    component.roleCheckboxArray = [{ ...mockRoles[0], isChecked: false, isDisabled: false }];
    component.selectedRole = [component.roleCheckboxArray[0]];
    const event = { target: { checked: true } } as unknown as Event;
    component.onCheckboxChange(1, event);
    // Should not add duplicate
    expect(new Set(component.selectedRole.map((r) => r.id)).size).toBe(component.selectedRole.length);
  });

  it('should handle onCheckboxChange when role is not found', () => {
    component.roleCheckboxArray = [];
    const event = { target: { checked: true } } as unknown as Event;
    expect(() => component.onCheckboxChange(999, event)).not.toThrow();
  });

  // it('should handle manageError with malformed error', () => {
  //   spyOn(component, 'openErrorModal');
  //   const err = { error: {} } as HttpErrorResponse;
  //   component.manageError(err);
  //   expect(component.openErrorModal).toHaveBeenCalled();
  // });

  // it('should handle openErrorModal with additionalData', () => {
  //   spyOn(component['modalService'], 'open').and.returnValue({
  //     componentInstance: { data: null },
  //     result: Promise.resolve('ok')
  //   } as NgbModalRef);
  //   const additionalData = [{ placeHolder: 'ph', value: 'val' }];
  //   component.openErrorModal('Error', 'An error occurred', additionalData);
  //   expect(component.dialogData.additionalData).toEqual(additionalData);
  // });

  it('should not filter roles if search value is empty', () => {
    component.roleData = [...mockRoles];
    component.allRoles = [...mockRoles]; // Ensure allRoles is set for filterRoles to work
    component['filterRoles']('');
    expect(component.roleData.length).toBe(mockRoles.length);
  });

  // Additional test: verify dialogData default values
  // it('should set dialogData with default values in openErrorModal', () => {
  //   spyOn(component['modalService'], 'open').and.returnValue({
  //     componentInstance: { data: null },
  //     result: Promise.resolve('ok')
  //   } as NgbModalRef);
  //   component.openErrorModal('Test Title', 'Test Content');
  //   expect(component.dialogData.title).toBe('Test Title');
  //   expect(component.dialogData.content).toBe('Test Content');
  //   expect(component.dialogData.confirmText).toBe('ok');
  // });
  it('should return the searchRoleControlName form control', () => {
    // Arrange
    const control = component.roleFormGroup.get('searchRoleControlName');
    // Act & Assert
    expect(component.searchRoleControlName).toBe(control);
  });

  it('should return the roleName form control', () => {
    // Arrange
    const control = component.roleFormGroup.get('roleName');
    // Act & Assert
    expect(component.roleName).toBe(control);
  });

  it('should reset roleData, call roleCheckboxFormGroup, populateRoleCheckboxArray, and set hasSearched to true if search input is empty', () => {
    // Arrange
    component.allRoles = [{ id: 1, name: 'Admin', description: 'Administrator role', permissions: [] }];
    component.roleData = [];
    component.roleFormGroup = new FormGroup({
      searchRoleControlName: new FormControl('   ') // whitespace only, triggers reset
    });

    const roleCheckboxFormGroupSpy = spyOn(component, 'roleCheckboxFormGroup');
    const populateRoleCheckboxArraySpy = spyOn(component, 'populateRoleCheckboxArray');

    // Act
    component.searchRole();

    // Assert
    expect(component.roleData).toEqual(component.allRoles);
    expect(roleCheckboxFormGroupSpy).toHaveBeenCalled();
    expect(populateRoleCheckboxArraySpy).toHaveBeenCalled();
    expect(component.hasSearched).toBeTrue();
  });

  // it('should call manageError when retrieveRole emits an error', () => {
  //   // Arrange
  //   const error = new HttpErrorResponse({ error: 'API error' });
  //   spyOn(component, 'retrieveRole').and.returnValue({
  //     subscribe: ({ next, error: errorFn }: any) => errorFn(error)
  //   } as any);
  //   const manageErrorSpy = spyOn(component, 'manageError');

  //   // Act
  //   component.loadInitialRoleData();

  //   // Assert
  //   expect(manageErrorSpy).toHaveBeenCalledWith(error);
  // });

  it('should disable the form control if the role permissions array is empty', () => {
    // Arrange
    component.roleData = [{ id: 1, name: 'NoPermRole', description: 'No permissions', permissions: [] }];
    component.roleFormGroup = new FormGroup({});
    component.fb = new FormBuilder();

    // Act
    component.roleCheckboxFormGroup();

    // Assert
    const controlName = 'role_1';
    expect(component.roleFormGroup.get(controlName)?.disabled).toBeTrue();
  });

  it('should set isChecked true if role is in selectedRole and has permissions, and isDisabled true if permissions is empty', () => {
    // Arrange
    const roleWithPerms = {
      id: 1,
      name: 'Admin',
      description: 'desc',
      permissions: [{ id: 1, name: 'p', accessType: 'Read' as 'Read', description: 'description' }]
    };
    const roleNoPerms = { id: 2, name: 'NoPerm', description: 'desc', permissions: [] };
    component.roleData = [roleWithPerms, roleNoPerms];
    component.selectedRole = [roleWithPerms];
    component.roleFormGroup = new FormGroup({
      role_1: new FormControl(false),
      role_2: new FormControl(false)
    });

    // Act
    component.populateRoleCheckboxArray();

    // Assert
    // roleWithPerms: isChecked should be true, isDisabled should be false
    expect(component.roleCheckboxArray[0].isChecked).toBeTrue();
    expect(component.roleCheckboxArray[0].isDisabled).toBeFalse();

    // roleNoPerms: isChecked should be false, isDisabled should be true
    expect(component.roleCheckboxArray[1].isChecked).toBeFalse();
    expect(component.roleCheckboxArray[1].isDisabled).toBeTrue();
  });

  it('should deep copy this.data to existingRoleList and selectedRole in ngOnInit', () => {
    // Arrange
    const inputData = [{ id: 1, name: 'Admin', description: 'desc', permissions: [{ id: 1, name: 'p', accessType: 'Read' as 'Read' }] }];
    component.data = inputData;

    // Act
    component.ngOnInit();

    // Assert
    expect(component.existingRoleList).toEqual(inputData);
    expect(component.selectedRole).toEqual(inputData);

    // Ensure deep copy (not the same reference)
    expect(component.existingRoleList).not.toBe(inputData);
    expect(component.selectedRole).not.toBe(inputData);

    // Changing the original should not affect the copies
    inputData[0].name = 'Changed';
    expect(component.existingRoleList[0].name).toBe('Admin');
    expect(component.selectedRole[0].name).toBe('Admin');
  });

  it('should return true if searchRoleControlName value is whitespace and hasSearched is true', () => {
    component.roleFormGroup = new FormGroup({
      searchRoleControlName: new FormControl('   ')
    });
    component.hasSearched = true;

    expect(component.isSearchDisabled).toBeTrue();
  });

  it('should return true if searchRoleControlName value is null and hasSearched is true', () => {
    component.roleFormGroup = new FormGroup({
      searchRoleControlName: new FormControl(null)
    });
    component.hasSearched = true;

    expect(component.isSearchDisabled).toBeTrue();
  });

  // it('should call openErrorModal with generic error if Utility.logErrorForDevEnvironment throws', () => {
  //   // Arrange
  //   spyOn(Utility, 'logErrorForDevEnvironment').and.throwError('Unexpected error');
  //   const openErrorModalSpy = spyOn(component, 'openErrorModal');
  //   const mockError = {} as HttpErrorResponse;

  //   // Act
  //   component.manageError(mockError);

  //   // Assert
  //   expect(openErrorModalSpy).toHaveBeenCalledWith('attention', 'serviceMessage.genericError');
  // });
});
