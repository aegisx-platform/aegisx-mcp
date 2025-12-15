# AegisX UI Library Development Standards

## 🎯 Overview

This document establishes mandatory development standards for the AegisX UI library to ensure code quality, accessibility, and maintainability.

## 🚨 Mandatory Rules (NO EXCEPTIONS)

### 1. Angular Dependency Injection

**MUST use inject() function instead of constructor injection**

```typescript
// ❌ WRONG - Constructor Injection
export class MyService {
  constructor(private httpClient: HttpClient) {}
}

// ✅ CORRECT - inject() Function
export class MyService {
  private httpClient = inject(HttpClient);

  // Empty constructor as we use inject() pattern
}
```

### 2. Component Selector Naming

**ALL component selectors MUST:**

- Start with `ax-` prefix
- Use kebab-case format
- Be descriptive and meaningful

```typescript
// ❌ WRONG
@Component({
  selector: 'messages',  // Missing prefix
  selector: 'userProfile',  // camelCase instead of kebab-case
})

// ✅ CORRECT
@Component({
  selector: 'ax-messages',
  selector: 'ax-user-profile',
})
```

### 3. Accessibility Requirements

**ALL interactive elements MUST:**

- Have keyboard event handlers alongside click events
- Be focusable (tabindex="0" when needed)
- Include proper ARIA labels
- Support screen readers

```html
<!-- ❌ WRONG - Click only -->
<div (click)="toggle()">Toggle</div>

<!-- ✅ CORRECT - Keyboard + Click + A11y -->
<div (click)="toggle()" (keydown.enter)="toggle()" (keydown.space)="toggle()" tabindex="0" role="button" [attr.aria-label]="buttonLabel">Toggle</div>
```

### 4. TypeScript Quality

**MUST avoid `any` types - Use proper interfaces**

```typescript
// ❌ WRONG
export interface Config {
  settings: any;
  data: any;
}

// ✅ CORRECT
export interface Config {
  settings: AppSettings;
  data: NavigationData;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
}
```

### 5. Unused Variables

**Prefix unused variables with underscore**

```typescript
// ❌ WRONG
private updateNavigation(lang: string): void {
  // lang parameter not used
}

// ✅ CORRECT
private updateNavigation(_lang: string): void {
  // Clearly indicates unused parameter
}
```

### 6. Output Event Naming

**MUST NOT use native DOM event names for @Output()**

```typescript
// ❌ WRONG
@Output() close = new EventEmitter<void>();

// ✅ CORRECT
@Output() navigationClose = new EventEmitter<void>();
@Output() modalClose = new EventEmitter<void>();
```

## 📋 ESLint Configuration

The following ESLint rules are enforced:

```javascript
// Required rules in eslint.config.mjs
{
  '@angular-eslint/prefer-inject': 'error',
  '@angular-eslint/component-selector': ['error', { prefix: 'ax', style: 'kebab-case' }],
  '@angular-eslint/no-output-native': 'error',
  '@angular-eslint/template/click-events-have-key-events': 'error',
  '@angular-eslint/template/interactive-supports-focus': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
}
```

## 🔄 Development Workflow

### Pre-Commit Checks

1. **Lint-staged** runs automatically on staged files
2. **Prettier** formats code automatically
3. **ESLint** fixes auto-fixable issues

### Pre-Push Checks

1. **Full linting** on affected files
2. **Type checking** verification
3. **Build verification**

## 🛠️ Quick Fix Commands

```bash
# Fix linting issues
npx nx run aegisx-ui:lint --fix

# Check specific files
npx eslint libs/aegisx-ui/src/**/*.ts --fix

# Skip hooks for emergency pushes
SKIP_HOOKS=1 git push
```

## 📊 Quality Gates

### Acceptable Limits

- **Errors**: 0 (zero tolerance)
- **Warnings**: < 10 per 100 files
- **Accessibility violations**: 0 (zero tolerance)

### Monitoring

- Pre-push hooks enforce quality gates
- CI/CD pipeline validates all standards
- Regular audits ensure compliance

## 🎓 Training Resources

### Required Reading

1. [Angular Style Guide](https://angular.dev/style-guide)
2. [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
3. [TypeScript Best Practices](https://typescript-eslint.io/rules/)

### Common Patterns

**Service Pattern:**

```typescript
@Injectable({ providedIn: 'root' })
export class AxExampleService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  // Empty constructor as we use inject() pattern

  // Implementation...
}
```

**Component Pattern:**

```typescript
@Component({
  selector: 'ax-example',
  standalone: true,
  imports: [CommonModule],
  template: `...`,
})
export class AxExampleComponent {
  private cdr = inject(ChangeDetectorRef);

  @Output() itemSelected = new EventEmitter<string>();

  // Implementation...
}
```

## 🚨 Enforcement

- **Pre-commit hooks** prevent non-compliant code
- **PR reviews** validate standards adherence
- **CI/CD pipeline** blocks non-compliant builds
- **Regular audits** ensure ongoing compliance

## 📞 Support

For questions or clarifications:

1. Check this document first
2. Review ESLint error messages
3. Consult team lead for exceptions (rare)

---

**Remember: These standards prevent bugs, improve accessibility, and ensure maintainable code. They are mandatory for all AegisX UI library development.**
