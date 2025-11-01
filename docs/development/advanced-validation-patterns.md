# Advanced Validation Patterns

> **Complete guide for implementing robust data validation in enterprise applications**

**Last Updated:** 2025-11-01

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [TypeBox Validation Patterns](#typebox-validation-patterns)
3. [Complex Validation Rules](#complex-validation-rules)
4. [Custom Validators](#custom-validators)
5. [Cross-Field Validation](#cross-field-validation)
6. [Async Validation](#async-validation)
7. [Frontend Validation](#frontend-validation)
8. [Error Message Customization](#error-message-customization)
9. [Validation Testing](#validation-testing)
10. [Validation Checklist](#validation-checklist)

---

## Overview

### Validation Layers

**Defense in Depth:**

1. **Frontend** - Immediate user feedback (Angular validators)
2. **API Schema** - TypeBox request/response validation
3. **Business Logic** - Complex business rules
4. **Database** - Constraints and triggers

### Validation Principles

- ✅ **Fail Fast** - Validate as early as possible
- ✅ **Clear Messages** - User-friendly error messages
- ✅ **Consistent** - Same rules across all layers
- ✅ **Reusable** - Shared validation logic
- ✅ **Testable** - Validate validators

---

## TypeBox Validation Patterns

### Basic Type Validation

```typescript
// apps/api/src/modules/users/users.schemas.ts
import { Type, Static } from '@sinclair/typebox';

// String validation
export const UsernameSchema = Type.String({
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9_-]+$',
  description: 'Username (3-20 chars, alphanumeric)',
});

// Number validation
export const AgeSchema = Type.Integer({
  minimum: 0,
  maximum: 150,
  description: 'Age (0-150)',
});

// Email validation
export const EmailSchema = Type.String({
  format: 'email',
  description: 'Valid email address',
});

// URL validation
export const WebsiteSchema = Type.String({
  format: 'uri',
  pattern: '^https?://',
  description: 'Valid HTTP(S) URL',
});

// UUID validation
export const IdSchema = Type.String({
  format: 'uuid',
  description: 'UUID identifier',
});

// Date validation
export const DateSchema = Type.String({
  format: 'date-time',
  description: 'ISO 8601 date-time',
});

// Enum validation
export const StatusSchema = Type.Union([Type.Literal('active'), Type.Literal('inactive'), Type.Literal('suspended')]);
```

### Complex Object Validation

```typescript
// apps/api/src/modules/users/users.schemas.ts
export const CreateUserSchema = Type.Object({
  username: UsernameSchema,
  email: EmailSchema,
  password: Type.String({
    minLength: 8,
    maxLength: 100,
    description: 'Password (min 8 chars)',
  }),
  firstName: Type.String({
    minLength: 1,
    maxLength: 50,
  }),
  lastName: Type.String({
    minLength: 1,
    maxLength: 50,
  }),
  age: Type.Optional(AgeSchema),
  website: Type.Optional(WebsiteSchema),
  status: Type.Optional(StatusSchema),
});

export type CreateUser = Static<typeof CreateUserSchema>;
```

### Array Validation

```typescript
// Validate array of strings
export const TagsSchema = Type.Array(Type.String(), {
  minItems: 1,
  maxItems: 10,
  uniqueItems: true,
  description: 'Tags (1-10 unique strings)',
});

// Validate array of objects
export const OrderItemsSchema = Type.Array(
  Type.Object({
    productId: IdSchema,
    quantity: Type.Integer({ minimum: 1 }),
    price: Type.Number({ minimum: 0 }),
  }),
  {
    minItems: 1,
    maxItems: 100,
  },
);

export const CreateOrderSchema = Type.Object({
  customerId: IdSchema,
  items: OrderItemsSchema,
  shippingAddress: AddressSchema,
  billingAddress: Type.Optional(AddressSchema),
});
```

### Nested Object Validation

```typescript
// apps/api/src/modules/orders/orders.schemas.ts
export const AddressSchema = Type.Object({
  street: Type.String({ minLength: 1, maxLength: 100 }),
  city: Type.String({ minLength: 1, maxLength: 50 }),
  state: Type.String({ minLength: 2, maxLength: 2 }),
  zipCode: Type.String({
    pattern: '^[0-9]{5}(-[0-9]{4})?$',
    description: 'US ZIP code (12345 or 12345-6789)',
  }),
  country: Type.String({
    minLength: 2,
    maxLength: 2,
    description: 'ISO 3166-1 alpha-2 country code',
  }),
});

export const CustomerSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  email: EmailSchema,
  phone: Type.String({
    pattern: '^\\+?[1-9]\\d{1,14}$',
    description: 'E.164 phone number format',
  }),
  address: AddressSchema, // Nested object
});
```

---

## Complex Validation Rules

### Conditional Validation

```typescript
// apps/api/src/modules/payments/payments.schemas.ts
export const PaymentMethodSchema = Type.Union([
  Type.Literal('credit_card'),
  Type.Literal('bank_transfer'),
  Type.Literal('cash'),
]);

export const CreatePaymentSchema = Type.Object({
  amount: Type.Number({ minimum: 0.01 }),
  method: PaymentMethodSchema,

  // Required only if method is credit_card
  cardNumber: Type.Optional(Type.String({
    pattern: '^[0-9]{16}$',
  })),
  cardExpiry: Type.Optional(Type.String({
    pattern: '^(0[1-9]|1[0-2])\\/[0-9]{2}$',
  })),
  cardCvv: Type.Optional(Type.String({
    pattern: '^[0-9]{3,4}$',
  })),

  // Required only if method is bank_transfer
  bankAccount: Type.Optional(Type.String()),
  bankRouting: Type.Optional(Type.String()),
});

// Service-level validation
async validatePayment(data: CreatePayment) {
  if (data.method === 'credit_card') {
    if (!data.cardNumber || !data.cardExpiry || !data.cardCvv) {
      throw new ValidationError(
        'Card details required for credit card payment'
      );
    }
  }

  if (data.method === 'bank_transfer') {
    if (!data.bankAccount || !data.bankRouting) {
      throw new ValidationError(
        'Bank details required for bank transfer'
      );
    }
  }
}
```

### Date Range Validation

```typescript
// apps/api/src/modules/reports/reports.schemas.ts
export const DateRangeSchema = Type.Object({
  startDate: Type.String({ format: 'date' }),
  endDate: Type.String({ format: 'date' }),
});

// Service validation
async validateDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new ValidationError('End date must be after start date');
  }

  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff > 365) {
    throw new ValidationError('Date range cannot exceed 365 days');
  }
}
```

### Amount Validation

```typescript
// apps/api/src/modules/transactions/transactions.schemas.ts
export const TransactionSchema = Type.Object({
  amount: Type.Number({
    minimum: 0.01,
    maximum: 1000000,
    multipleOf: 0.01, // Ensure 2 decimal places
    description: 'Amount (0.01 - 1,000,000, up to 2 decimals)',
  }),
  currency: Type.String({
    minLength: 3,
    maxLength: 3,
    pattern: '^[A-Z]{3}$',
    description: 'ISO 4217 currency code (e.g., USD, EUR)',
  }),
});

// Service validation for business rules
async validateTransaction(amount: number, accountBalance: number) {
  if (amount > accountBalance) {
    throw new ValidationError('Insufficient funds');
  }

  // Daily limit check
  const dailyTotal = await this.getDailyTotal(userId);
  if (dailyTotal + amount > DAILY_LIMIT) {
    throw new ValidationError(
      `Daily limit exceeded. Remaining: ${DAILY_LIMIT - dailyTotal}`
    );
  }
}
```

---

## Custom Validators

### Reusable Custom Validators

```typescript
// libs/shared/validators/custom.validators.ts
import { Type, TSchema } from '@sinclair/typebox';

/**
 * Password strength validator
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const StrongPasswordSchema = Type.String({
  minLength: 8,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  description: 'Strong password (8+ chars, upper, lower, number, special)',
});

/**
 * Phone number validator (international)
 */
export const PhoneNumberSchema = Type.String({
  pattern: '^\\+?[1-9]\\d{1,14}$',
  description: 'E.164 phone number format (+1234567890)',
});

/**
 * Tax ID validator (US SSN format)
 */
export const TaxIdSchema = Type.String({
  pattern: '^[0-9]{3}-[0-9]{2}-[0-9]{4}$',
  description: 'SSN format (XXX-XX-XXXX)',
});

/**
 * Credit card validator (Luhn algorithm check)
 */
export function validateCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length !== 16) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * File extension validator
 */
export function AllowedFileExtensions(extensions: string[]): TSchema {
  const pattern = `\\.(${extensions.join('|')})$`;
  return Type.String({
    pattern,
    description: `Allowed extensions: ${extensions.join(', ')}`,
  });
}

// Usage
export const DocumentUploadSchema = Type.Object({
  filename: AllowedFileExtensions(['pdf', 'doc', 'docx']),
  size: Type.Integer({
    minimum: 1,
    maximum: 10 * 1024 * 1024, // 10 MB
  }),
});
```

### Business Rule Validators

```typescript
// apps/api/src/modules/inventory/inventory.validators.ts
@Injectable()
export class InventoryValidator {
  constructor(private repository: InventoryRepository) {}

  /**
   * Validate stock availability
   */
  async validateStockAvailability(productId: string, quantity: number): Promise<void> {
    const inventory = await this.repository.findByProductId(productId);

    if (!inventory) {
      throw new ValidationError('Product not found');
    }

    if (inventory.quantity < quantity) {
      throw new ValidationError(`Insufficient stock. Available: ${inventory.quantity}, Requested: ${quantity}`);
    }

    if (inventory.reserved + quantity > inventory.quantity) {
      throw new ValidationError('Stock reserved by other orders');
    }
  }

  /**
   * Validate reorder point
   */
  async validateReorderPoint(productId: string, quantity: number): Promise<void> {
    const inventory = await this.repository.findByProductId(productId);

    if (quantity < inventory.minimumStock) {
      throw new ValidationError(`Quantity below minimum stock level (${inventory.minimumStock})`);
    }
  }
}
```

---

## Cross-Field Validation

### Dependent Field Validation

```typescript
// apps/api/src/modules/appointments/appointments.schemas.ts
export const CreateAppointmentSchema = Type.Object({
  patientId: IdSchema,
  doctorId: IdSchema,
  startTime: Type.String({ format: 'date-time' }),
  endTime: Type.String({ format: 'date-time' }),
  type: Type.Union([
    Type.Literal('checkup'),
    Type.Literal('surgery'),
    Type.Literal('consultation'),
  ]),
});

// Service validation
async validateAppointment(data: CreateAppointment) {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  // Cross-field validation
  if (end <= start) {
    throw new ValidationError('End time must be after start time');
  }

  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  // Business rule: surgery requires minimum 60 minutes
  if (data.type === 'surgery' && durationMinutes < 60) {
    throw new ValidationError('Surgery appointments require minimum 60 minutes');
  }

  // Check doctor availability
  const conflicts = await this.repository.findConflicts(
    data.doctorId,
    data.startTime,
    data.endTime
  );

  if (conflicts.length > 0) {
    throw new ValidationError('Doctor is not available at this time');
  }
}
```

### Password Confirmation

```typescript
// apps/api/src/modules/auth/auth.schemas.ts
export const RegisterSchema = Type.Object({
  email: EmailSchema,
  password: StrongPasswordSchema,
  passwordConfirmation: Type.String(),
});

// Service validation
async validatePasswordMatch(password: string, confirmation: string) {
  if (password !== confirmation) {
    throw new ValidationError('Passwords do not match');
  }
}
```

### Conditional Required Fields

```typescript
// apps/api/src/modules/shipping/shipping.schemas.ts
export const ShippingSchema = Type.Object({
  method: Type.Union([
    Type.Literal('standard'),
    Type.Literal('express'),
    Type.Literal('pickup'),
  ]),
  address: Type.Optional(AddressSchema),
  pickupLocation: Type.Optional(Type.String()),
});

// Service validation
async validateShipping(data: ShippingRequest) {
  if (data.method === 'pickup' && !data.pickupLocation) {
    throw new ValidationError('Pickup location required for pickup method');
  }

  if ((data.method === 'standard' || data.method === 'express') && !data.address) {
    throw new ValidationError('Address required for delivery');
  }
}
```

---

## Async Validation

### Database Uniqueness Check

```typescript
// apps/api/src/modules/users/users.validators.ts
@Injectable()
export class UsersValidator {
  constructor(private repository: UsersRepository) {}

  /**
   * Validate email uniqueness
   */
  async validateEmailUnique(email: string, excludeId?: string): Promise<void> {
    const existing = await this.repository.findByEmail(email);

    if (existing && existing.id !== excludeId) {
      throw new ValidationError('Email already in use');
    }
  }

  /**
   * Validate username uniqueness
   */
  async validateUsernameUnique(username: string, excludeId?: string): Promise<void> {
    const existing = await this.repository.findByUsername(username);

    if (existing && existing.id !== excludeId) {
      throw new ValidationError('Username already taken');
    }
  }

  /**
   * Validate user exists
   */
  async validateUserExists(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.status === 'deleted') {
      throw new ValidationError('User has been deleted');
    }
  }
}
```

### External API Validation

```typescript
// apps/api/src/modules/addresses/address.validators.ts
@Injectable()
export class AddressValidator {
  constructor(private geocodingService: GeocodingService) {}

  /**
   * Validate address with external geocoding service
   */
  async validateAddress(address: Address): Promise<void> {
    try {
      const result = await this.geocodingService.geocode(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`);

      if (!result.success) {
        throw new ValidationError('Invalid address');
      }

      // Optional: Check if coordinates are within service area
      if (!this.isWithinServiceArea(result.coordinates)) {
        throw new ValidationError('Address is outside service area');
      }
    } catch (error) {
      throw new ValidationError('Unable to verify address');
    }
  }

  private isWithinServiceArea(coordinates: Coordinates): boolean {
    // Check if coordinates are within allowed area
    return true;
  }
}
```

---

## Frontend Validation

### Angular Reactive Forms

```typescript
// apps/web/src/app/features/users/create-user-form.component.ts
import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-create-user-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" />
        @if (form.controls.email.hasError('required')) {
          <mat-error>Email is required</mat-error>
        }
        @if (form.controls.email.hasError('email')) {
          <mat-error>Invalid email format</mat-error>
        }
        @if (form.controls.email.hasError('emailTaken')) {
          <mat-error>Email already in use</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" type="password" />
        @if (form.controls.password.hasError('required')) {
          <mat-error>Password is required</mat-error>
        }
        @if (form.controls.password.hasError('minlength')) {
          <mat-error>Password must be at least 8 characters</mat-error>
        }
        @if (form.controls.password.hasError('weakPassword')) {
          <mat-error>Password must contain uppercase, lowercase, number, and special character</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Confirm Password</mat-label>
        <input matInput formControlName="passwordConfirmation" type="password" />
        @if (form.hasError('passwordMismatch')) {
          <mat-error>Passwords do not match</mat-error>
        }
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Create User</button>
    </form>
  `,
})
export class CreateUserFormComponent {
  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email], [this.emailTakenValidator.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      passwordConfirmation: ['', Validators.required],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
  ) {}

  /**
   * Custom validator: Strong password
   */
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

    return valid ? null : { weakPassword: true };
  }

  /**
   * Custom validator: Password match
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmation = control.get('passwordConfirmation')?.value;

    return password === confirmation ? null : { passwordMismatch: true };
  }

  /**
   * Async validator: Email uniqueness
   */
  async emailTakenValidator(control: AbstractControl): Promise<ValidationErrors | null> {
    if (!control.value) {
      return null;
    }

    const taken = await this.userService.checkEmailExists(control.value);
    return taken ? { emailTaken: true } : null;
  }

  async onSubmit() {
    if (this.form.valid) {
      const result = await this.userService.create(this.form.value);
      // Handle success
    }
  }
}
```

### Custom Angular Validators

```typescript
// apps/web/src/app/shared/validators/custom.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Date range validator
 */
export function dateRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return end > start ? null : { invalidDateRange: true };
  };
}

/**
 * Phone number validator
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value) ? null : { invalidPhone: true };
  };
}

/**
 * File size validator
 */
export function maxFileSizeValidator(maxSizeInMB: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;

    if (!file) {
      return null;
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    return file.size <= maxSizeInBytes ? null : { maxFileSize: { maxSize: maxSizeInMB, actualSize: file.size / (1024 * 1024) } };
  };
}
```

---

## Error Message Customization

### Backend Error Messages

```typescript
// apps/api/src/utils/validation-error.ts
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handler
export const validationErrorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error.validation) {
    // TypeBox validation error
    const errors = error.validation.map((err: any) => ({
      field: err.instancePath?.replace('/', '') || 'body',
      message: err.message,
      code: err.keyword,
    }));

    return reply.code(400).send({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    });
  }

  if (error instanceof ValidationError) {
    return reply.code(400).send({
      success: false,
      error: error.code || 'VALIDATION_ERROR',
      message: error.message,
      field: error.field,
      details: error.details,
    });
  }

  // Default error handling
  return reply.code(500).send({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'An error occurred',
  });
};
```

### Custom Error Messages

```typescript
// apps/api/src/modules/users/users.schemas.ts
export const CreateUserSchema = Type.Object(
  {
    email: Type.String({
      format: 'email',
      errorMessage: {
        format: 'Please provide a valid email address',
      },
    }),
    password: Type.String({
      minLength: 8,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])',
      errorMessage: {
        minLength: 'Password must be at least 8 characters long',
        pattern: 'Password must contain uppercase, lowercase, number, and special character',
      },
    }),
    age: Type.Integer({
      minimum: 18,
      maximum: 150,
      errorMessage: {
        minimum: 'You must be at least 18 years old',
        maximum: 'Invalid age value',
      },
    }),
  },
  {
    additionalProperties: false,
    errorMessage: {
      additionalProperties: 'Unknown field: ${0}',
    },
  },
);
```

---

## Validation Testing

### Testing TypeBox Schemas

```typescript
// apps/api/src/modules/users/users.schemas.spec.ts
import { Value } from '@sinclair/typebox/value';

describe('CreateUserSchema', () => {
  it('should validate valid user data', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'Test123!@#',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = Value.Check(CreateUserSchema, validUser);
    expect(result).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidUser = {
      email: 'invalid-email',
      password: 'Test123!@#',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = Value.Check(CreateUserSchema, invalidUser);
    expect(result).toBe(false);
  });

  it('should reject weak password', () => {
    const weakPassword = {
      email: 'test@example.com',
      password: 'weak',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = Value.Check(CreateUserSchema, weakPassword);
    expect(result).toBe(false);
  });
});
```

### Testing Custom Validators

```typescript
// libs/shared/validators/__tests__/custom.validators.spec.ts
describe('validateCreditCard', () => {
  it('should validate valid credit card number', () => {
    expect(validateCreditCard('4532015112830366')).toBe(true);
  });

  it('should reject invalid credit card number', () => {
    expect(validateCreditCard('1234567812345678')).toBe(false);
  });

  it('should reject non-numeric input', () => {
    expect(validateCreditCard('abcd-efgh-ijkl-mnop')).toBe(false);
  });
});
```

### Testing Async Validators

```typescript
// apps/api/src/modules/users/users.validators.spec.ts
describe('UsersValidator', () => {
  let validator: UsersValidator;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    repository = {
      findByEmail: jest.fn(),
    } as any;

    validator = new UsersValidator(repository);
  });

  describe('validateEmailUnique', () => {
    it('should pass if email is unique', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(validator.validateEmailUnique('new@example.com')).resolves.not.toThrow();
    });

    it('should throw if email exists', async () => {
      repository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'existing@example.com',
      } as any);

      await expect(validator.validateEmailUnique('existing@example.com')).rejects.toThrow(ValidationError);
    });

    it('should pass if email belongs to same user', async () => {
      repository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);

      await expect(validator.validateEmailUnique('test@example.com', 'user-123')).resolves.not.toThrow();
    });
  });
});
```

---

## Validation Checklist

### ✅ Schema Design

- [ ] All request schemas defined with TypeBox
- [ ] Response schemas defined for type safety
- [ ] Field constraints specified (min/max, pattern, format)
- [ ] Optional vs required fields clearly marked
- [ ] Enum values defined with Type.Union
- [ ] Nested objects validated
- [ ] Array validation with min/max items

### ✅ Backend Validation

- [ ] TypeBox schemas registered in routes
- [ ] Custom validators created for complex rules
- [ ] Cross-field validation implemented
- [ ] Async validation for uniqueness checks
- [ ] Business rule validation in services
- [ ] Clear error messages
- [ ] Validation errors return 400 status

### ✅ Frontend Validation

- [ ] Angular validators match backend schemas
- [ ] Custom validators for complex rules
- [ ] Async validators for uniqueness
- [ ] Error messages displayed to users
- [ ] Submit button disabled when form invalid
- [ ] Visual feedback (red borders, error text)

### ✅ Testing

- [ ] Unit tests for schemas
- [ ] Unit tests for custom validators
- [ ] Integration tests for async validators
- [ ] Test valid and invalid data
- [ ] Test edge cases
- [ ] Test error messages

### ✅ Documentation

- [ ] Schema fields documented
- [ ] Validation rules explained
- [ ] Error codes documented
- [ ] Examples provided

---

## Best Practices Summary

### DO ✅

- **Use TypeBox** - Schema-first validation
- **Validate early** - Frontend and backend
- **Clear messages** - User-friendly error text
- **Test validators** - Unit and integration tests
- **Reuse schemas** - Shared validation logic
- **Async validation** - Check uniqueness
- **Cross-field validation** - Dependent fields

### DON'T ❌

- **Don't trust client** - Always validate backend
- **Don't expose internals** - Sanitize error messages
- **Don't skip testing** - Validators need tests
- **Don't hardcode** - Use schemas for consistency
- **Don't ignore UX** - Show clear feedback

---

## Related Standards

- **[Security Best Practices](./security-best-practices.md)** - Input validation security
- **[TypeBox Schema Standard](../05c-typebox-schema-standard.md)** - Schema patterns

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
