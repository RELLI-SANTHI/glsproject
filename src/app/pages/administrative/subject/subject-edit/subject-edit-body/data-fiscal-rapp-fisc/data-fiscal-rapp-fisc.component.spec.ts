/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataFiscalRappFiscComponent } from './data-fiscal-rapp-fisc.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { NationsCodeService } from '../../../../../../api/glsAdministrativeApi/services';
import { of } from 'rxjs';

describe('DataFiscalRappFiscComponent', () => {
  let component: DataFiscalRappFiscComponent;
  let fixture: ComponentFixture<DataFiscalRappFiscComponent>;
  let mockNationsCodeService: jasmine.SpyObj<NationsCodeService>;
  let form: FormGroup;

  beforeEach(async () => {
    mockNationsCodeService = jasmine.createSpyObj('NationsCodeService', ['postApiNationscodeV1$Json']);

    form = new FormBuilder().group({
      selectRadioFiscalRapp: [false],
      typeSubject: [false],
      countryID: [''],
      countryName: [''],
      taxCode: [''],
      companyName: [''],
      codeId: [''],
      surname: [''],
      name: ['']
    });

    await TestBed.configureTestingModule({
      imports: [DataFiscalRappFiscComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [{ provide: NationsCodeService, useValue: mockNationsCodeService }]
    }).compileComponents();

    fixture = TestBed.createComponent(DataFiscalRappFiscComponent);
    component = fixture.componentInstance;

    // Simula gli input
    (component as any).isWriting = signal(true);
    (component as any).dataFiscalRappFiscForm = signal(form);

    mockNationsCodeService.postApiNationscodeV1$Json.and.returnValue(of([]));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
