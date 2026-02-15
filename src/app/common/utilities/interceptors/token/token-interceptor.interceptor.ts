/* eslint-disable max-lines-per-function */
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, Observable, of, take } from 'rxjs';

import { LoggedUserService } from '../../services/user/logged-user.service';
import { UserDetailsModel } from '../../../../api/glsUserApi/models/user-details-model';
import { UserProfileService } from '../../services/profile/user-profile.service';
import { Utility } from '../../utility';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthorizationErrorModalComponent } from '../../../components/authorization-error-modal/authorization-error-modal.component';
import { SpinnerStatusService } from '../../services/spinner/spinner.service';
import { UtilityRouting } from '../../utility-routing';
import { X_PERMISSION, X_PERMISSION_TYPE } from '../../constants/profile';
import { MODAL_MD } from '../../constants/modal-options';
import { GenericService } from '../../services/generic.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  modalRef: NgbModalRef | undefined;
  private readonly http = inject(HttpClient);

  constructor(
    private loggedUserService: LoggedUserService,
    private userProfileService: UserProfileService,
    public modalService: NgbModal,
    protected spinnerService: SpinnerStatusService,
    private genericService: GenericService
  ) {
    // no content
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.spinnerService.show();
    if (request.url !== 'assets/data/app.config.json' && !request.url.includes('assets')) {
      const permission = request.context.get(X_PERMISSION);
      const permissionType = request.context.get(X_PERMISSION_TYPE);

      this.userProfileService.impersonatedUser$.pipe(take(1)).subscribe((impersonatedUser: UserDetailsModel | null) => {
        if (impersonatedUser && impersonatedUser.entraId) {
          // If an impersonated user is set, add the impersonation header
          request = request.clone({
            setHeaders: {
              'X-Impersonated-User': impersonatedUser.entraId.toString(),
              'X-Permission': permission || '',
              'X-Permission-Type': permissionType || ''
            }
          });
        }
      });
      request = request.clone({
        setHeaders: {
          // ...request.headers.keys().reduce((acc, key) => ({ ...acc, [key]: request.headers.get(key) }), {}),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'Content-Disposition',
          'X-Permission': permission || '',
          'X-Permission-Type': permissionType || ''
        }
      });
    }

    return next.handle(request).pipe(
      // map((res) => res),
      catchError((err /* , caught*/) => {
        const url = err.url ? err.url : '';
        if (url.includes('/unlock')) {
          // If the error is from the unlock, just propagate it
          throw err;
        }
        if (err.status === 401 || err.status === 403) {
          if (!this.modalRef) {
            this.modalRef = this.modalService.open(AuthorizationErrorModalComponent, MODAL_MD);
            this.modalRef.result.finally(() => {
              this.modalRef = undefined;
            });
            if (this.modalRef?.componentInstance) {
              this.modalRef.componentInstance.errorCode = err.status;
            }
            this.modalRef.result.then((result: string) => {
              if (result) {
                UtilityRouting.navigateToHome();
              }
            });
          }
          this.spinnerService.hide();

          return of(err);
        }

        if (err.status === 201) {
          this.userProfileService.getLoggedUser().subscribe({
            next: (res: UserDetailsModel) => {
              this.loggedUserService.update(res);
              UtilityRouting.navigateToHome();
            },
            error: (err) => {
              Utility.logErrorForDevEnvironment(err);
            }
          });

          return of(err);
        } else if (err.status === 400 || err.status === 500 || err.status === 502 || err.status === 503) {
          this.genericService.manageError(err);

          return of(err);
        }

        throw err;
      }),
      finalize(() => {
        setTimeout(() => {
          this.spinnerService.hide();
        }, 500);
      })
    );
  }
}
