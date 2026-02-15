/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlsCardComponent } from './gls-card.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { Router } from '@angular/router';
import { UtilityRouting } from '../../utilities/utility-routing';

describe('GlsCardComponent', () => {
  let component: GlsCardComponent;
  let fixture: ComponentFixture<GlsCardComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [GlsCardComponent],
      providers: [{ provide: Router, useValue: routerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsCardComponent);
    component = fixture.componentInstance;

    UtilityRouting.initialize(TestBed.inject(Router));

    // Required signal inputs
    signalSetFn(component.title[SIGNAL], 'Title');
    signalSetFn(component.icon[SIGNAL], 'Icon');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate with param when goToParam is set', () => {
    signalSetFn(component.goToLink[SIGNAL], 'path');
    signalSetFn(component.goToParam[SIGNAL], '123');

    component.goTo();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['path', '123']);
  });

  it('should navigate without param when goToParam is not set', () => {
    signalSetFn(component.goToLink[SIGNAL], 'dashboard');
    signalSetFn(component.goToParam[SIGNAL], undefined!);

    component.goTo();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['dashboard']);
  });
});
