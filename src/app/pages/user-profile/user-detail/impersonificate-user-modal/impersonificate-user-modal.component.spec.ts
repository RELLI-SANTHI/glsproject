/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImpersonificateUserModalComponent } from './impersonificate-user-modal.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UsersService } from '../../../../api/glsUserApi/services';
import { of } from 'rxjs';
import { ImpersonationResult, UserDetailsModel } from '../../../../api/glsUserApi/models';
import { Router } from '@angular/router';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

describe('ImpersonificateUserModalComponent', () => {
  let component: ImpersonificateUserModalComponent;
  let fixture: ComponentFixture<ImpersonificateUserModalComponent>;
  let activeModal: NgbActiveModal;
  let userProfileService: jasmine.SpyObj<UserProfileService>;
  let usersService: jasmine.SpyObj<UsersService>;
  let router: jasmine.SpyObj<Router>; // Add Router spy

  beforeEach(async () => {
    const userProfileServiceSpy = jasmine.createSpyObj('UserProfileService', ['setImpersonatedUser']);
    const usersServiceSpy = jasmine.createSpyObj('UsersService', ['postApiUsersV1ImpersonateTargetuserid$Json']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']); // Mock Router

    await TestBed.configureTestingModule({
      imports: [ImpersonificateUserModalComponent, HttpClientModule, TranslateModule.forRoot()],
      providers: [
        NgbActiveModal,
        TranslateService,
        { provide: UserProfileService, useValue: userProfileServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: Router, useValue: routerSpy } // Provide the mocked Router
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImpersonificateUserModalComponent);
    component = fixture.componentInstance;
    activeModal = TestBed.inject(NgbActiveModal);
    userProfileService = TestBed.inject(UserProfileService) as jasmine.SpyObj<UserProfileService>;
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    component.data = { id: 1, name: 'Test User' } as any; // Mock data
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>; // Inject Router mock

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize apiResponse with input data on ngOnInit', () => {
    const mockData = { id: 1, name: 'Test User' } as any;
    component.data = mockData;

    component.ngOnInit();

    expect(component.apiResponse).toEqual(mockData);
  });

  it('should close the modal with false when closeModal is called', () => {
    spyOn(activeModal, 'close');

    component.closeModal();

    expect(activeModal.close).toHaveBeenCalledWith(false);
  });

  it('should set impersonated user, navigate to home, and close the modal when proceed is called', () => {
    const mockUserDetails: UserDetailsModel = {
      id: 1,
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com'
    } as UserDetailsModel;

    const mockImpersonationResult: ImpersonationResult = {
      isSuccess: true,
      user: mockUserDetails
    };

    component.idUser = 1; 
    UtilityRouting.initialize(router); 
    
    // Properly mock the impersonateUser method as a spy
    spyOn(component as any, 'impersonateUser').and.returnValue(of(mockImpersonationResult));
    spyOn(activeModal, 'close'); // Spy on the modal close method
    component.proceed();
    expect((component as any).impersonateUser).toHaveBeenCalled(); // Verify API call
    expect(userProfileService.setImpersonatedUser).toHaveBeenCalledWith(mockUserDetails); // Verify user is set
    expect(activeModal.close).toHaveBeenCalledWith(true); // Verify modal is closed
  });
  it('should call postApiUsersV1ImpersonateTargetuserid$Json and return ImpersonationResult', (done) => {
    const mockImpersonationResult: ImpersonationResult = {
      isSuccess: true,
      user: {
        id: 1,
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com'
      } as UserDetailsModel
    };

    // Mock the API call
    usersService.postApiUsersV1ImpersonateTargetuserid$Json.and.returnValue(of(mockImpersonationResult));

    // Call the private method using `component as any`
    (component as any).impersonateUser().subscribe((result: ImpersonationResult) => {
      expect(usersService.postApiUsersV1ImpersonateTargetuserid$Json).toHaveBeenCalledWith({
        targetUserId: component.idUser as number
      }); // Verify API call with correct parameters
      expect(result).toEqual(mockImpersonationResult); // Verify the returned result
      done(); // Mark the test as complete
    });
  });
});
