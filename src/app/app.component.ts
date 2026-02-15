import { Component, effect, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbDropdownModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgClass } from '@angular/common';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

import { GlsNavbarComponent } from './common/components/gls-navbar/gls-navbar.component';
import { GlsTopMenuComponent } from './common/components/gls-top-menu/gls-top-menu.component';
import { ILanguageOption } from './common/models/language-option-interface';
import { SpinnerStatusService } from './common/utilities/services/spinner/spinner.service';
import { GenericService } from './common/utilities/services/generic.service';
import { SidebarContentComponent } from './common/components/sidebar-content/sidebar-content.component';
import { VIEW_MODE } from './common/app.constants';
import { LoggedUserService } from './common/utilities/services/user/logged-user.service';
import { GlsTopBannerComponent } from './common/components/gls-top-banner/gls-top-banner.component';
import { UserDetailsModel } from './api/glsUserApi/models/user-details-model';
import { UserProfileService } from './common/utilities/services/profile/user-profile.service';
import { ConfirmationDialogData } from './common/models/confirmation-dialog-interface';
import {
  ConfirmationDialogComponent
} from './common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { USER_STATUS } from './common/utilities/constants/profile';
import {
  AuthorizationErrorModalComponent
} from './common/components/authorization-error-modal/authorization-error-modal.component';
import { UtilityRouting } from './common/utilities/utility-routing';
import { MODAL_MD } from './common/utilities/constants/modal-options';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslateModule,
    NgbDropdownModule,
    GlsNavbarComponent,
    GlsTopMenuComponent,
    SidebarContentComponent,
    NgClass,
    GlsTopBannerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gls-eva-frontend';
  isShowNavBar = true;
  isSmallMobile = signal(false);
  isTablet = signal(false);
  showNavBar = signal(false);
  pageSelected = signal('');
  @ViewChild(SidebarContentComponent) sidebarContentComponent!: SidebarContentComponent;
  languageOptions: ILanguageOption[] = [];
  loginDisplay = false;
  // modal
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  loadUserProfile = false;
  protected readonly genericService = inject(GenericService);
  private readonly availableLanguages = ['en', 'it'];
  private readonly router = inject(Router);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private resizeTimeout: any;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    protected spinnerService: SpinnerStatusService,
    private authService: MsalService,
    private userProfileService: UserProfileService,
    private loggedUserService: LoggedUserService,
    public modalService: NgbModal
  ) {
    effect(() => {
      this.setDynamicHeight(this.genericService.resizeMainPage());
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.checkDevice();
    }, 200);
  }

  // eslint-disable-next-line max-lines-per-function
  ngOnInit() {
    this.userProfileService.impersonatedUser$.subscribe((user) => {
      this.genericService.isUserImpressed.set(!!user);
      this.genericService.resizeMainPage.update(() => this.genericService.defaultValue());
      if (user) {
        this.sidebarContentComponent.goToPage('home');
      }
    });
    UtilityRouting.initialize(this.router);
    // Subscribing to handleRedirectObservable before any other functions both initializes the application and ensures redirects are handled
    this.authService.handleRedirectObservable().subscribe();
    this.loggedUserService.accessToken$.subscribe((user) => (this.loginDisplay = !!user));

    // this.translateService.use(this.currentLang.code);
    this.translateService.setDefaultLang('it');
    this.translateService.currentLang = this.translateService.defaultLang;
    this.buildLanguageOptions();
    this.checkDevice();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.pageSelected.set(event.urlAfterRedirects.split('/')[1]);
    });

    this.authService
      .handleRedirectObservable()
      .pipe(
        // Only continue if authentication is successful
        filter(() => this.authService.instance?.getAllAccounts().length > 0),
        // Switch to the user details request if authentication was successful
        switchMap(() => this.userProfileService.getLoggedUser()),
        // Handle errors from the user details request
        catchError((err) => {
          const errorMessage = 'serviceMessage.' + (err.error?.innerException?.internalCode || 'genericError');
          const additionalData = err.error?.innerException?.additionalData;
          this.userProfileService.openErrorModal('attention', errorMessage, additionalData);

          return throwError(() => err); // Re-throw to propagate to the main error handler
        })
      )
      .subscribe({
        next: (res: UserDetailsModel) => {
          this.userProfileService.update(res);
          this.loadUserProfile = true;
        },
        error: (err) => this.genericService.manageError(err)
      });

    this.loggedUserService.accessToken$.subscribe((user) => (this.loginDisplay = !!user));
    this.userProfileService.profile$.subscribe((user: UserDetailsModel | null) => {
      if (user && user.status === USER_STATUS.wip) {
        if (!this.modalRef) {
          this.modalRef = this.modalService.open(AuthorizationErrorModalComponent, MODAL_MD);
          this.modalRef.result.then((result: string) => {
            if (result) {
              UtilityRouting.relocateToHome();
            }
          });
        }
      }
    });
  }

  // Log the user out
  logout() {
    this.authService.logoutRedirect();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  /**
   * Opens an error modal with the specified title and error message.
   *
   * @param title - The title of the modal.
   * @param errorMessage - The error message to display.
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

  /**
   * Builds the list of available language options for the application.
   * Uses the translation service to fetch localized labels for each language.
   */
  buildLanguageOptions(): void {
    this.languageOptions = this.availableLanguages.map((key) => ({
      value: key,
      label: this.translateService.instant(key)
    }));
  }

  /**
   * Toggles the visibility of the sidebar.
   * Updates the `showNavBar` signal to reflect the new state.
   */
  toggleSidebar(): void {
    this.showNavBar.set(!this.showNavBar());
  }

  /**
   * Toggles the visibility of the navigation bar.
   * Updates the `isShowNavBar` state and notifies the generic service.
   */
  setShowNavBar(): void {
    this.isShowNavBar = !this.isShowNavBar;
    this.genericService.sidebarOpened.set(!this.isShowNavBar);
  }

  /**
   * Dynamically sets the height of the application.
   * Updates a CSS variable (`--dynamic-height`) with the provided height value.
   * @param height - The height value to set.
   */
  private setDynamicHeight(height: string): void {
    document.documentElement.style.setProperty('--dynamic-height', height);
  }

  /**
   * Checks the current device type based on screen width and height.
   * Updates the view mode and signals (`isSmallMobile`, `isTablet`) accordingly.
   */
  private checkDevice(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.genericService.isLandscape.set(width > height);

    if (width <= 768) {
      // Dispositivo mobile
      this.genericService.viewMode.set(VIEW_MODE.MOBILE);
      this.isSmallMobile.set(true);
      this.isTablet.set(false);
    } else if (width >= 768 && width <= 1024 && height < width) {
      // Tablet in modalità orizzontale
      this.genericService.viewMode.set(VIEW_MODE.TABLET);
      this.isSmallMobile.set(false);
      this.isTablet.set(true);
    } else if (width >= 768 && width <= 1024 && height > width) {
      // Tablet in modalità orizzontale o cellulare stretto e lungo ruotato
      this.genericService.viewMode.set(VIEW_MODE.TABLET);
      this.isSmallMobile.set(false);
      this.isTablet.set(true);
    } else {
      this.genericService.viewMode.set(VIEW_MODE.DESKTOP);
      this.isSmallMobile.set(false);
      this.isTablet.set(false);
    }
  }
}
