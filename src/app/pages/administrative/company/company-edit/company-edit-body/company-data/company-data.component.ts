import { Component, Input, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { CompanyDetailResponse, ProvinceModel } from '../../../../../../api/glsAdministrativeApi/models';
import { TranslatePipe } from '@ngx-translate/core';
import { PostApiProvinceV1Getall$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/province/post-api-province-v-1-getall-json';
import { ProvinceService } from '../../../../../../api/glsAdministrativeApi/services';
import { map, Observable } from 'rxjs';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-company-data',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, GlsInputComponent, GlsInputDropdownComponent, DecimalPipe],
  templateUrl: './company-data.component.html',
  styleUrl: './company-data.component.scss'
})
export class CompanyDataComponent implements OnInit {
  // companyDataFg!: FormGroup;
  companyDataFg = input.required<FormGroup>();
  isWriting = input.required<boolean>();
  isDraft = input.required<boolean>();
  @Input() companyData: CompanyDetailResponse | null = null;

  singleMultipleMemberOptions: { id: boolean; value: string }[] = [
    { id: true, value: 'administrative.companyCreate.companyData.singleMultipleMemberValue.single' },
    { id: false, value: 'administrative.companyCreate.companyData.singleMultipleMemberValue.multiple' }
  ];
  provinceofcRegisterOptions: ProvinceModel[] = [];

  constructor(
    private fb: FormBuilder,
    private provinceService: ProvinceService,
    private genericService: GenericService
  ) {}

  /**
   * Initializes the component and retrieves the province options for company registration.
   * This method is called when the component is initialized.
   */
  ngOnInit(): void {
    // this.buildForm();
    this.getProvinceOfComRegisterOptions().subscribe({
      next: (res: ProvinceModel[]) => {
        this.provinceofcRegisterOptions = res;
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  getMember(): string {
    if (this.companyData) {
      if (this.companyData.isSingleMember === null) {
        return '--';
      }
      const value = this.companyData.isSingleMember
        ? 'administrative.companyCreate.companyData.singleMultipleMemberValue.single'
        : 'administrative.companyCreate.companyData.singleMultipleMemberValue.multiple';

      return value;
    }

    return '--';
  }

  /**
   * Initializes the form group for company data.
   */
  private getProvinceOfComRegisterOptions(): Observable<ProvinceModel[]> {
    const payload: PostApiProvinceV1Getall$Json$Params = {
      body: {}
    };

    return this.provinceService.postApiProvinceV1Getall$Json(payload)?.pipe(map((res: ProvinceModel[]) => res));
  }
}
