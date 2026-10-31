import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosAltaPage } from './datos-alta.page';

describe('DatosAltaPage', () => {
  let component: DatosAltaPage;
  let fixture: ComponentFixture<DatosAltaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DatosAltaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
