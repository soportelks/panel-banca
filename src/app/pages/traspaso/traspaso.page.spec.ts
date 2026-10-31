import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TraspasoPage } from './traspaso.page';

describe('TraspasoPage', () => {
  let component: TraspasoPage;
  let fixture: ComponentFixture<TraspasoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TraspasoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
