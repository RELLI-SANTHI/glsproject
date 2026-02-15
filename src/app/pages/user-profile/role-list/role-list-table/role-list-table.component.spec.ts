import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleListTableComponent } from './role-list-table.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RoleService } from '../../../../api/glsUserApi/services';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { of } from 'rxjs';
import { PermissionAssignmentModel, PermissionModel, RoleModel, UserDetailsModel } from '../../../../api/glsUserApi/models';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';

describe('RoleListTableComponent', () => {
  let component: RoleListTableComponent;
  let fixture: ComponentFixture<RoleListTableComponent>;
  let mockRoleService: jasmine.SpyObj<RoleService>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;

  beforeEach(async () => {
    mockRoleService = jasmine.createSpyObj('RoleService', ['getApiRoleV1Permissions$Json']);
    mockRoleService.getApiRoleV1Permissions$Json.and.returnValue(of([]));
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', [], { profile$: of({} as UserDetailsModel) });
    await TestBed.configureTestingModule({
      imports: [RoleListTableComponent, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: UserProfileService, useValue: mockUserProfileService },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListTableComponent);
    component = fixture.componentInstance;
    // Mock the required form group
    signalSetFn(
      component.roleFilterFg[SIGNAL],
      new FormBuilder().group({
        filterType: [''],
        filterValue: [''],
        permissionValue: ['']
      })
    );
    // Initialize numeric signals to 0
    signalSetFn(component.currentPage[SIGNAL], 0);
    signalSetFn(component.pageSize[SIGNAL], 0);
    signalSetFn(component.totalItems[SIGNAL], 0);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch permissions and map them on ngOnInit', () => {
    const permissions: PermissionModel[] = [
      { id: 1, name: 'READ' },
      { id: 2, name: 'WRITE' }
    ];
    mockRoleService.getApiRoleV1Permissions$Json.and.returnValue(of(permissions));

    component.ngOnInit();

    expect(component.permissonsList).toEqual(permissions);
    expect(component.permissionsOptionsList).toEqual([
      { id: 'READ', value: 'userProfile.roleEdit.READ' },
      { id: 'WRITE', value: 'userProfile.roleEdit.WRITE' }
    ]);
  });

  it('should calculate first and last result correctly', () => {
    // Use signals to set values
    signalSetFn(component.currentPage[SIGNAL], 2);
    signalSetFn(component.pageSize[SIGNAL], 10);
    signalSetFn(component.totalItems[SIGNAL], 15);

    expect(component.getFirstResult()).toBe(11);
    expect(component.getLastResult()).toBe(15);
  });

  it('should track by permission id', () => {
    expect(component.trackByPermissionsId(0, { id: 7 })).toBe(7);
  });

  it('should get role permission name', () => {
    const perm: PermissionAssignmentModel = { name: 'EDIT' } as PermissionAssignmentModel;
    expect(component.getRolePermissionName(perm)).toBe('userProfile.roleEdit.EDIT');
  });

  it('should get permission value for readonly', () => {
    const perm: PermissionAssignmentModel = { accessType: component.PERMISSION.read } as PermissionAssignmentModel;
    expect(component.getpermissionValue(perm)).toBe('userProfile.roleEdit.readonly');
  });

  it('should get permission value for readingAndWriting', () => {
    const perm: PermissionAssignmentModel = { id: 1, name: 'EDIT', accessType: 'Write' } as PermissionAssignmentModel;
    expect(component.getpermissionValue(perm)).toBe('userProfile.roleEdit.readingAndWriting');
  });

  it('should emit searchByFilter event', () => {
    spyOn(component.searchByFilter, 'emit');
    component.searchByFilterEmit();
    expect(component.searchByFilter.emit).toHaveBeenCalled();
  });

  it('should get permission value for readonly', () => {
    const perm: PermissionAssignmentModel = { id: 1, name: 'EDIT', accessType: component.PERMISSION.read };
    expect(component.getpermissionValue(perm)).toBe('userProfile.roleEdit.readonly');
  });

  it('should get permission value for readingAndWriting', () => {
    const perm: PermissionAssignmentModel = { id: 2, name: 'EDIT', accessType: component.PERMISSION.write };
    expect(component.getpermissionValue(perm)).toBe('userProfile.roleEdit.readingAndWriting');
  });

  it('should disconnect resizeObserver on ngOnDestroy', () => {
    component['resizeObserver'] = jasmine.createSpyObj('ResizeObserver', ['disconnect']);
    component.ngOnDestroy();
    expect(component['resizeObserver'].disconnect).toHaveBeenCalled();
  });

  it('should call table.rowDetail.toggleExpandRow on toggleExpandRow', () => {
    component.table = {
      rowDetail: { toggleExpandRow: jasmine.createSpy('toggleExpandRow') }
    } as unknown as typeof component.table;
    const row = { id: 1 } as RoleModel;
    component.toggleExpandRow(row);
    expect(component.table.rowDetail.toggleExpandRow).toHaveBeenCalledWith(row);
  });

  it('should call UtilityProfile.checkAccessProfile in hasAccess', () => {
    // Mock del form group richiesto
    signalSetFn(
      component.roleFilterFg[SIGNAL],
      new FormBuilder().group({
        filterType: [''],
        filterValue: [''],
        permissionValue: ['']
      })
    );
    component.ngOnInit();

    // Spy sulla funzione reale importata
    const spy = spyOn(UtilityProfile, 'checkAccessProfile').and.returnValue(true);

    const result = component.hasAccess('profile', 'func', 'perm');
    expect(spy).toHaveBeenCalledWith(jasmine.any(Object), 'profile', 'func', 'perm');
    expect(result).toBe(true);
  });
});
