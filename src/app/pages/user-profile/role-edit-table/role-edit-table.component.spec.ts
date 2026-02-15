/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleEditTableComponent } from './role-edit-table.component';
import { RoleService } from '../../../api/glsUserApi/services';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PermissionAssignmentModel, RoleModel } from '../../../api/glsUserApi/models';
import { PERMISSION } from '../../../common/utilities/constants/profile';
import { USER_PROFILE_CONSTANTS } from '../constants/user-constants';

describe('RoleEditTableComponent', () => {
  let component: RoleEditTableComponent;
  let fixture: ComponentFixture<RoleEditTableComponent>;
  let mockRoleService: jasmine.SpyObj<RoleService>;

  beforeEach(async () => {
    // Mock RoleService
    mockRoleService = jasmine.createSpyObj('RoleService', ['getApiRoleV1Id$Json', 'getApiRoleV1Permissions$Json']);

    await TestBed.configureTestingModule({
      imports: [RoleEditTableComponent, ReactiveFormsModule],
      providers: [{ provide: RoleService, useValue: mockRoleService }, FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleEditTableComponent);
    component = fixture.componentInstance;
    component.checkedCount = 0;
    component.currentRoleData = {
      id: 1,
      name: 'Role Name',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }]
    };
    component.initializeFormGroup();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFeatures and populate featureList on ngOnInit', () => {
    // Arrange

    // Define mockCurrentRoleData
    const mockCurrentRoleData = {
      id: 1,
      name: 'Admin',
      description: 'Admin Role',
      permissions: [
        { id: 1, name: 'Read', description: 'Permission 1', accessType: PERMISSION.read },
        { id: 2, name: 'Write', description: 'Permission 2', accessType: PERMISSION.write }
      ]
    };
    mockRoleService.getApiRoleV1Permissions$Json.and.returnValue(of([mockCurrentRoleData]));

    // Act
    component.ngOnInit();

    // Assert
    expect(mockRoleService.getApiRoleV1Permissions$Json).toHaveBeenCalled();
  });
  it('should call getFeatures and initialize form group and checked count when idUser is provided', () => {
    // Arrange
    spyOn(component, 'idUser').and.returnValue(1);
    const mockFeatures: {
      id: number;
      name: string;
      description: string;
      accessType: PERMISSION.read | PERMISSION.write;
      isChecked: boolean;
      isSpecial?: boolean;
    }[] = [
      { id: 1, name: 'Permission 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true, isSpecial: false },
      { id: 2, name: 'Permission 2', description: 'Description 2', accessType: PERMISSION.write, isChecked: true, isSpecial: true }
    ];
    const mockPermissions = [
      { id: 1, name: 'Permission 1', description: 'Description 1', accessType: PERMISSION.read, isSpecial: false },
      { id: 2, name: 'Permission 2', description: 'Description 2', accessType: PERMISSION.write, isSpecial: true }
    ];
    mockRoleService.getApiRoleV1Permissions$Json.and.returnValue(of(mockPermissions));
    spyOn(component, 'getFeatures').and.returnValue(of(mockFeatures));
    const initializeFormGroupSpy = spyOn(component, 'initializeFormGroup');
    const getCheckedCountSpy = spyOn(component, 'getCheckedCount');

    // Act
    component.ngOnInit();

    // Assert
    expect(mockRoleService.getApiRoleV1Permissions$Json).toHaveBeenCalled();
    expect(component.getFeatures).toHaveBeenCalled();
    expect(component.featureList).toEqual(mockFeatures);
    expect(initializeFormGroupSpy).toHaveBeenCalled();
    expect(getCheckedCountSpy).toHaveBeenCalled();
  });

  it('should handle empty permissions in getFeatures', (done) => {
    // Arrange
    const mockRoleModel: RoleModel = {
      id: 123,
      name: 'Mock Role',
      permissions: []
    };
    mockRoleService.getApiRoleV1Id$Json.and.returnValue(of(mockRoleModel));

    // Act
    component.getFeatures().subscribe((result) => {
      // Assert
      expect(result).toEqual([]);
      expect(component.featureList).toEqual([]);
      done();
    });
  });

  it('should return the correct columns from columns() method', () => {
    // Act
    const columns = component.columns();

    // Assert
    expect(columns).toEqual([{ prop: 'description', name: 'Funzionalità da includere', flexGrow: 1 }]);
  });

  it('should fetch features and map permissions correctly', (done) => {
    // Arrange
    const mockRoleResponse: RoleModel = {
      id: 1,
      name: 'Test Role',
      permissions: [
        { id: 101, name: 'Permission 1', description: 'Description 1', accessType: 'Read', isSpecial: false },
        { id: 102, name: 'Permission 2', description: 'Description 2', accessType: 'Write', isSpecial: true }
      ]
    };

    const expectedFeatures: PermissionAssignmentModel[] = [
      { id: 101, name: 'Permission 1', description: 'Description 1', accessType: 'Read', isSpecial: false },
      { id: 102, name: 'Permission 2', description: 'Description 2', accessType: 'Write', isSpecial: true }
    ];

    spyOn(component, 'idUser').and.returnValue(1); // Mock idUser to return a valid ID
    mockRoleService.getApiRoleV1Id$Json.and.returnValue(of(mockRoleResponse)); // Mock API call

    // Act
    component.getFeatures().subscribe((features) => {
      // Assert
      expect(features).toEqual(expectedFeatures); // Verify the mapped features
      expect(component.currentRoleData).toEqual(mockRoleResponse); // Verify currentRoleData is set
      if (component.type === USER_PROFILE_CONSTANTS.CREATE) {
        expect(component.createdRoleData).toEqual({ ...mockRoleResponse, permissions: [] }); // Verify createdRoleData is initialized
      }
      done();
    });
  });

  it('should enable and set read control value', () => {
    // Arrange
    component.featureFormGroup = component['fb'].group({
      read_1: [{ value: '', disabled: true }],
      write_1: [{ value: '', disabled: true }]
    });

    // Act
    component['updatePermissionControls'](1, PERMISSION.read, '', true);

    // Assert
    const readControl = component.featureFormGroup.get('read_1');
    const writeControl = component.featureFormGroup.get('write_1');

    expect(readControl?.value).toBe(PERMISSION.read);
    expect(readControl?.enabled).toBeTrue();
    expect(writeControl?.enabled).toBeTrue();
  });

  it('should enable and set write control value', () => {
    // Arrange
    component.featureFormGroup = component['fb'].group({
      read_2: [{ value: '', disabled: true }],
      write_2: [{ value: '', disabled: true }]
    });

    // Act
    component['updatePermissionControls'](2, '', PERMISSION.write, true);

    // Assert
    const readControl = component.featureFormGroup.get('read_2');
    const writeControl = component.featureFormGroup.get('write_2');

    expect(writeControl?.value).toBe(PERMISSION.write);
    expect(writeControl?.enabled).toBeTrue();
    expect(readControl?.enabled).toBeTrue();
  });

  it('should disable controls and reset values', () => {
    // Arrange
    component.featureFormGroup = component['fb'].group({
      read_1: [{ value: 'SomeValue', disabled: false }],
      write_1: [{ value: 'SomeValue', disabled: false }]
    });

    // Act
    component['updatePermissionControls'](1, '', '', false);

    // Assert
    const readControl = component.featureFormGroup.get('read_1');
    const writeControl = component.featureFormGroup.get('write_1');

    expect(readControl?.value).toBe('');
    expect(readControl?.enabled).toBeFalse();
    expect(writeControl?.value).toBe('');
    expect(writeControl?.enabled).toBeFalse();
  });

  it('should update permission controls and checkedCount when onCheckboxChange is called (checked)', () => {
    // Arrange
    const data = { id: 1, description: 'Permission 1' } as RoleModel;
    component.featureFormGroup = component['fb'].group({
      'Permission 1': [true] // Checkbox is checked
    });
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Permission 1', accessType: PERMISSION.read, isChecked: false }];
    const updatePermissionControlsSpy = spyOn(component as any, 'updatePermissionControls');
    component.checkedCount = 5;

    // Act
    component.onCheckboxChange(data);

    // Assert
    expect(updatePermissionControlsSpy).toHaveBeenCalledWith(1, 'Read', '', true); // Permission controls should be updated
    expect(component.checkedCount).toBe(6); // checkedCount should be incremented
  });

  it('should update feature isChecked and permission controls when checkbox is unchecked', () => {
    // Arrange
    const data = { id: 1, description: 'Permission 1' } as RoleModel;
    component.featureFormGroup = component['fb'].group({
      'Permission 1': [false] // Checkbox is unchecked
    });
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Permission 1', accessType: PERMISSION.read, isChecked: true }];
    const updatePermissionControlsSpy = spyOn(component as any, 'updatePermissionControls');

    // Act
    component.onCheckboxChange(data);

    // Assert
    expect(component.featureList[0].isChecked).toBeFalse(); // isChecked should be updated
    expect(updatePermissionControlsSpy).toHaveBeenCalledWith(1, '', '', false); // Permission controls should be updated
    expect(component.checkedCount).toBe(-1); // checkedCount should be decremented
  });

  it('should not update permission controls if control is not found', () => {
    // Arrange
    const data = { id: 2, description: 'Permission 2' } as RoleModel;
    component.featureFormGroup = component['fb'].group({});
    const updatePermissionControlsSpy = spyOn(component as any, 'updatePermissionControls');
    const updateCurrentRoleDataSpy = spyOn(component, 'updateCurrentRoleData');

    // Act
    component.onCheckboxChange(data);

    // Assert
    expect(updatePermissionControlsSpy).not.toHaveBeenCalled(); // Permission controls should not be updated
    expect(updateCurrentRoleDataSpy).not.toHaveBeenCalled(); // updateCurrentRoleData should not be called
  });

  // Test case: Should handle empty featureList gracefully
  it('should handle empty featureList gracefully', () => {
    // Arrange
    component.featureList = [];

    // Act
    component.initializeFormGroup();

    // Assert
    expect(component.featureFormGroup.controls).toEqual({});
  });

  it('should handle permission change to "Read"', () => {
    component.featureFormGroup = component['fb'].group({
      read_1: [{ value: '', disabled: true }],
      write_1: [{ value: '', disabled: true }]
    });
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true }];
    component.currentRoleData = {
      id: 1,
      name: 'Role 1',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }]
    };
    component.onPermissionChange(1, PERMISSION.read);

    const readControl = component.featureFormGroup.get('read_1');
    const writeControl = component.featureFormGroup.get('write_1');

    expect(readControl?.value).toBe(PERMISSION.read);
    expect(writeControl?.value).toBe('');
    expect(readControl?.enabled).toBeTrue();
    expect(writeControl?.enabled).toBeTrue();

    const updatedPermission = component.currentRoleData?.permissions?.find((p) => p.id === 1);
    expect(updatedPermission?.accessType).toBe(PERMISSION.read);
  });

  it('should handle permission change to "Write"', () => {
    component.featureFormGroup = component['fb'].group({
      read_1: [{ value: '', disabled: true }],
      write_1: [{ value: '', disabled: true }]
    });
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.write, isChecked: true }];
    component.currentRoleData = {
      id: 1,
      name: 'Role 1',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.write }]
    };
    component.onPermissionChange(1, PERMISSION.write);

    const readControl = component.featureFormGroup.get('read_1');
    const writeControl = component.featureFormGroup.get('write_1');

    expect(readControl?.value).toBe('');
    expect(writeControl?.value).toBe(PERMISSION.write);
    expect(writeControl?.enabled).toBeTrue();
    expect(readControl?.enabled).toBeTrue();

    const updatedPermission = component.currentRoleData?.permissions?.find((p) => p.id === 1);
    expect(updatedPermission?.accessType).toBe(PERMISSION.write);
  });
  it('should emit updated role data on permission change', () => {
    spyOn(component.roleListUpdated, 'emit');

    component.onPermissionChange(1, 'Read');

    expect(component.roleListUpdated.emit).toHaveBeenCalledWith(component.currentRoleData ?? undefined);
  });

  it('should not proceed if currentRoleData is null', () => {
    // Arrange
    component.currentRoleData = null;
    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should initialize permissions array if currentRoleData.permissions is null', () => {
    // Arrange
    component.currentRoleData = { id: 1, name: 'Role 1', permissions: [] } as RoleModel;
    component.featureList = [];

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(component.currentRoleData.permissions).toEqual([]);
  });

  it('should set accessType to Write if write control value is Write', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.EDIT; // Ensure type is EDIT
    component.currentRoleData = { id: 1, name: 'Role 1', permissions: [] } as RoleModel;

    component.featureList = [
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true, isSpecial: false }
    ]; // Ensure the feature is checked
    component.selectedCheckboxId = 1; // Ensure selectedCheckboxId matches a feature in featureList
    component.featureFormGroup = component['fb'].group({
      write_1: [PERMISSION.write] // Set write control value to Write
    });

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(component.currentRoleData.permissions).toEqual([
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.write, isSpecial: false }
    ]); // Verify the permission is added with accessType set to Write
  });

  it('should add checked feature to currentRoleData.permissions when type is EDIT', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    component.currentRoleData = { id: 1, name: 'Role 1', permissions: [] } as RoleModel;
    component.featureList = [
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true, isSpecial: false }
    ];
    component.selectedCheckboxId = 1;
    component.featureFormGroup = component['fb'].group({
      write_1: ['']
    });

    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(component.currentRoleData.permissions).toEqual([
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isSpecial: false }
    ]);
    expect(emitSpy).toHaveBeenCalledWith(component.currentRoleData);
  });

  it('should add checked feature to createdRoleData.permissions when type is CREATE', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    component.createdRoleData = { id: 0, name: '', permissions: [] } as RoleModel;
    component.featureList = [
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true, isSpecial: false }
    ];
    component.selectedCheckboxId = 1;
    component.featureFormGroup = component['fb'].group({
      write_1: ['']
    });

    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(component.createdRoleData.permissions).toEqual([
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isSpecial: false }
    ]);
    expect(emitSpy).toHaveBeenCalledWith(component.createdRoleData);
  });

  it('should remove unchecked feature from currentRoleData.permissions when type is EDIT', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    component.currentRoleData = {
      id: 1,
      name: 'Role 1',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }]
    } as RoleModel;
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: false }];
    component.selectedCheckboxId = 1;

    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(component.currentRoleData.permissions).toEqual([]);
    expect(emitSpy).toHaveBeenCalledWith(component.currentRoleData);
  });

  it('should remove unchecked feature from createdRoleData.permissions when type is CREATE', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    component.createdRoleData = {
      id: 0,
      name: '',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }]
    } as RoleModel;
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: false }];
    component.selectedCheckboxId = 1;

    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(component.createdRoleData.permissions).toEqual([]);
    expect(emitSpy).toHaveBeenCalledWith(component.createdRoleData);
  });

  it('should not proceed if selectedFeature is not found', () => {
    // Arrange
    component.featureList = [];
    component.selectedCheckboxId = 1;

    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect(emitSpy).not.toHaveBeenCalled();
  });
  it('should not add duplicate permissions to currentRoleData.permissions when type is EDIT', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    component.currentRoleData = {
      id: 1,
      name: 'Role 1',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }]
    } as RoleModel;
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true }];
    component.selectedCheckboxId = 1;
    component.featureFormGroup = component['fb'].group({
      write_1: ['']
    });

    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect((component.currentRoleData.permissions ?? []).length).toBe(1); // Ensure no duplicate is added
    expect(component.currentRoleData.permissions).toEqual([
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }
    ]);
    expect(emitSpy).toHaveBeenCalledWith(component.currentRoleData);
  });
  it('should not add duplicate permissions to createdRoleData.permissions when type is CREATE', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    component.createdRoleData = {
      id: 0,
      name: 'Role 1',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }]
    } as RoleModel;
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true }];
    component.selectedCheckboxId = 1;
    component.featureFormGroup = component['fb'].group({
      write_1: ['']
    });

    const emitSpy = spyOn(component.roleListUpdated, 'emit');

    // Act
    component.updateCurrentRoleData();

    // Assert
    expect((component.createdRoleData.permissions ?? []).length).toBe(1); // Ensure no duplicate is added
    expect(component.createdRoleData.permissions).toEqual([
      { id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }
    ]);
    expect(emitSpy).toHaveBeenCalledWith(component.createdRoleData);
  });
  it('should update accessType in currentRoleData.permissions when type is EDIT', () => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    component.currentRoleData = {
      id: 1,
      name: 'Role 1',
      permissions: [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read }]
    } as RoleModel;
    component.featureList = [{ id: 1, name: 'Feature 1', description: 'Description 1', accessType: PERMISSION.read, isChecked: true }];
    component.featureFormGroup = component['fb'].group({
      write_1: [PERMISSION.write]
    });

    // Act
    component.onPermissionChange(1, 'Write');

    // Assert
    const updatedPermission = (component.currentRoleData.permissions ?? []).find((p) => p.id === 1);
    expect(updatedPermission?.accessType).toBe(PERMISSION.write);
  });
  it('getCheckedcount got update when accesstype is write', (done) => {
    // Arrange
    const mockRoleResponse: RoleModel = {
      id: 1,
      name: 'Test Role',
      permissions: [
        { id: 101, name: 'Permission 1', description: 'Description 1', accessType: PERMISSION.read, isSpecial: false },
        { id: 102, name: 'Permission 2', description: 'Description 2', accessType: PERMISSION.write, isSpecial: true }
      ]
    };

    const expectedFeatures: PermissionAssignmentModel[] = [
      { id: 101, name: 'Permission 1', description: 'Description 1', accessType: PERMISSION.read, isSpecial: false },
      { id: 102, name: 'Permission 2', description: 'Description 2', accessType: PERMISSION.write, isSpecial: true }
    ];

    spyOn(component, 'idUser').and.returnValue(1); // Mock idUser to return a valid ID
    mockRoleService.getApiRoleV1Id$Json.and.returnValue(of(mockRoleResponse)); // Mock API call

    // Act
    component.getFeatures().subscribe((features) => {
      // Assert
      expect(features).toEqual(expectedFeatures); // Verify the mapped features
      expect(component.currentRoleData).toEqual(mockRoleResponse); // Verify currentRoleData is set

      if (component.type === USER_PROFILE_CONSTANTS.CREATE) {
        expect(component.createdRoleData).toEqual({ ...mockRoleResponse, permissions: [] }); // Verify createdRoleData is initialized
      }

      // Verify getCheckedCount logic
      component.featureList = expectedFeatures.map((feature) => ({
        ...feature,
        isChecked: false // Default value for isChecked
      }));
      component.checkedCount = 0; // Reset checkedCount
      component.getCheckedCount();
      expect(component.checkedCount).toBe(2); // Both permissions should be counted

      done();
    });
  });

  it('should fetch features, set currentRoleData, and initialize createdRoleData when type is CREATE', (done) => {
    // Arrange
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    const mockRoleResponse: RoleModel = {
      id: 10,
      name: 'Role X',
      permissions: [
        { id: 201, name: 'Perm 1', description: 'Desc 1', accessType: PERMISSION.read },
        { id: 202, name: 'Perm 2', description: 'Desc 2', accessType: PERMISSION.write }
      ]
    };
    spyOn(component, 'idUser').and.returnValue(10);
    mockRoleService.getApiRoleV1Id$Json.and.returnValue(of(mockRoleResponse));

    // Act
    component.getFeatures().subscribe((features) => {
      // Set featureList as would happen in the component
      component.featureList = (features as PermissionAssignmentModel[]).map((feature) => ({
        ...feature,
        isChecked: false
      }));
      // Assert
      expect(component.currentRoleData).toEqual(mockRoleResponse);
      expect(component.createdRoleData).toEqual({ ...mockRoleResponse, permissions: [] });
      expect(features).toEqual([]);
      done();
    });
  });

  it('should handle permission change to "Read" and update permission in EDIT mode', () => {
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    component.featureFormGroup = component['fb'].group({
      read_1: [{ value: '', disabled: true }],
      write_1: [{ value: '', disabled: true }]
    });
    component.featureList = [{ id: 1, name: 'F', description: '', accessType: PERMISSION.read, isChecked: true }];
    component.currentRoleData = {
      id: 1,
      name: 'Role',
      permissions: [{ id: 1, name: 'F', description: '', accessType: PERMISSION.write }]
    };
    spyOn(component.roleListUpdated, 'emit');
    component.onPermissionChange(1, 'Read');
    expect(component.featureFormGroup.get('read_1')?.value).toBe(PERMISSION.read);
    expect(component.featureFormGroup.get('read_1')?.enabled).toBeTrue();
    expect(component.featureFormGroup.get('write_1')?.value).toBe('');
    expect(component.featureFormGroup.get('write_1')?.enabled).toBeTrue();
    expect(component.currentRoleData.permissions?.[0].accessType).toBe(PERMISSION.read);
    expect(component.roleListUpdated.emit).toHaveBeenCalled();
    // id should be deleted before emit
    expect(component.currentRoleData.id).toBeUndefined();
  });

  it('should handle permission change to "Write" and update permission in CREATE mode', () => {
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    component.featureFormGroup = component['fb'].group({
      read_2: [{ value: '', disabled: true }],
      write_2: [{ value: '', disabled: true }]
    });
    component.featureList = [{ id: 2, name: 'F2', description: '', accessType: PERMISSION.write, isChecked: true }];
    component.createdRoleData = {
      id: 2,
      name: 'Role2',
      permissions: [{ id: 2, name: 'F2', description: '', accessType: PERMISSION.read }]
    };
    spyOn(component.roleListUpdated, 'emit');
    component.onPermissionChange(2, 'Write');
    expect(component.featureFormGroup.get('write_2')?.value).toBe(PERMISSION.write);
    expect(component.featureFormGroup.get('write_2')?.enabled).toBeTrue();
    expect(component.featureFormGroup.get('read_2')?.value).toBe('');
    expect(component.featureFormGroup.get('read_2')?.enabled).toBeTrue();
    expect(component.createdRoleData.permissions?.[0].accessType).toBe(PERMISSION.write);
    expect(component.roleListUpdated.emit).toHaveBeenCalledWith(component.createdRoleData);
  });

  it('should not update permission if row is not checked', () => {
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    component.featureFormGroup = component['fb'].group({
      read_3: [{ value: '', disabled: true }],
      write_3: [{ value: '', disabled: true }]
    });
    component.featureList = [{ id: 3, name: 'F3', description: '', accessType: PERMISSION.read, isChecked: false }];
    component.currentRoleData = {
      id: 3,
      name: 'Role3',
      permissions: [{ id: 3, name: 'F3', description: '', accessType: PERMISSION.read }]
    };
    spyOn(component.roleListUpdated, 'emit');
    component.onPermissionChange(3, 'Read');
    // Permission should not be updated
    expect(component.currentRoleData.permissions?.[0].accessType).toBe(PERMISSION.read);
    expect(component.roleListUpdated.emit).toHaveBeenCalled();
  });

  it('should not update permission if permission is not found', () => {
    component.type = USER_PROFILE_CONSTANTS.EDIT;
    component.featureFormGroup = component['fb'].group({
      read_4: [{ value: '', disabled: true }],
      write_4: [{ value: '', disabled: true }]
    });
    component.featureList = [{ id: 4, name: 'F4', description: '', accessType: PERMISSION.read, isChecked: true }];
    component.currentRoleData = {
      id: 4,
      name: 'Role4',
      permissions: []
    };
    spyOn(component.roleListUpdated, 'emit');
    component.onPermissionChange(4, 'Read');
    // No permission to update, but emit still called
    expect(component.roleListUpdated.emit).toHaveBeenCalled();
  });

  it('should emit createdRoleData if currentRoleData is null', () => {
    component.type = USER_PROFILE_CONSTANTS.CREATE;
    component.currentRoleData = null;
    component.createdRoleData = { id: 5, name: 'Role5', permissions: [] };
    component.featureFormGroup = component['fb'].group({
      read_5: [{ value: '', disabled: true }],
      write_5: [{ value: '', disabled: true }]
    });
    component.featureList = [{ id: 5, name: 'F5', description: '', accessType: PERMISSION.read, isChecked: true }];
    spyOn(component.roleListUpdated, 'emit');
    component.onPermissionChange(5, 'Read');
    expect(component.roleListUpdated.emit).toHaveBeenCalledWith(component.createdRoleData);
  });
});
