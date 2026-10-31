import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecargasPage } from './recargas.page';

describe('RecargasPage', () => {
  let component: RecargasPage;
  let fixture: ComponentFixture<RecargasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RecargasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
