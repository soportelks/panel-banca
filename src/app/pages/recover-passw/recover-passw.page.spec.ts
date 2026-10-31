import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoverPasswPage } from './recover-passw.page';

describe('RecoverPasswPage', () => {
  let component: RecoverPasswPage;
  let fixture: ComponentFixture<RecoverPasswPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RecoverPasswPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
