import { Component, Input, input } from '@angular/core';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [GlsInputComponent, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact-info.component.html',
  styleUrl: './contact-info.component.scss'
})
export class ContactInfoComponent {
  // contactInformationForm!: FormGroup;
  parentForm = input.required<FormGroup>();
  contactInformationForm = input.required<FormGroup>();
  isWriting = input.required<boolean>();
  @Input() companyData: CompanyDetailResponse | null = null;
  isDraft = input.required<boolean>();

  constructor(private fb: FormBuilder) {}
}
