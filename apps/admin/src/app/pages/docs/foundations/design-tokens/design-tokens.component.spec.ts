import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesignTokensComponent } from './design-tokens.component';
import { TremorThemeService } from '../../services/tremor-theme.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DesignTokensComponent', () => {
  let component: DesignTokensComponent;
  let fixture: ComponentFixture<DesignTokensComponent>;
  let themeService: jasmine.SpyObj<TremorThemeService>;

  beforeEach(async () => {
    const themeServiceSpy = jasmine.createSpyObj('TremorThemeService', [
      'toggleTheme',
    ]);

    await TestBed.configureTestingModule({
      imports: [DesignTokensComponent, BrowserAnimationsModule],
      providers: [{ provide: TremorThemeService, useValue: themeServiceSpy }],
    }).compileComponents();

    themeService = TestBed.inject(
      TremorThemeService,
    ) as jasmine.SpyObj<TremorThemeService>;
    fixture = TestBed.createComponent(DesignTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have token categories', () => {
    expect(component.tokenCategories.length).toBeGreaterThan(0);
  });

  it('should calculate total token count', () => {
    const totalTokens = component.getTotalTokenCount();
    expect(totalTokens).toBeGreaterThan(0);
  });

  it('should filter tokens based on search query', () => {
    component.searchQuery = 'brand';
    const filtered = component.filteredCategories;
    expect(filtered.length).toBeGreaterThan(0);

    // Check if all filtered tokens contain 'brand' in name, cssVar, or description
    filtered.forEach((category) => {
      category.tokens.forEach((token) => {
        const matchesSearch =
          token.name.toLowerCase().includes('brand') ||
          token.cssVar.toLowerCase().includes('brand') ||
          token.description.toLowerCase().includes('brand') ||
          token.category.toLowerCase().includes('brand');
        expect(matchesSearch).toBe(true);
      });
    });
  });

  it('should copy CSS variable to clipboard', async () => {
    const cssVar = '--ax-brand-default';
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    await component.copyToClipboard(cssVar);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `var(${cssVar})`,
    );
    expect(component.copiedToken).toBe(cssVar);
  });

  it('should toggle theme', () => {
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should return color value', () => {
    const cssVar = '--ax-brand-default';
    const result = component.getColorValue(cssVar);
    expect(result).toBe(`var(${cssVar})`);
  });

  it('should have all required token categories', () => {
    const categoryIds = component.tokenCategories.map((cat) => cat.id);
    expect(categoryIds).toContain('colors');
    expect(categoryIds).toContain('typography');
    expect(categoryIds).toContain('spacing');
    expect(categoryIds).toContain('components');
  });

  it('should compute token values on init', () => {
    spyOn(component, 'computeTokenValues');
    component.ngOnInit();
    expect(component.computeTokenValues).toHaveBeenCalled();
  });
});
