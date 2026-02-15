import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsTableComponent } from './agents-table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

describe('AgentsTableComponent', () => {
  let component: AgentsTableComponent;
  let fixture: ComponentFixture<AgentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentsTableComponent, NgxDatatableModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedRow when selectRow is called', () => {
    const mockRow = { id: 1, name: 'Agent Smith' };
    component.selectRow(mockRow);
    expect(component.selectedRow).toEqual(mockRow);
  });

  it('should emit rowSelectedFT when tableId is "replaced"', () => {
    const mockRow = { id: 1, name: 'Agent Smith' };
    component.tableId = signal('replaced') as any;

    spyOn(component.rowSelectedFT, 'emit');
    spyOn(component.rowSelectedST, 'emit');

    component.selectRow(mockRow);

    expect(component.rowSelectedFT.emit).toHaveBeenCalledWith(mockRow);
    expect(component.rowSelectedST.emit).not.toHaveBeenCalled();
  });

  it('should emit rowSelectedST when tableId is not "replaced"', () => {
    const mockRow = { id: 2, name: 'Agent Johnson' };
    component.tableId = signal('new') as any;

    spyOn(component.rowSelectedFT, 'emit');
    spyOn(component.rowSelectedST, 'emit');

    component.selectRow(mockRow);

    expect(component.rowSelectedST.emit).toHaveBeenCalledWith(mockRow);
    expect(component.rowSelectedFT.emit).not.toHaveBeenCalled();
  });

  it('should accept agentList input via setInput', async () => {
    const testData = signal([{ id: 1, name: 'Test' }]);
    component.agentsList = testData as any;
    fixture.detectChanges();

    expect(component.agentsList()).toEqual([{ id: 1, name: 'Test' }]);
  });

  it('should accept newAgentsList input via setInput', async () => {
    const testData = signal([{ id: 1, name: 'Test' }]);
    component.newAgentsList = testData as any;
    fixture.detectChanges();

    expect(component.newAgentsList()).toEqual([{ id: 1, name: 'Test' }]);
  });
});
