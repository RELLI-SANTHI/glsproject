/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlsTopBannerComponent } from './gls-top-banner.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserDetailsModel } from '../../../api/glsUserApi/models';
import { of } from 'rxjs';
import { UserProfileService } from '../../utilities/services/profile/user-profile.service';
import { UtilityRouting } from '../../utilities/utility-routing';

describe('GlsTopBannerComponent', () => {
  let component: GlsTopBannerComponent;
  let fixture: ComponentFixture<GlsTopBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsTopBannerComponent, HttpClientTestingModule],
      providers: [
        {
          provide: UserProfileService,
          useValue: {
            profile$: of({ name: 'Test User', profile: 'EVA_USER' } as UserDetailsModel),
            impersonatedUser$: of(null),
            clearImpersonation: jasmine.createSpy('clearImpersonation')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsTopBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set logedUser when profile$ emits a value', () => {
    expect((component as any).logedUser).toEqual({ name: 'Test User', profile: 'EVA_USER' });
  });

  it('should call clearImpersonation and relocateToHome when stopImpersonating is called', () => {
    // Arrange
    const relocateToHomeSpy = spyOn(UtilityRouting, 'relocateToHome');

    // Act
    component.stopImpersonating();

    // Assert
    expect(component['userProfileService'].clearImpersonation).toHaveBeenCalled();
    expect(relocateToHomeSpy).toHaveBeenCalled();
  });
});
