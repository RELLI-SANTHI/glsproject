import { Component, inject, OnInit } from '@angular/core';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormFooterComponent } from '../../../../common/components/form-footer/form-footer.component';
import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { CorporateGroupService } from '../../../../api/glsUserApi/services';
import { HttpErrorResponse } from '@angular/common/http';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { PostApiCorporategroupV1$Json$Params } from '../../../../api/glsUserApi/fn/corporate-group/post-api-corporategroup-v-1-json';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

@Component({
  selector: 'app-company-group-create',
  standalone: true,
  imports: [GlsInputComponent, ReactiveFormsModule, TranslateModule, FormFooterComponent, ContentHeaderComponent],
  templateUrl: './company-group-create.component.html',
  styleUrl: './company-group-create.component.scss'
})
export class CompanyGroupCreateComponent implements OnInit {
  companyGroupNameFg!: FormGroup;
  private readonly corporateGroupService = inject(CorporateGroupService);
  private readonly genericService = inject(GenericService);

  constructor(
    private fb: FormBuilder,
    protected messageStatusService: MessageStatusService
  ) {}

  /**
   * ngOnInit lifecycle hook for the CompanyGroupCreateComponent.
   * This method is called after the component has been initialized.
   */
  ngOnInit() {
    this.companyGroupNameFg = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  /**
   * Navigates the user to the company list page.
   * This method is triggered when the user clicks the "Exit" button.
   */
  goToExit() {
    UtilityRouting.navigateToCompanyList();
  }

  /**
   * Handles the confirmation of the company group creation.
   * Currently, it navigates the user to the company list page after confirmation.
   */
  corporateGroupCreate() {
    const params: PostApiCorporategroupV1$Json$Params = {
      body: {
        corporateName: this.companyGroupNameFg.get('name')?.value
      }
    };
    this.corporateGroupService.postApiCorporategroupV1$Json(params).subscribe({
      next: () => {
        this.messageStatusService.show('message.corporateGroup.create.success');
        UtilityRouting.navigateToCompanyList();
      },
      error: (error: HttpErrorResponse) => {
        this.genericService.manageError(error);
      }
    });
  }
}
