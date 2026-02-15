/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailComponent } from './user-detail.component';
import { TranslateModule } from '@ngx-translate/core';
import { MsalService } from '@azure/msal-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PROFILE } from '../../utilities/constants/profile';
import { of } from 'rxjs';
import { UserDetailsModel } from '../../../api/glsUserApi/models';

// eslint-disable-next-line max-lines-per-function
describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let userProfileService: any;

  beforeEach(async () => {
    userProfileService = {
      impersonatedUser$: of({ name: 'Test', profile: 'EVA_USER' } as UserDetailsModel)
    };
    await TestBed.configureTestingModule({
      imports: [UserDetailComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [{ provide: MsalService, useValue: jasmine.createSpyObj('MsalService', ['logoutRedirect']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should return "--" when user is null', () => {
    const result = component.getProfileValue(null);
    expect(result).toBe('--');
  });

  it('should return "--" when user.profile is undefined', () => {
    const user = { profile: undefined };
    const result = component.getProfileValue(user);
    expect(result).toBe('--');
  });

  it('should return "Admin" when user.profile is EVA_ADMIN', () => {
    const user = { profile: PROFILE.EVA_ADMIN };
    const result = component.getProfileValue(user);
    expect(result).toBe('Admin');
  });

  it('should return "Field" when user.profile is EVA_FIELD', () => {
    const user = { profile: PROFILE.EVA_FIELD };
    const result = component.getProfileValue(user);
    expect(result).toBe('Field');
  });

  it('should return "User" when user.profile is EVA_USER', () => {
    const user = { profile: PROFILE.EVA_USER };
    const result = component.getProfileValue(user);
    expect(result).toBe('User');
  });

  it('should return "--" when user.profile is unrecognized', () => {
    const user = { profile: 'UNKNOWN_PROFILE' };
    const result = component.getProfileValue(user);
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
});
