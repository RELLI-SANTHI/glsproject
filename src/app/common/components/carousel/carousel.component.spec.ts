import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarouselComponent } from './carousel.component';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { VIEW_MODE } from '../../app.constants';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { GenericService } from '../../utilities/services/generic.service';
import { UserProfileService } from '../../utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../api/glsUserApi/models/user-details-model';

// eslint-disable-next-line max-lines-per-function
describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;

  const activatedRoute = {
    snapshot: {
      paramMap: { get: () => 'mock-param' }
    },
    queryParams: of({})
  };

  beforeEach(async () => {
    mockGenericService = jasmine.createSpyObj('GenericService', ['viewMode']);
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', ['getLoggedUser'], {
      profile$: of({} as UserDetailsModel),
      impersonatedUser$: of(null)
    });

    mockGenericService.viewMode.and.returnValue(VIEW_MODE.DESKTOP);
    mockUserProfileService.getLoggedUser.and.returnValue(of({} as UserDetailsModel));

    await TestBed.configureTestingModule({
      imports: [CarouselComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: GenericService, useValue: mockGenericService },
        { provide: UserProfileService, useValue: mockUserProfileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    signalSetFn(component.listCarousel[SIGNAL], []);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set typeViewMode on init', () => {
    mockGenericService.viewMode.and.returnValue(VIEW_MODE.MOBILE);
    component.ngOnInit();
    expect(component.typeViewMode).toBe(VIEW_MODE.MOBILE);
  });

  it('should return correct slide ID', () => {
    expect(component.getSlideID(3)).toBe('ngb-slide-3');
  });

  it('should return true if activeId matches slide ID', () => {
    expect(component.getActivePointer('ngb-slide-2', 2)).toBeTrue();
  });

  it('should return false if activeId does not match slide ID', () => {
    expect(component.getActivePointer('ngb-slide-1', 2)).toBeFalse();
  });

  it('should return true for isDesktop if typeViewMode is DESKTOP', () => {
    component.typeViewMode = VIEW_MODE.DESKTOP;
    expect(component.isDesktop).toBeTrue();
  });

  it('should call carousel.select with correct slide ID', () => {
    const mockCarousel = jasmine.createSpyObj('NgbCarousel', ['select']);
    component.carousel = mockCarousel;
    component.goToSlide(1);
    expect(mockCarousel.select).toHaveBeenCalledWith('ngb-slide-1');
  });
});
