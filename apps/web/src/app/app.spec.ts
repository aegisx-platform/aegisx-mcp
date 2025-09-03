import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AegisxNavigationService, AegisxConfigService } from '@aegisx/ui';

describe('App', () => {
  let mockNavigationService: Partial<AegisxNavigationService>;
  let mockConfigService: Partial<AegisxConfigService>;

  beforeEach(async () => {
    mockNavigationService = {
      setNavigation: jest.fn(),
    };
    mockConfigService = {
      updateConfig: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AegisxNavigationService, useValue: mockNavigationService },
        { provide: AegisxConfigService, useValue: mockConfigService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the correct title', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('AegisX Platform');
  });
});
