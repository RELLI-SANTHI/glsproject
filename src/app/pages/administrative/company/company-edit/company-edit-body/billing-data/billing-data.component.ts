import { Component, Input, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { TranslatePipe } from '@ngx-translate/core';
import { CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-billing-data',
  standalone: true,
  imports: [GlsInputComponent, ReactiveFormsModule, TranslatePipe, CommonModule],
  templateUrl: './billing-data.component.html',
  styleUrl: './billing-data.component.scss'
})
export class BillingDataComponent {
  billingDataFg = input.required<FormGroup>();
  isWriting = input.required<boolean>();
  isDraft = input.required<boolean>();
  @Input() companyData: CompanyDetailResponse | null = null;
}
