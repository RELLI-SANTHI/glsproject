import { Component, inject, input, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';

import { CategoryFields, CategoryResponse } from '../../../../../api/glsAdministrativeApi/models';
import { CategoryService } from '../../../../../api/glsAdministrativeApi/services';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GenericDropdown } from '../../../../../common/models/generic-dropdown';
import { TypeCustomer } from '../../enum/type-customer';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { FORM_TYPE } from '../../constants/relationship-constants';

@Component({
  selector: 'app-relationship-general-data',
  standalone: true,
  imports: [GlsInputDropdownComponent, TranslatePipe, GlsInputComponent],
  templateUrl: './relationship-general-data.component.html',
  styleUrl: './relationship-general-data.component.scss'
})
export class RelationshipGeneralDataComponent implements OnInit {
  relationshipGeneralDataForm = input.required<FormGroup>();
  isWriting = input<boolean>();
  isDraft = input.required<boolean>();
  categoryClientList = signal<GenericDropdown[]>([]);
  private typeCustomer: TypeCustomer | undefined;
  private listCategoryClient: CategoryResponse[] = [];
  private readonly categoryService = inject(CategoryService);
  private readonly genericService = inject(GenericService);

  ngOnInit(): void {
    this.typeCustomer = this.relationshipGeneralDataForm()?.get(FORM_TYPE.typeRelationship)?.value;
    if (this.typeCustomer) {
      this.getCategoryClientList();
    }
  }

  /**
   * Returns the list of categories for clients.
   * @param idCategory {string} - The ID of the category.
   */
  getCategoryCustomerLabel(idCategory: string): string {
    const category = this.listCategoryClient?.find((item) => item.categoryCode === idCategory);

    return category ? category.categoryCode + ' - ' + category.categoryDescription : '--';
  }

  /**
   * Sets the default value for the categoryId field when the type is ClientLac.
   * @private
   */
  private setDefaultValueCustLac() {
    this.relationshipGeneralDataForm()
      ?.get('categoryId')
      ?.setValue(this.categoryClientList()?.find((item) => item.value?.startsWith('802'))?.id);
    this.relationshipGeneralDataForm()?.get('categoryId')?.disable();
  }

  /**
   * Fetches the list of categories based on the type of customer.
   * @private
   */
  private getCategoryClientList() {
    this.categoryService
      .postApiCategoryV1$Json({
        body: {
          orderBy: {
            field: 'Code' as CategoryFields,
            direction: 'asc'
          }
        }
      })
      .pipe(
        map((response) => {
          if (this.typeCustomer === TypeCustomer.ClientLac) {
            response.items = response.items.filter((item) => item.categoryCode === '802');
          } else {
            response.items = response.items.filter((item) => item.categoryCode !== '802');
          }

          return response;
        })
      )
      .subscribe({
        next: (response) => {
          this.listCategoryClient = response.items;
          const mappedItems = response.items.map((item: CategoryResponse) => ({
            id: item.id!,
            value: item.categoryCode! + ' - ' + item.categoryDescription!
          }));
          this.categoryClientList.set(mappedItems);
          if (this.typeCustomer == TypeCustomer.ClientLac) {
            this.setDefaultValueCustLac();
          }
        },
        error: (err) => {
          this.genericService.manageError(err);
        }
      });
  }
}
