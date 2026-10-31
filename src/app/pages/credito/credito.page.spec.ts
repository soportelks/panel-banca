import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditoPage } from './credito.page';

describe('CreditoPage', () => {
  let component: CreditoPage;
  let fixture: ComponentFixture<CreditoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreditoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
