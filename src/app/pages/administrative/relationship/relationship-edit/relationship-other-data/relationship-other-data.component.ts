import { Component, input } from '@angular/core';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { GlsInputCheckboxComponent } from '../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { REMINDER_TYPE_LIST } from '../../constants/relationship-constants';
@Component({
  selector: 'app-relationship-other-data',
  standalone: true,
  imports: [GlsInputDropdownComponent, ReactiveFormsModule, TranslatePipe, GlsInputCheckboxComponent],
  templateUrl: './relationship-other-data.component.html',
  styleUrl: './relationship-other-data.component.scss'
})
export class RelationshipOtherDataComponent {
  relationshipOtherDataForm = input.required<FormGroup>();
  isWriting = input<boolean>();
  isFromSubject = input<boolean>();
  isDraft = input.required<boolean>();
  reminderOptions = REMINDER_TYPE_LIST;
}
