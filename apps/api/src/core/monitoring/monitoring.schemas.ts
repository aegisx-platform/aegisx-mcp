import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema,
} from '../../schemas/base.schemas';

// Client error log entry schema
export const ClientErrorLogSchema = Type.Object({
  timestamp: Type.String({ format: 'date-time' }),
  level: Type.Union([
    Type.Literal('error'),
    Type.Literal('warn'),
    Type.Literal('info'),
  ]),
  message: Type.String({ minLength: 1 }),
  url: Type.Optional(Type.String({ minLength: 1 })),
  userAgent: Type.Optional(Type.String()),
  userId: Type.Optional(Type.String()),
  sessionId: Type.Optional(Type.String()),
  correlationId: Type.Optional(Type.String()),
  stack: Type.Optional(Type.String()),
  context: Type.Optional(Type.Record(Type.String(), Type.Any())),
  type: Type.Union([
    Type.Literal('javascript'),
    Type.Literal('http'),
    Type.Literal('angular'),
    Type.Literal('custom'),
  ]),
});

// Client errors request schema
export const ClientErrorsRequestSchema = Type.Object({
  errors: Type.Array(ClientErrorLogSchema, { minItems: 1, maxItems: 50 }),
});

// Performance metric schema
export const PerformanceMetricSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  value: Type.Number({ minimum: 0 }),
  timestamp: Type.Number(),
  url: Type.String({ minLength: 1 }), // Changed from format: 'uri' to allow relative URLs
  userAgent: Type.String(),
  context: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

// User action schema
export const UserActionSchema = Type.Object({
  type: Type.Union([
    Type.Literal('click'),
    Type.Literal('navigation'),
    Type.Literal('form_submit'),
    Type.Literal('custom'),
  ]),
  element: Type.Optional(Type.String()),
  url: Type.String({ minLength: 1 }), // Changed from format: 'uri' to allow relative URLs
  timestamp: Type.Number(),
  duration: Type.Optional(Type.Number({ minimum: 0 })),
  context: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

// Client monitoring data request schema
export const ClientMonitoringRequestSchema = Type.Object({
  performance: Type.Array(PerformanceMetricSchema, { maxItems: 100 }),
  userActions: Type.Array(UserActionSchema, { maxItems: 100 }),
  timestamp: Type.Number(),
  sessionId: Type.String({ minLength: 1 }),
  url: Type.String({ minLength: 1 }), // Changed from format: 'uri' to allow all URLs
});

// Response schemas - Using standard success response wrapper
export const ClientErrorsResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String(),
    errorsProcessed: Type.Number({ minimum: 0 }),
  }),
);

export const ClientMonitoringResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    message: Type.String(),
    metricsProcessed: Type.Number({ minimum: 0 }),
    actionsProcessed: Type.Number({ minimum: 0 }),
  }),
);

// Type exports
export type ClientErrorLog = Static<typeof ClientErrorLogSchema>;
export type ClientErrorsRequest = Static<typeof ClientErrorsRequestSchema>;
export type PerformanceMetric = Static<typeof PerformanceMetricSchema>;
export type UserAction = Static<typeof UserActionSchema>;
export type ClientMonitoringRequest = Static<
  typeof ClientMonitoringRequestSchema
>;
export type ClientErrorsResponse = Static<typeof ClientErrorsResponseSchema>;
export type ClientMonitoringResponse = Static<
  typeof ClientMonitoringResponseSchema
>;

// Export schemas for registration
export const monitoringSchemas = {
  'client-errors-request': ClientErrorsRequestSchema,
  'client-errors-response': ClientErrorsResponseSchema,
  'client-monitoring-request': ClientMonitoringRequestSchema,
  'client-monitoring-response': ClientMonitoringResponseSchema,
};
