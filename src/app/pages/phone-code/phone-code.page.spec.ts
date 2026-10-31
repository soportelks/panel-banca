import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhoneCodePage } from './phone-code.page';

describe('PhoneCodePage', () => {
  let component: PhoneCodePage;
  let fixture: ComponentFixture<PhoneCodePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PhoneCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
