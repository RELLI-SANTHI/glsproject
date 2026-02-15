import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-information',
  standalone: true,
  imports: [ReactiveFormsModule, GlsInputComponent, TranslateModule],
  templateUrl: './contact-information.component.html',
  styleUrl: './contact-information.component.scss'
})
export class ContactInformationComponent {
  isWriting = input.required<boolean>();
  formContactDetail = input.required<FormGroup>();
  isDraft = input.required<boolean>();
}
