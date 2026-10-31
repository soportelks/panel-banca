import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarOrdenPage } from './registrar-orden.page';

describe('RegistrarOrdenPage', () => {
  let component: RegistrarOrdenPage;
  let fixture: ComponentFixture<RegistrarOrdenPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegistrarOrdenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
