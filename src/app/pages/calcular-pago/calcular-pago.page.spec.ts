import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalcularPagoPage } from './calcular-pago.page';

describe('CalcularPagoPage', () => {
  let component: CalcularPagoPage;
  let fixture: ComponentFixture<CalcularPagoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CalcularPagoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
