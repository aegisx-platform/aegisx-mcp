import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AegisxUi } from './aegisx-ui';

describe('AegisxUi', () => {
  let component: AegisxUi;
  let fixture: ComponentFixture<AegisxUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AegisxUi],
    }).compileComponents();

    fixture = TestBed.createComponent(AegisxUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
