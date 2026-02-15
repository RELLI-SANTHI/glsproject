import { Component, inject, Input, input, OnInit } from '@angular/core';
import { GetAdministrativeStructuresResponse, GetAdministrativeStrucutureDetail } from '../../../../../../api/glsAdministrativeApi/models';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslatePipe } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { AdministrativeService } from '../../../../../../api/glsAdministrativeApi/services';
import { HttpErrorResponse } from '@angular/common/http';
import { GetApiAdministrativeV1IdStructures$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/administrative/get-api-administrative-v-1-id-structures-json';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-administrative-structures',
  standalone: true,
  imports: [DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule, TranslatePipe, DatePipe],
  templateUrl: './administrative-structures.component.html',
  styleUrl: './administrative-structures.component.scss'
})
export class AdministrativeStructuresComponent implements OnInit {
  isWriting = input.required<boolean>();
  @Input() companyId: number | null = null;
  structureList: GetAdministrativeStrucutureDetail[] = [];
  private readonly genericService = inject(GenericService);
  private readonly administrativeService = inject(AdministrativeService);

  /**
   * Initializes the component and retrieves the administrative structure data for the company.
   * This method is called when the component is initialized.
   */
  ngOnInit(): void {
    this.getAdministrativeStrucuture();
  }

  /**
   * Loads the administrative structure data for the company.
   * Calls the administrative service to fetch the data based on the company ID.
   */
  public getAdministrativeStrucuture(): void {
    const params: GetApiAdministrativeV1IdStructures$Json$Params = {
      id: this.companyId || 0
    };
    this.retrieveAdministrativeStrucuture(params).subscribe({
      next: (res: GetAdministrativeStructuresResponse) => {
        this.structureList = res?.structures || [];
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Formats the date for display in the table.
   * @param value - The date value to format.
   * @returns The formatted date string.
   */
  isValidDate(value: string): boolean {
    return !isNaN(Date.parse(value));
  }

  /**
   * Retrieves the administrative structure data for the company.
   * @param params - Parameters containing the company ID.
   */
  private retrieveAdministrativeStrucuture(
    params: GetApiAdministrativeV1IdStructures$Json$Params
  ): Observable<GetAdministrativeStructuresResponse> {
    return this.administrativeService
      .getApiAdministrativeV1IdStructures$Json(params)
      ?.pipe(map((res: GetAdministrativeStructuresResponse) => res));
  }
}
