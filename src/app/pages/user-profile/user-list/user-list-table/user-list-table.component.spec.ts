/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListTableComponent } from './user-list-table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserSearchResponseModel } from '../../../../api/glsUserApi/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { UsersService } from '../../../../api/glsUserApi/services';
import { of } from 'rxjs';
import { PROFILE } from '../../../../common/utilities/constants/profile';

describe('UserListTableComponent', () => {
  let component: UserListTableComponent;
  let fixture: ComponentFixture<UserListTableComponent>;
  let router: Router;
  let translate: TranslateService;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const usersServiceSpy = jasmine.createSpyObj('UsersService', [
      'getApiUsersV1Id$Json',
      'postApiUsersV1IdLock$Response',
      'postApiUsersV1IdUnlock$Response',
      'patchApiUsersV1IdStatus',
      'patchApiUsersV1IdAssociations$Json'
    ]);
    usersServiceSpy.postApiUsersV1IdLock$Response.and.returnValue(of({ status: 204}));
    usersServiceSpy.postApiUsersV1IdUnlock$Response.and.returnValue(of({ status: 204 }));

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), UserListTableComponent, HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: routerSpy
        },
        { provide: UsersService, useValue: usersServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListTableComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    translate = TestBed.inject(TranslateService);
    UtilityRouting.initialize(router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get column translation code', () => {
    expect(component.getColumnTranslationCode('NameSurname')).toContain('userProfile.userList.columnList.NameSurname');
    expect(component.getColumnTranslationCode(undefined)).toContain('userProfile.userList.columnList.all');
  });

  it('should get status translation code', () => {
    expect(component.getStatusTranslationCode('ACTIVE')).toBe('userProfile.userList.state.active');
    expect(component.getStatusTranslationCode('DISABLED')).toBe('userProfile.userList.state.disabled');
    expect(component.getStatusTranslationCode('WIP')).toBe('userProfile.userList.state.wip');
    expect(component.getStatusTranslationCode('OTHER')).toBe('OTHER');
  });

  it('should get translated label and truncate if needed', () => {
    const spy = spyOn(translate, 'instant').and.callFake((label: string) => label.repeat(10));
    const longLabel = 'label';
    expect(component.getTranslatedLabel(longLabel)).toBe(longLabel.repeat(10).slice(0, 30));
    spy.and.callFake((label: string) => label);
    expect(component.getTranslatedLabel('short')).toBe('short');
  });

  it('should show row type', () => {
    expect(component.showRowType('State')).toBe('State');
    expect(component.showRowType('NameSurname')).toBe('link');
    expect(component.showRowType('Email')).toBe('Email');
    expect(component.showRowType('Action')).toBe('Action');
    expect(component.showRowType('corporateGroupName')).toBe('CorporateGroup');
    expect(component.showRowType('Profile')).toBe('Profile');
    expect(component.showRowType('Other')).toBe('string');
  });

  it('should get status icon', () => {
    expect(component.getStatusIcon({ status: 'ACTIVE' } as UserSearchResponseModel)).toContain('active.svg');
    expect(component.getStatusIcon({ status: 'DISABLED' } as UserSearchResponseModel)).toContain('inactive.svg');
    expect(component.getStatusIcon({ status: 'WIP' } as UserSearchResponseModel)).toContain('wip.svg');
    expect(component.getStatusIcon({ status: 'OTHER' } as UserSearchResponseModel)).toBe('');
  });

  it('should get status', () => {
    expect(component.getStatus({ status: 'ACTIVE' } as UserSearchResponseModel)).toBe('ACTIVE');
    expect(component.getStatus({ status: 'DISABLED' } as UserSearchResponseModel)).toBe('DISABLED');
    expect(component.getStatus({ status: 'WIP' } as UserSearchResponseModel)).toBe('WIP');
  });

  it('should get state class', () => {
    expect(component.getStateClass({ status: 'ACTIVE' } as UserSearchResponseModel)).toBe('text-success');
    expect(component.getStateClass({ status: 'DISABLED' } as UserSearchResponseModel)).toBe('text-disabled');
    expect(component.getStateClass({ status: 'WIP' } as UserSearchResponseModel)).toBe('disabled');
    expect(component.getStateClass({ status: 'OTHER' } as UserSearchResponseModel)).toBe('');
  });

  it('should get states label', () => {
    expect(component.getStatesLabel({ status: 'ACTIVE' } as UserSearchResponseModel)).toBe('userProfile.userList.state.active');
    expect(component.getStatesLabel({ status: 'DISABLED' } as UserSearchResponseModel)).toBe('userProfile.userList.state.disabled');
    expect(component.getStatesLabel({ status: 'WIP' } as UserSearchResponseModel)).toBe('userProfile.userList.state.wip');
  });

  it('should get link value', () => {
    expect(component.getLinkValue({ name: 'John' } as UserSearchResponseModel)).toBe('John');
    expect(component.getLinkValue({} as UserSearchResponseModel)).toBe('--');
  });

  it('should get action label', () => {
    expect(component.getActionLabel({ status: 'ACTIVE' } as UserSearchResponseModel)).toBe('-');
    expect(component.getActionLabel({ status: 'DISABLED' } as UserSearchResponseModel)).toBe('-');
    expect(component.getActionLabel({ status: 'WIP' } as UserSearchResponseModel)).toBe('userProfile.userList.action.wip');
    expect(component.getActionLabel({ status: 'OTHER' } as UserSearchResponseModel)).toBe('');
  });

  it('should get action icon', () => {
    expect(component.getActionIcon({ status: 'ACTIVE' } as UserSearchResponseModel)).toBe('bi-person-badge');
    expect(component.getActionIcon({ status: 'DISABLED' } as UserSearchResponseModel)).toBe('bi-power');
    expect(component.getActionIcon({ status: 'WIP' } as UserSearchResponseModel)).toBe('bi-person-badge');
    expect(component.getActionIcon({ status: 'OTHER' } as UserSearchResponseModel)).toBe('');
  });

  it('should get email value', () => {
    expect(component.getEmailValue({ email: 'john@example.com' } as UserSearchResponseModel)).toBe('john@example.com');
    expect(component.getEmailValue({} as UserSearchResponseModel)).toBe('--');
  });

  it('should get corporate group', () => {
    expect(component.getCorporateGroup({ corporateGroupName: 'GroupA' } as UserSearchResponseModel)).toBe('GroupA');
    expect(component.getCorporateGroup({} as UserSearchResponseModel)).toBe('--');
  });

  it('should navigate to user detail', () => {
    component.goToUserDetail(123);
    expect(router.navigate).toHaveBeenCalledWith(['/user-profile/user-detail', '123']);
  });

  it('should navigate to user edit', () => {
    const navigateSpy = spyOn(UtilityRouting, 'navigateToUserEditByUserId').and.callThrough();
    component.goToUserEdit(456);
    expect(navigateSpy).toHaveBeenCalledWith('456');
  });

  it('should handle ngAfterViewInit and ngOnDestroy', () => {
    // Mock viewChilds as objects with a 'nativeElement' property, not as functions
    const recalcSpy = jasmine.createSpy('recalculate');
    const observeSpy = jasmine.createSpy('observe');
    const disconnectSpy = jasmine.createSpy('disconnect');
    component['table'] = {
      value: {
        recalculate: recalcSpy,
        scrollbarHelper: null,
        cd: null,
        columnChangesService: null,
        configuration: null
      },
      set: jasmine.createSpy('set'),
      update: jasmine.createSpy('update'),
      asReadonly: jasmine.createSpy('asReadonly'),
      subscribe: jasmine.createSpy('subscribe')
    } as any;
    // Fix: datatableWrapper should be an object with a 'nativeElement', not a function
    (window as any).ResizeObserver = function () {
      this.observe = observeSpy;
      this.disconnect = disconnectSpy;
    };
    component.ngAfterViewInit();
    expect(observeSpy).toHaveBeenCalled();
    component.ngOnDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should calculate the first result index for the current page', () => {
    // Arrange
    spyOn(component, 'currentPage').and.returnValue(2); // Mock currentPage as a function returning 2
    spyOn(component, 'pageSize').and.returnValue(10); // Mock pageSize as a function returning 10

    // Act
    const result = component.getFirstResult();

    // Assert
    expect(result).toBe(11); // (2 - 1) * 10 + 1 = 11
  });

  it('should calculate the last result index for the current page', () => {
    // Arrange
    spyOn(component, 'currentPage').and.returnValue(2); // Mock currentPage as a function returning 2
    spyOn(component, 'pageSize').and.returnValue(10); // Mock pageSize as a function returning 10
    spyOn(component, 'totalItems').and.returnValue(25); // Mock totalItems as a function returning 25

    // Act
    const result = component.getLastResult();

    // Assert
    expect(result).toBe(20); // Math.min(2 * 10, 25) = 20
  });

  it('should emit filterByAcronym event when filterByAcronymEmit is called', () => {
    spyOn(component.filterByAcronym, 'emit');

    component.filterByAcronymEmit();

    expect(component.filterByAcronym.emit).toHaveBeenCalled();
  });

  it('should return columnVisible for showColumn if column exists', () => {
    // Arrange
    const columnsMock = [
      { field: 'name', columnVisible: true },
      { field: 'email', columnVisible: false }
    ];
    spyOn(component, 'columns').and.returnValue(columnsMock as any);

    // Act & Assert
    expect(component.showColumn('name')).toBeTrue();
    expect(component.showColumn('email')).toBeFalse();
    expect(component.showColumn('notfound')).toBeFalse();
  });

  it('should return correct profile label for isUserProfile', () => {
    expect(component.isUserProfile({ profile: PROFILE.EVA_ADMIN } as any)).toBe('Admin');
    expect(component.isUserProfile({ profile: PROFILE.EVA_FIELD } as any)).toBe('Field');
    expect(component.isUserProfile({ profile: PROFILE.EVA_USER } as any)).toBe('User');
    expect(component.isUserProfile({ profile: 'SOMETHING_ELSE' } as any)).toBe('--');
    expect(component.isUserProfile({} as any)).toBe('--');
  });

  it('should return correct profile value for getProfileValue', () => {
    expect(component.getProfileValue({ profile: 'EVA_ADMIN' } as any)).toBe('EVA_ADMIN');
    expect(component.getProfileValue({ profile: 'EVA_FIELD' } as any)).toBe('EVA_FIELD');
    expect(component.getProfileValue({ profile: 'EVA_USER' } as any)).toBe('EVA_USER');
    expect(component.getProfileValue({} as any)).toBeNull();
    expect(component.getProfileValue(null as any)).toBeNull();
  });
});
