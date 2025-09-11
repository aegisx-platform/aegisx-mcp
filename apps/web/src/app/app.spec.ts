import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { AegisxNavigationService, AegisxConfigService } from '@aegisx/ui';
import { AuthService } from './core/auth.service';

describe('App', () => {
  let mockNavigationService: Partial<AegisxNavigationService>;
  let mockConfigService: Partial<AegisxConfigService>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockNavigationService = {
      setNavigation: jest.fn(),
    };
    mockConfigService = {
      updateConfig: jest.fn(),
      config: jest.fn().mockReturnValue({ scheme: 'light' }),
    };
    mockAuthService = {
      currentUser: jest.fn().mockReturnValue({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }),
      userDisplayName: jest.fn().mockReturnValue('Test User'),
      logout: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AegisxNavigationService, useValue: mockNavigationService },
        { provide: AegisxConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
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
