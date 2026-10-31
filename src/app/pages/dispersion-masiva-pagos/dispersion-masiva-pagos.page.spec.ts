import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DispersionMasivaPagosPage } from './dispersion-masiva-pagos.page';

describe('DispersionMasivaPagosPage', () => {
  let component: DispersionMasivaPagosPage;
  let fixture: ComponentFixture<DispersionMasivaPagosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DispersionMasivaPagosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
