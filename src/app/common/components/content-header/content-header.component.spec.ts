import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

import { ContentHeaderComponent } from './content-header.component';
import { By } from '@angular/platform-browser';

// eslint-disable-next-line max-lines-per-function
describe('ContentHeaderComponent', () => {
  let component: ContentHeaderComponent;
  let fixture: ComponentFixture<ContentHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentHeaderComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentHeaderComponent);
    component = fixture.componentInstance;
    signalSetFn(component.title[SIGNAL], '');
    signalSetFn(component.subTitle[SIGNAL], '');
    signalSetFn(component.image[SIGNAL], '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and subtitle', () => {
    signalSetFn(component.title[SIGNAL], 'Test Title');
    signalSetFn(component.subTitle[SIGNAL], 'Test Subtitle');
    signalSetFn(component.image[SIGNAL], 'test-image-url');
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h1.title')).nativeElement;
    const subTitleElement = fixture.debugElement.query(By.css('p.desc')).nativeElement;

    expect(titleElement.textContent).toContain('Test Title');
    expect(subTitleElement.textContent).toContain('Test Subtitle');
  });

  it('should emit the openExportModal event when the corresponding button is clicked', () => {
    const spy = spyOn(component.btnExportEvent, 'emit');
    signalSetFn(component.showBtnExport[SIGNAL], true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button.me-2'));
    expect(button).toBeTruthy();
    button.nativeElement.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable export button when showButtonExport is false', () => {
    signalSetFn(component.showBtnExport[SIGNAL], false); //
    fixture.detectChanges();
    const exportButton = fixture.debugElement.query(By.css('button.me-2'));
    expect(exportButton).toBeNull();
  });

  it('should disable the "Export" button when disableExportBtn is true', () => {
    signalSetFn(component.showBtnExport[SIGNAL], true);
    signalSetFn(component.disableExportBtn[SIGNAL], true);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(By.css('button.me-2'));
    expect(exportButton.nativeElement.disabled).toBeTrue();
  });

  it('should display the correct image when image is set', () => {
    signalSetFn(component.image[SIGNAL], 'test-image-url');
    fixture.detectChanges();

    const imageElement = fixture.debugElement.query(By.css('img'));
    expect(imageElement.nativeElement.src).toContain('test-image-url');
  });

  it('should have default values for optional inputs', () => {
    expect(component.labelBtnCreate()).toBe('');
    expect(component.showBtnCreate()).toBeUndefined();
    expect(component.disableExportBtn()).toBeUndefined();
  });
});
