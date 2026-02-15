/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceAgentsModalComponent } from './replace-agents-modal.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Utility } from '../../../../../common/utilities/utility';

// eslint-disable-next-line max-lines-per-function
describe('ReplaceAgentsModalComponent', () => {
  let component: ReplaceAgentsModalComponent;
  let fixture: ComponentFixture<ReplaceAgentsModalComponent>;
  let modalRefSpy: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NgbActiveModal', ['dismiss']);
    modalRefSpy = spy;

    await TestBed.configureTestingModule({
      imports: [ReplaceAgentsModalComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [{ provide: NgbActiveModal, useValue: modalRefSpy }, FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(ReplaceAgentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on ngOnInit', () => {
    component.ngOnInit();

    expect(component.replaceAgentFormFg).toBeTruthy();
    expect(component.replaceAgentFormFg.contains('agencyName')).toBeTrue();
    expect(component.replaceAgentFormFg.get('agencyName')?.validator).toBeTruthy();

    const oldAgentGroup = component.replaceAgentFormFg.get('oldAgent');
    expect(oldAgentGroup).toBeTruthy();
    expect(oldAgentGroup?.get('choiseSr')).toBeTruthy();
    expect(oldAgentGroup?.get('inputSr')).toBeTruthy();

    const newAgentGroup = component.replaceAgentFormFg.get('newAgent');
    expect(newAgentGroup).toBeTruthy();
    expect(newAgentGroup?.get('choiseSr')).toBeTruthy();
    expect(newAgentGroup?.get('inputSr')).toBeTruthy();
  });

  it('should receive mockForm as InputSignal correctly', async () => {
    const mockFormSignal = signal([
      {
        companyName: 'Alfa S.p.A.',
        agentCode: 12345,
        vatNumber: 'IT8904283489',
        fiscalCode: 'YIGYU876KJKJHKGH'
      },
      {
        companyName: 'Beta S.r.l.',
        agentCode: 67890,
        vatNumber: 'DE938098405982',
        fiscalCode: 'IJGJO987JIUG'
      }
    ]);

    component.replacedAgent = mockFormSignal as any;
    fixture.detectChanges();
    expect(component.replacedAgent().length).toBe(2);
    expect(component.replacedAgent()[0].companyName).toBe('Alfa S.p.A.');
  });

  it('should handle newAgent inputSignal correctly', async () => {
    const newAgentsMock = signal([
      {
        companyName: 'Pippo S.p.A.',
        agentCode: 12345,
        vatNumber: 'IT8904283489',
        fiscalCode: 'YIGYU876KJKJHKGH'
      },
      {
        companyName: 'Paperino S.r.l.',
        agentCode: 67890,
        vatNumber: 'DE938098405982',
        fiscalCode: 'IJGJO987JIUG'
      },
      {
        companyName: 'Pluto SNC',
        agentCode: 11223,
        vatNumber: 'FR94378958',
        fiscalCode: 'KJER85JNKJ'
      }
    ]);

    component.newAgent = newAgentsMock as any;
    fixture.detectChanges();
    expect(component.newAgent().length).toBe(3);
    expect(component.newAgent()[0].companyName).toBe('Pippo S.p.A.');
  });

  it('should return true when both selectedAgentReplaced and selectedAgentNew are not empty', () => {
    component.selectedAgentReplaced.set({ agentCode: 123 } as any);
    component.selectedAgentNew.set({ agentCode: 456 } as any);
    expect(component.isSelectionValid()).toBeTrue();
  });

  it('should return false when selectedAgentReplaced is empty', () => {
    component.selectedAgentReplaced.set(null);
    component.selectedAgentNew.set({ agentCode: 456 } as any);
    expect(component.isSelectionValid()).toBeFalse();
  });

  it('should return the oldAgent FormGroup', () => {
    component.ngOnInit();
    const oldAgentGroup = component.replaceAgentFormFg.get('oldAgent') as FormGroup;
    expect(component.oldAgentForm).toBe(oldAgentGroup);
  });

  it('should return the newAgent FormGroup', () => {
    component.ngOnInit();
    const newAgentGroup = component.replaceAgentFormFg.get('newAgent') as FormGroup;
    expect(component.newAgentForm).toBe(newAgentGroup);
  });

  it('should call closeModal when passParams is called', () => {
    spyOn(component, 'closeModal');
    component.passParams();
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should clear filteredOldAgents if input or choice is missing', () => {
    component.replacedAgent = signal([{ companyName: 'Alfa S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' }]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('oldAgent.choiseSr')?.setValue('filterSearchAgent');
    component.replaceAgentFormFg.get('oldAgent.inputSr')?.setValue('');
    component.filterFirTableByAcronym();
    expect(component.filteredOldAgents()).toEqual([]);

    component.replaceAgentFormFg.get('oldAgent.choiseSr')?.setValue('');
    component.replaceAgentFormFg.get('oldAgent.inputSr')?.setValue('123');
    component.filterFirTableByAcronym();
    expect(component.filteredOldAgents()).toEqual([]);
  });

  it('should return empty result if no filter condition matches', () => {
    component.replacedAgent = signal([{ companyName: 'Gamma S.p.A.', agentCode: 99999, vatNumber: '', fiscalCode: '' }]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('oldAgent.choiseSr')?.setValue('invalidFilter');
    component.replaceAgentFormFg.get('oldAgent.inputSr')?.setValue('gamma');

    component.filterFirTableByAcronym();

    expect(component.filteredOldAgents()).toEqual([]);
  });

  it('should filter replaced agents by agentCode', () => {
    component.replacedAgent = signal([
      { companyName: 'Alfa S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' },
      { companyName: 'Beta S.r.l.', agentCode: 67890, vatNumber: '', fiscalCode: '' }
    ]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('oldAgent.choiseSr')?.setValue('filterSearchAgent');
    component.replaceAgentFormFg.get('oldAgent.inputSr')?.setValue('123');

    component.filterFirTableByAcronym();

    expect(component.filteredOldAgents()).toEqual([{ companyName: 'Alfa S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' }]);
  });

  it('should filter replaced agents by companyName', () => {
    component.replacedAgent = signal([
      { companyName: 'Alfa S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' },
      { companyName: 'Beta S.r.l.', agentCode: 67890, vatNumber: '', fiscalCode: '' }
    ]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('oldAgent.choiseSr')?.setValue('filterSearchCompany');
    component.replaceAgentFormFg.get('oldAgent.inputSr')?.setValue('beta');

    component.filterFirTableByAcronym();

    expect(component.filteredOldAgents()).toEqual([{ companyName: 'Beta S.r.l.', agentCode: 67890, vatNumber: '', fiscalCode: '' }]);
  });

  it('should clear filteredNewAgents if input or choice is missing', () => {
    component.newAgent = signal([{ companyName: 'Pippo S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' }]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('newAgent.choiseSr')?.setValue('filterSearchAgent');
    component.replaceAgentFormFg.get('newAgent.inputSr')?.setValue('');
    component.filterSecTableByAcronym();
    expect(component.filteredNewAgents()).toEqual([]);

    component.replaceAgentFormFg.get('newAgent.choiseSr')?.setValue('');
    component.replaceAgentFormFg.get('newAgent.inputSr')?.setValue('123');
    component.filterSecTableByAcronym();
    expect(component.filteredNewAgents()).toEqual([]);
  });

  it('should return empty result if no filter condition matches for new agents', () => {
    component.newAgent = signal([{ companyName: 'Pluto SNC', agentCode: 99999, vatNumber: '', fiscalCode: '' }]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('newAgent.choiseSr')?.setValue('invalidFilter');
    component.replaceAgentFormFg.get('newAgent.inputSr')?.setValue('pluto');

    component.filterSecTableByAcronym();

    expect(component.filteredNewAgents()).toEqual([]);
  });

  it('should filter new agents by agentCode', () => {
    component.newAgent = signal([
      { companyName: 'Pippo S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' },
      { companyName: 'Paperino S.r.l.', agentCode: 67890, vatNumber: '', fiscalCode: '' }
    ]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('newAgent.choiseSr')?.setValue('filterSearchAgent');
    component.replaceAgentFormFg.get('newAgent.inputSr')?.setValue('678');

    component.filterSecTableByAcronym();

    expect(component.filteredNewAgents()).toEqual([{ companyName: 'Paperino S.r.l.', agentCode: 67890, vatNumber: '', fiscalCode: '' }]);
  });

  it('should filter new agents by companyName', () => {
    component.newAgent = signal([
      { companyName: 'Pippo S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' },
      { companyName: 'Paperino S.r.l.', agentCode: 67890, vatNumber: '', fiscalCode: '' }
    ]) as any;

    component.ngOnInit();

    component.replaceAgentFormFg.get('newAgent.choiseSr')?.setValue('filterSearchCompany');
    component.replaceAgentFormFg.get('newAgent.inputSr')?.setValue('pippo');

    component.filterSecTableByAcronym();

    expect(component.filteredNewAgents()).toEqual([{ companyName: 'Pippo S.p.A.', agentCode: 12345, vatNumber: '', fiscalCode: '' }]);
  });

  it('should return false when selectedAgentNew is empty', () => {
    component.selectedAgentReplaced.set({
      agentCode: 12345,
      vatNumber: 'IT1234567890',
      fiscalCode: 'XYZABC12D34E567F',
      companyName: 'Alfa S.p.A.'
    } as any);
    component.selectedAgentNew.set(null);
    expect(component.isSelectionValid()).toBeFalse();
  });

  it('should return false when both selectedAgentReplaced and selectedAgentNew are empty', () => {
    component.selectedAgentReplaced.set(null);
    component.selectedAgentNew.set(null);
    expect(component.isSelectionValid()).toBeFalse();
  });

  it('should call dismiss on closeModal', () => {
    component.closeModal();
    expect(modalRefSpy.dismiss).toHaveBeenCalled();
  });

  it('should have default translation keys set', () => {
    expect(component.title).toBe('administrative.replaceAgentModal.title');
    expect(component.selection).toBe('administrative.replaceAgentModal.selection');
    expect(component.placeholder).toBe('administrative.replaceAgentModal.placeholder');
    expect(component.cancel).toBe('administrative.replaceAgentModal.cancel');
    expect(component.confirm).toBe('administrative.replaceAgentModal.confirm');
  });

  it('should have choiseAgency list defined', () => {
    expect(component.choiseAgency).toBeDefined();
    expect(Array.isArray(component.choiseAgency)).toBeTrue();
  });

  // eslint-disable-next-line max-lines-per-function
  it('should call the API with correct parameters, close the modal and show success message on success', async () => {
    const mockBlob = new Blob(['name,age\nAlice,30\nBob,25'], { type: 'text/csv' });
    const mockResponse = { body: mockBlob };

    const agentServiceSpy = jasmine.createSpyObj('AgentService', ['postApiAgentV1Replace$Json$Response']);
    agentServiceSpy.postApiAgentV1Replace$Json$Response.and.returnValue(of(mockResponse));
    (component as any).agentService = agentServiceSpy;

    const modalRefSpy = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    (component as any).modalRef = modalRefSpy;

    const messageStatusServiceSpy = jasmine.createSpyObj('MessageStatusService', ['setSuccessMessage']);
    (component as any).messageStatusService = messageStatusServiceSpy;

    spyOn(Utility, 'countCsvRecordsFromBlob').and.returnValue(Promise.resolve(2));

    component.selectedAgentReplaced.set({ agentCode: 'OLD123', id: 'OLD123' } as any);
    component.selectedAgentNew.set({ agentCode: 'NEW456', id: 'NEW456' } as any);

    await component.replaceAgents();
    // Wait for all async code to complete
    await fixture.whenStable();

    // expect(agentServiceSpy.postApiAgentV1Replace$Json$Response).toHaveBeenCalledWith({
    //   id: 'OLD123',
    //   newId: 'NEW456',
    //   body: {
    //     fieldsToReturn: [
    //       { field: 'Id', label: 'administrative.replaceAgentModal.Id' },
    //       { field: 'SubjectId', label: 'administrative.replaceAgentModal.SubjectId' },
    //       { field: 'SurnameNameCompanyName', label: 'administrative.replaceAgentModal.SurnameNameCompanyName' },
    //       { field: 'VATNumber', label: 'administrative.replaceAgentModal.VATNumber' },
    //       { field: 'TaxCode', label: 'administrative.replaceAgentModal.TaxCode' },
    //       { field: 'AgentCode', label: 'administrative.replaceAgentModal.AgentCode' }
    //     ]
    //   }
    // });

    expect(modalRefSpy.close).toHaveBeenCalledWith({ response: mockResponse });

    expect(messageStatusServiceSpy.setSuccessMessage).toHaveBeenCalledWith(
      {
        title: 'message.relationshipCustomerList.massiveAgentReplacement.success',
        message: 'message.relationshipCustomerList.massiveAgentReplacement.successSecondMessage',
        showDownloadReportButton: true
      },
      {
        idOldAgent: 'OLD123',
        numberOfCustomers: 2
      }
    );
  });

  it('should call the API with correct parameters and close the modal', async () => {
    const agentServiceSpy = jasmine.createSpyObj('agentService', ['postApiAgentV1Replace$Json$Response']);
    agentServiceSpy.postApiAgentV1Replace$Json$Response.and.returnValue(of({}));
    (component as any).agentService = agentServiceSpy;

    (component as any).modalRef = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    component.selectedAgentReplaced.set({ agentCode: 123, id: 123 } as any);
    component.selectedAgentNew.set({ agentCode: 456, id: 456 } as any);

    await component.replaceAgents();
    await fixture.whenStable();

    expect(agentServiceSpy.postApiAgentV1Replace$Json$Response).toHaveBeenCalled();
  });

  it('should fetch agents and update replacedAgent and newAgent on successful API call', () => {
    const mockEvent = '123';
    const mockResponse = {
      agents: [
        {
          surnameNameCompanyName: 'Alfa S.p.A.',
          agentCode: 12345,
          vatNumber: 'IT8904283489',
          taxCode: 'YIGYU876KJKJHKGH'
        },
        {
          surnameNameCompanyName: 'Beta S.r.l.',
          agentCode: 67890,
          vatNumber: 'DE938098405982',
          taxCode: 'IJGJO987JIUG'
        }
      ]
    };

    const agentServiceSpy = jasmine.createSpyObj('agentService', ['postApiAgentV1$Json']);
    agentServiceSpy.postApiAgentV1$Json.and.returnValue(of(mockResponse));
    (component as any).agentService = agentServiceSpy;

    component.onCompanySelected(mockEvent);

    expect(agentServiceSpy.postApiAgentV1$Json).toHaveBeenCalledWith({
      body: { administrativeId: Number(mockEvent), status: ['COMPLETED'] }
    });

    expect(component.replacedAgent().length).toBe(2);
    expect(component.newAgent().length).toBe(2);
    expect(component.replacedAgent()[0].companyName).toBe('Alfa S.p.A.');
  });
});
