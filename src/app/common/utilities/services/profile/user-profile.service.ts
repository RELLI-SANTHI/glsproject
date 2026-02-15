import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { UserDetailsModel } from '../../../../api/glsUserApi/models/user-details-model';
import { UsersService } from '../../../../api/glsUserApi/services/users.service';
import { ConfirmationDialogData } from '../../../models/confirmation-dialog-interface';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { MODAL_MD } from '../../constants/modal-options';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  private _profileSubject = new BehaviorSubject<UserDetailsModel | null>(null);
  private _impersonatedUserSubject = new BehaviorSubject<UserDetailsModel | null>(null);

  constructor(
    private usersService: UsersService,
    private modalService: NgbModal
  ) {
    // no content
  }

  get profile$(): Observable<UserDetailsModel | null> {
    return this._profileSubject.asObservable();
  }

  get impersonatedUser$(): Observable<UserDetailsModel | null> {
    return this._impersonatedUserSubject.asObservable();
  }

  update(profile: UserDetailsModel): void {
    this._profileSubject.next(profile);
  }

  setImpersonatedUser(user: UserDetailsModel): void {
    this._impersonatedUserSubject.next(user);
  }

  clearImpersonation(): void {
    this._impersonatedUserSubject.next(null);
  }

  /**
   * Fetches the logged-in user's profile information using their JWT.
   *
   * Calls the GET /api/Users/v1/jwt endpoint with the user's ID (if available),
   * and returns an observable containing the user's full profile data.
   *
   * @returns Observable<UserDetailsModel> - the user's profile data
   */
  getLoggedUser(): Observable<UserDetailsModel> {
    return this.usersService.getApiUsersV1Jwt$Json()?.pipe(map((res: UserDetailsModel) => res));
  }

  /**
   * Opens an error modal with the provided title, message, and additional data.
   * @param title - The title of the modal.
   * @param errorMessage - The error message to display.
   * @param additionalData - Optional additional data to display in the modal.
   */
  openErrorModal(
    title: string,
    errorMessage: string,
    additionalData?: {
      placeHolder: string;
      value: string | number;
    }[]
  ) {
    this.dialogData = {
      title: title,
      content: errorMessage,
      additionalData,
      showCancel: false,
      confirmText: 'ok'
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        // console.log(`Closed with: ${result}`);
      }
    });
  }
}
