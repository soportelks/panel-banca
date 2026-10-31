import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidacionPage } from './validacion.page';

describe('ValidacionPage', () => {
  let component: ValidacionPage;
  let fixture: ComponentFixture<ValidacionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ValidacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
