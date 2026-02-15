import { Component, Input, input, OnChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlsInputDataComponent } from '../../../../../../common/form/gls-input-data/gls-input-date.component';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { Utility } from '../../../../../../common/utilities/utility';

@Component({
  selector: 'app-end-activity',
  standalone: true,
  imports: [GlsInputDataComponent, ReactiveFormsModule, TranslatePipe, CommonModule, GlsInputComponent],
  templateUrl: './end-activity.component.html',
  styleUrl: './end-activity.component.scss'
})
export class EndActivityComponent implements OnChanges {
  parentForm = input.required<FormGroup>();
  activityEndDateFg = input.required<FormGroup>();
  isWriting = input.required<boolean>();
  @Input() companyData: CompanyDetailResponse | null = null;
  isEditMode = false;
  isDraft = input.required<boolean>();

  /**
   * Responds to changes in the component's inputs.
   * This method is called when any input properties change.
   */
  ngOnChanges(): void {
    this.isEditMode = this.companyData !== null;
    if (this.activityEndDateFg()?.get('activityEndDate')) {
      if (this.isEditMode) {
        const endDate = this.activityEndDateFg()?.get('activityEndDate')?.value;
        if (this.isWriting() && endDate) {
          this.activityEndDateFg()?.get('activityEndDate')?.setValue(Utility.fromIsoStringToDatepicker(endDate));
        }
        this.activityEndDateFg().get('activityEndDate')?.enable({ emitEvent: false });
      } else {
        this.activityEndDateFg().get('activityEndDate')?.disable({ emitEvent: false });
      }
    }
  }
}
