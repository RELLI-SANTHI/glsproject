/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministrativeRelationsComponent } from './administrative-relations.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

// Mock CorporateGroupService
import { CorporateGroupService } from '../../../../../../api/glsUserApi/services';
import { CorporateGroupModel, UserDetailsModel } from '../../../../../../api/glsUserApi/models';
// Mock GenericService
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { UserProfileService } from '../../../../../../common/utilities/services/profile/user-profile.service';

class MockCorporateGroupService {
  getApiCorporategroupV1$Json = jasmine.createSpy().and.returnValue(
    of([
      { id: 1, corporateName: 'GLS Italy SPA' },
      { id: 2, corporateName: 'MEREGHETTI SPA' }
    ] as CorporateGroupModel[])
  );
}

class MockGenericService {
  manageError = jasmine.createSpy();
}

describe('AdministrativeRelationsComponent', () => {
  let component: AdministrativeRelationsComponent;
  let fixture: ComponentFixture<AdministrativeRelationsComponent>;
  let mockCorporateGroupService: MockCorporateGroupService;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;

  beforeEach(async () => {
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', ['getLoggedUser']);
    mockUserProfileService.getLoggedUser.and.returnValue(of({} as UserDetailsModel));

    await TestBed.configureTestingModule({
      imports: [AdministrativeRelationsComponent, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: CorporateGroupService, useClass: MockCorporateGroupService },
        { provide: GenericService, useClass: MockGenericService },
        {
          provide: UserProfileService,
          useValue: {
            profile$: of({ name: 'Test User', profile: 'EVA_USER' } as UserDetailsModel),
            impersonatedUser$: of(null),
            clearImpersonation: jasmine.createSpy('clearImpersonation')
          }
        },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdministrativeRelationsComponent);
    component = fixture.componentInstance;

    const fb = TestBed.inject(FormBuilder);
    fixture.componentRef.setInput(
      'adminRelationFg',
      fb.group({
        referenceCorporateGroup: [''],
        typeofRelationshipwithGLS: ['']
      })
    ); // <-- required input
    fixture.componentRef.setInput('parentForm', new FormGroup({}));
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);

    mockCorporateGroupService = TestBed.inject(CorporateGroupService) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch corporate groups on init and populate dropdown options', () => {
    expect(mockCorporateGroupService.getApiCorporategroupV1$Json).toHaveBeenCalled();
    expect(component.corporateGroupList.length).toBe(2);
  });

  it('should call manageError on service error', () => {
    const mockError = new Error('API failed');
    const genericService = TestBed.inject(GenericService) as unknown as MockGenericService;
    mockCorporateGroupService.getApiCorporategroupV1$Json.and.returnValue(throwError(() => mockError));
    component.getCorporateGroup();
    expect(genericService.manageError).toHaveBeenCalledWith(mockError);
  });

  it('should return corporate group list on successful retrieveCorporateGroup call', (done) => {
    (component as any).retrieveCorporateGroup().subscribe((result: any[]) => {
      expect(result.length).toBe(2);
      expect(result[0].corporateName).toBe('GLS Italy SPA');
      done();
    });
  });

  it('should return empty array if API returns null or undefined', (done) => {
    mockCorporateGroupService.getApiCorporategroupV1$Json.and.returnValue(of(undefined));
    (component as any).retrieveCorporateGroup().subscribe((result: any[]) => {
      expect(result).toEqual([]);
      done();
    });
  });

  it('should propagate error from retrieveCorporateGroup', (done) => {
    const error = new Error('API failed');
    mockCorporateGroupService.getApiCorporategroupV1$Json.and.returnValue(throwError(() => error));
    (component as any).retrieveCorporateGroup().subscribe({
      next: () => {
        // This should not be called
      },
      error: (err: any) => {
        expect(err).toBe(error);
        done();
      }
    });
  });
});
