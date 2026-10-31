import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChanguePasswdPage } from './changue-passwd.page';

describe('ChanguePasswdPage', () => {
  let component: ChanguePasswdPage;
  let fixture: ComponentFixture<ChanguePasswdPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChanguePasswdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
