import { Component, input } from '@angular/core';

@Component({
  selector: 'gls-title-budge-template',
  standalone: true,
  imports: [],
  templateUrl: './gls-title-budge-template.component.html',
  styleUrl: './gls-title-budge-template.component.scss'
})
export class GlsTitleBudgeTemplateComponent {
  src = input.required<string>();
  templateName = input.required<string>();
}
