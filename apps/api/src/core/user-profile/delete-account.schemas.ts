import { Type } from '@sinclair/typebox';
import { ApiSuccessResponseSchema, ApiMetaSchema } from '../../schemas/base.schemas';

// Delete Account Request Schema
export const DeleteAccountRequestSchema = Type.Object({
  confirmation: Type.String({
    pattern: '^DELETE$',
    description: 'Must be exactly "DELETE" to confirm account deletion'
  }),
  password: Type.String({
    minLength: 8,
    description: 'Current password for additional security verification'
  }),
  reason: Type.Optional(Type.String({
    minLength: 1,
    maxLength: 500,
    description: 'Optional reason for account deletion'
  }))
});

// Delete Account Data Schema
export const DeleteAccountDataSchema = Type.Object({
  message: Type.String({
    description: 'Confirmation message'
  }),
  deletedAt: Type.String({
    format: 'date-time',
    description: 'Timestamp when account was marked for deletion'
  }),
  recoveryPeriod: Type.String({
    description: 'Period during which account can be recovered'
  }),
  recoveryDeadline: Type.String({
    format: 'date-time',
    description: 'Last date account can be recovered'
  })
});

// Delete Account Response Schema
export const DeleteAccountResponseSchema = ApiSuccessResponseSchema(
  DeleteAccountDataSchema
);

// Specific Error Responses for Delete Account
export const InvalidConfirmationResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('INVALID_CONFIRMATION'),
    message: Type.String({
      default: 'Confirmation text must be exactly "DELETE"'
    }),
    statusCode: Type.Literal(400),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

export const IncorrectPasswordResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('INCORRECT_PASSWORD'),
    message: Type.String({
      default: 'Current password is incorrect'
    }),
    statusCode: Type.Literal(401),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

export const AccountAlreadyDeletedResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('ACCOUNT_ALREADY_DELETED'),
    message: Type.String({
      default: 'Account is already marked for deletion'
    }),
    statusCode: Type.Literal(409),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

// Type definitions for TypeScript
export type DeleteAccountRequest = {
  confirmation: string;
  password: string;
  reason?: string;
};

export type DeleteAccountData = {
  message: string;
  deletedAt: string;
  recoveryPeriod: string;
  recoveryDeadline: string;
};

export type DeleteAccountResponse = {
  success: true;
  data: DeleteAccountData;
  meta?: any;
};