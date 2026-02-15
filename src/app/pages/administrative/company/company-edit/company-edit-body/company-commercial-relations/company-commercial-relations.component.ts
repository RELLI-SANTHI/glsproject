/* eslint-disable max-len */
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { CommercialRelationsTableComponent } from './commercial-relations-table/commercial-relations-table.component';
import { AdministrativeService } from '../../../../../../api/glsAdministrativeApi/services/administrative.service';
import { map, Observable } from 'rxjs';
import {
  CompanyAgentDetail,
  CompanyCustomerDetail,
  CustomerType,
  GetCompanyAgentsResponse,
  GetCompanyCustomersResponse
} from '../../../../../../api/glsAdministrativeApi/models';
import { GetApiAdministrativeV1IdCustomers$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/administrative/get-api-administrative-v-1-id-customers-json';
import { GetApiAdministrativeV1IdAgents$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/administrative/get-api-administrative-v-1-id-agents-json';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-company-commercial-relations',
  standalone: true,
  templateUrl: './company-commercial-relations.component.html',
  styleUrls: ['./company-commercial-relations.component.css'],
  imports: [NgbNavModule, TranslatePipe, NgClass, CommercialRelationsTableComponent] // <-- Add this line and include any Angular/common modules or other standalone components you use in the template
})
export class CompanyCommercialRelationsComponent implements OnInit {
  active = 'tab1';
  idCompany: number | null = null;
  AgentsCount = 0;
  CustomerCount = 0;
  CountLAC = 0;
  commercialRelationsData!: CompanyCustomerDetail[];
  commercialRelationsDataLAC!: CompanyCustomerDetail[];
  commercialRelationsAgents!: CompanyAgentDetail[];

  constructor(
    private administrativeService: AdministrativeService,
    private route: ActivatedRoute
  ) {}

  /**
   * Initializes the component and retrieves commercial relations data.
   * This method is called when the component is initialized.
   * It fetches customers and agents associated with the company based on the ID from the route parameters.
   */
  ngOnInit() {
    this.idCompany = Number(this.route.snapshot.paramMap.get('idCompany'));
    this.getCustomerById('Customer').subscribe((res: GetCompanyCustomersResponse) => {
      this.commercialRelationsData = res.customers ?? [];
      this.CustomerCount = this.commercialRelationsData.length;
    });
    this.getCustomerById('CustomerLAC').subscribe((res: GetCompanyCustomersResponse) => {
      this.commercialRelationsDataLAC = res.customers ?? [];
      this.CountLAC = this.commercialRelationsDataLAC.length;
    });
    this.getAgentsById().subscribe((res: GetCompanyAgentsResponse) => {
      this.commercialRelationsAgents = res.agents ?? [];
      this.AgentsCount = this.commercialRelationsAgents.length;
    });
  }
  /**
   * Retrieves customers by type for the specified company ID.
   * @param type - The type of customers to retrieve (e.g., 'Customer', 'CustomerLAC').
   * @returns An observable containing the response with customer details.
   */
  private getCustomerById(type: CustomerType): Observable<GetCompanyCustomersResponse> {
    const param: GetApiAdministrativeV1IdCustomers$Json$Params = {
      id: this.idCompany ?? 0,
      Type: type
    };

    return this.administrativeService.getApiAdministrativeV1IdCustomers$Json(param)?.pipe(map((res: GetCompanyCustomersResponse) => res));
  }
  /**
   * Retrieves agents for the specified company ID.
   * @returns An observable containing the response with agent details.
   */
  private getAgentsById(): Observable<GetCompanyAgentsResponse> {
    const param: GetApiAdministrativeV1IdAgents$Json$Params = {
      id: this.idCompany ?? 0
    };

    return this.administrativeService.getApiAdministrativeV1IdAgents$Json(param)?.pipe(map((res: GetCompanyAgentsResponse) => res));
  }
}
