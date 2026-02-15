/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { UserDetailsModel } from '../../api/glsUserApi/models/user-details-model';
import { UserProfileService } from '../../common/utilities/services/profile/user-profile.service';
import { UtilityProfile } from '../../common/utilities/utility-profile';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let userProfileServiceSpy: jasmine.SpyObj<UserProfileService>;

  beforeEach(async () => {
    userProfileServiceSpy = jasmine.createSpyObj('UserProfileService', [], {
      profile$: of({ name: 'Mario', surname: 'Rossi' } as UserDetailsModel),
      impersonatedUser$: of(null)
    });

    spyOn(UtilityProfile, 'checkAccessProfile').and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: UserProfileService,
          useValue: userProfileServiceSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set userEnabled to true if it has access', () => {
    expect(component.userEnabled()).toBeTrue();
  });

  it('should set userName if profile is present', () => {
    expect(component.userName()).toBe('Mario Rossi');
  });

  it('should set imageUrl to default if it has access', () => {
    expect(component.imageUrl()).toBe('assets/img/transparent/PNG-GLS_user.png');
  });

  it('should set imageUrl to access denied if it has no access', () => {
    (UtilityProfile.checkAccessProfile as jasmine.Spy).and.returnValue(false);

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.userEnabled()).toBeFalse();
    expect(component.imageUrl()).toBe('assets/img/transparent/PNG-GLS_AccessDenied.png');
  });

  it('should set userName if impersonatedUser is present', async () => {
    // Arrange: create a new spy with both profile$ and impersonatedUser$
    const newUserProfileServiceSpy = jasmine.createSpyObj('UserProfileService', [], {
      profile$: of({ name: 'Mario', surname: 'Rossi' } as UserDetailsModel),
      impersonatedUser$: of({ name: 'Stefano', surname: 'Cerroni' } as UserDetailsModel)
    });

    // Reconfigure the provider before creating the component
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [HomeComponent, TranslateModule.forRoot()],
        providers: [
          {
            provide: UserProfileService,
            useValue: newUserProfileServiceSpy
          }
          // Add any other providers you need here
        ]
      })
      .compileComponents();

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.userName()).toBe('Stefano Cerroni');
  });
});
