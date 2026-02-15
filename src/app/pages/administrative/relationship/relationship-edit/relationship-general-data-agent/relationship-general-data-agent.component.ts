import { Component, input } from '@angular/core';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-relationship-general-data-agent',
  standalone: true,
  imports: [GlsInputComponent, ReactiveFormsModule, TranslatePipe, DecimalPipe],
  templateUrl: './relationship-general-data-agent.component.html',
  styleUrl: './relationship-general-data-agent.component.scss'
})
export class RelationshipGeneralDataAgentComponent {
  relationshipGeneralDataAgentForm = input.required<FormGroup>();
  isWriting = input<boolean>();
  isFromSubject = input<boolean>();
  isDraft = input.required<boolean>();
}
