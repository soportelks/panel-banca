import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculadoraInversionesPage } from './calculadora-inversiones.page';

describe('CalculadoraInversionesPage', () => {
  let component: CalculadoraInversionesPage;
  let fixture: ComponentFixture<CalculadoraInversionesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CalculadoraInversionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
