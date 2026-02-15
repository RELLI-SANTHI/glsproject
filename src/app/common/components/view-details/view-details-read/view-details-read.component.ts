import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { FieldModel, TemplateFieldModel } from '../../../../api/glsNetworkApi/models';

@Component({
  selector: 'gls-view-details-read',
  standalone: true,
  imports: [TranslatePipe, NgClass],
  templateUrl: './view-details-read.component.html',
  styleUrl: './view-details-read.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewDetailsReadComponent implements OnInit {
  fieldsListInput = input.required<(TemplateFieldModel | FieldModel)[]>();
  buildingAcronymMin = input.required<string>();
  buildingAcronymMax = input.required<string>();
  private subSectionOrder: Record<string, number> = {};

  ngOnInit(): void {
    this.initializeSubSectionOrder();
  }

  /**
   * Returns a class for styling subsections based on their order
   */
  getSubSectionClass(subSection: string): string {
    return this.subSectionOrder[subSection] % 2 === 0 ? 'even' : 'odd';
  }

  fieldsVisible(): (TemplateFieldModel | FieldModel)[] {
    return this.fieldsListInput().filter((field) => field.isVisible); // ('isVisible' in field ? field.isVisible : true));
  }

  isVisible(field: TemplateFieldModel | FieldModel): boolean {
    return !!field.isVisible; // 'isVisible' in field ? !!field.isVisible : true;
  }

  isRequired(field: TemplateFieldModel | FieldModel): boolean {
    return !!field.isRequired; // 'isRequired' in field ? !!field.isRequired : false;
  }

  /**
   * Initializes subSectionOrder for maintaining ordering of subsections
   */
  private initializeSubSectionOrder(): void {
    let orderCounter = 0;
    this.fieldsListInput().forEach((field) => {
      if (!(field.subSection in this.subSectionOrder)) {
        this.subSectionOrder[field.subSection] = orderCounter++;
      }
    });
  }
}
