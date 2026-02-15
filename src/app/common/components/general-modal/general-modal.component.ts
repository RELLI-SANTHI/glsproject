/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { AfterViewInit, Component, Input, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-general-modal',
  standalone: true,
  imports: [TranslateModule, NgxDatatableModule],
  templateUrl: './general-modal.component.html',
  styleUrl: './general-modal.component.scss'
})
export class GeneralModalComponent implements AfterViewInit {
  @Input() title = '';
  @Input() cancelText = '';
  @Input() confirmText = '';

  @Input() contentComponent!: Type<any>; //  This is an @Input() that gets the type of the component you want to load inside the modal (e.g. GenericTableComponent, MyFormComponent, etc.).
  @Input() contentInputs: Record<string, any> = {};
  @ViewChild('contentContainer', { read: ViewContainerRef }) contentContainer!: ViewContainerRef;

  selectedRow: any;

  constructor(public modalRef: NgbActiveModal) {}

  ngAfterViewInit(): void {
    const componentRef = this.contentContainer.createComponent(this.contentComponent);
    Object.entries(this.contentInputs).forEach(([key, value]) => {
      (componentRef.instance as any)[key] = value;
    });

    if ((componentRef.instance as any).rowSelected) {
      (componentRef.instance as any).rowSelected.subscribe((row: any) => {
        this.selectedRow = row;
      });
    }
  }

  closeModal(): void {
    this.modalRef.dismiss();
  }

  confirm(): void {
    if (this.selectedRow) {
      this.modalRef.close(this.selectedRow);
    } else {
      this.modalRef.close();
    }
  }
}
