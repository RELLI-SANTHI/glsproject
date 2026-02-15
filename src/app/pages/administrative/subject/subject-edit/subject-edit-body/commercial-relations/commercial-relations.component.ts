import { Component, inject, model, OnInit, signal } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { forkJoin } from 'rxjs';

import { TableCommercialRelationsComponent } from './table-commercial-relations/table-commercial-relations.component';
import { CompanyAgentDetail, SubjectCustomerDetail } from '../../../../../../api/glsAdministrativeApi/models';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { SubjectService } from '../../../../../../api/glsAdministrativeApi/services';

@Component({
  selector: 'app-commercial-relations',
  standalone: true,
  imports: [NgbNavModule, TranslatePipe, NgClass, TableCommercialRelationsComponent],
  templateUrl: './commercial-relations.component.html',
  styleUrl: './commercial-relations.component.scss'
})
export class CommercialRelationsComponent implements OnInit {
  isOpenedFilter = model();
  agentsList = signal<CompanyAgentDetail[]>([]);
  customersList = signal<SubjectCustomerDetail[]>([]);
  customersLACList = signal<SubjectCustomerDetail[]>([]);
  active = 'tab1';

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly genericService = inject(GenericService);
  private readonly subjectService = inject(SubjectService);

  ngOnInit(): void {
    this.loadDataTable();
  }

  private loadDataTable(): void {
    const idSubject = Number(this.activatedRoute.snapshot.paramMap.get('idSubject'));

    const loadCustomers = this.subjectService.getApiSubjectV1IdCustomers$Json({
      id: idSubject,
      Type: 'Customer'
    });
    const loadCustomersLac = this.subjectService.getApiSubjectV1IdCustomers$Json({
      id: idSubject,
      Type: 'CustomerLAC'
    });

    const loadAgents = this.subjectService.getApiSubjectV1IdAgents$Json({ id: idSubject });

    forkJoin([loadCustomers, loadCustomersLac, loadAgents]).subscribe({
      next: ([custResp, custLacResp, agentRest]) => {
        this.customersList.set(custResp?.customers ?? []);
        this.customersLACList.set(custLacResp?.customers ?? []);
        this.agentsList.set(agentRest?.agents ?? []);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }
}
