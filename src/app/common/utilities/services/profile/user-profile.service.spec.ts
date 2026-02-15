/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { UserProfileService } from './user-profile.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { UserDetailsModel } from '../../../../api/glsUserApi/models/user-details-model';
import { UsersService } from '../../../../api/glsUserApi/services/users.service';
import {
  ConfirmationDialogComponent
} from '../../../components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { MODAL_MD } from '../../constants/modal-options';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(() => {
    const usersServiceMock = jasmine.createSpyObj('UsersService', ['getApiUsersV1Jwt$Json']);
    const modalServiceMock = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }
      ]
    });

    service = TestBed.inject(UserProfileService);
    usersServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return profile$ as an observable', (done) => {
    const mockProfile: UserDetailsModel = { id: 1, name: 'Test User' } as UserDetailsModel;
    service.update(mockProfile);

    service.profile$.subscribe((profile) => {
      expect(profile).toEqual(mockProfile);
      done();
    });
  });

  it('should update the profile', () => {
    const mockProfile: UserDetailsModel = { id: 1, name: 'Test User' } as UserDetailsModel;
    service.update(mockProfile);

    service.profile$.subscribe((profile) => {
      expect(profile).toEqual(mockProfile);
    });
  });

  it('should fetch logged user profile', (done) => {
    const mockUser: UserDetailsModel = { id: 1, name: 'Logged User' } as UserDetailsModel;
    usersServiceSpy.getApiUsersV1Jwt$Json.and.returnValue(of(mockUser));

    service.getLoggedUser().subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(usersServiceSpy.getApiUsersV1Jwt$Json).toHaveBeenCalled();
      done();
    });
  });

  it('should open an error modal', () => {
    const mockModalRef = {
      componentInstance: { data: null },
      result: Promise.resolve('Confirmed')
    } as NgbModalRef;

    modalServiceSpy.open.and.returnValue(mockModalRef);

    service.openErrorModal('Error Title', 'Error Message', [{ placeHolder: 'Field', value: 'Value' }]);

    expect(modalServiceSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, MODAL_MD);
    expect(mockModalRef.componentInstance.data).toEqual({
      title: 'Error Title',
      content: 'Error Message',
      additionalData: [{ placeHolder: 'Field', value: 'Value' }],
      showCancel: false,
      confirmText: 'ok'
    });
  });
});
