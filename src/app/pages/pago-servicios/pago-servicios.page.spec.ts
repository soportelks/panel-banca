import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoServiciosPage } from './pago-servicios.page';

describe('PagoServiciosPage', () => {
  let component: PagoServiciosPage;
  let fixture: ComponentFixture<PagoServiciosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PagoServiciosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
