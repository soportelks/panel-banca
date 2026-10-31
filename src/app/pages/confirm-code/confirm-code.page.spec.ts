import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmCodePage } from './confirm-code.page';

describe('ConfirmCodePage', () => {
  let component: ConfirmCodePage;
  let fixture: ComponentFixture<ConfirmCodePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ConfirmCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
