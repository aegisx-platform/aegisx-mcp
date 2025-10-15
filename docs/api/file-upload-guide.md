# File Upload API Guide

## Overview

Complete guide for implementing file upload functionality with multipart/form-data support, Swagger UI integration, and TypeBox validation bypass.

## Problem & Solution

### Original Problem

- TypeBox type provider conflicts with multipart/form-data validation
- Swagger UI doesn't show browse button without body schema
- `setValidatorCompiler` gets overridden by TypeBox
- JSON.parse errors when metadata field contains invalid JSON

### Solution Applied

Instead of overriding global validator, use route-level validation control:

```typescript
fastify.post('/upload', {
  schema: {
    body: {
      /* Complete schema for Swagger UI */
    },
    // ... other schema properties
  },
  attachValidation: true, // 🔑 KEY: Skip validation errors
  handler: controller.uploadSingleFile,
});
```

## Implementation Steps

### 1. Route Configuration

**File:** `apps/api/src/modules/file-upload/file-upload.routes.ts`

```typescript
// Upload single file
fastify.post('/upload', {
  schema: {
    tags: ['File Upload'],
    summary: 'Upload a single file',
    description: 'Upload a single file with optional metadata and processing options. Send as multipart/form-data with file and optional fields.',
    consumes: ['multipart/form-data'],
    body: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (required)',
        },
        category: {
          type: 'string',
          description: 'File category (avatar, document, image, media)',
        },
        isPublic: {
          type: 'string',
          enum: ['true', 'false'],
          description: 'Whether the file should be publicly accessible',
        },
        isTemporary: {
          type: 'string',
          enum: ['true', 'false'],
          description: 'Whether the file is temporary and should be auto-deleted',
        },
        expiresIn: {
          type: 'string',
          description: 'Expiration time in seconds for temporary files',
        },
        allowDuplicates: {
          type: 'string',
          enum: ['true', 'false'],
          description: 'Whether to allow duplicate files based on hash',
        },
        metadata: {
          type: 'string',
          description: 'JSON string containing additional metadata',
        },
      },
      required: ['file'],
    },
    response: {
      201: FileUploadResponseSchema,
      400: StandardRouteResponses[400],
      401: StandardRouteResponses[401],
      403: StandardRouteResponses[403],
      404: StandardRouteResponses[404],
      413: FileUploadErrorSchema,
      500: StandardRouteResponses[500],
    },
    security: [{ bearerAuth: [] }],
  },
  attachValidation: true, // 🔑 Skip validation errors
  preHandler: [fastify.authenticate],
  handler: controller.uploadSingleFile.bind(controller),
});
```

### 2. Controller Modifications

**File:** `apps/api/src/modules/file-upload/file-upload.controller.ts`

Add helper methods to safely parse multipart form fields:

```typescript
/**
 * Parse string boolean values from multipart form data
 */
private parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    if (lowercased === 'true') return true;
    if (lowercased === 'false') return false;
  }
  return undefined;
}

/**
 * Parse metadata JSON string from multipart form data
 */
private parseMetadata(value: string): Record<string, any> | undefined {
  if (!value || value === 'string') return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    // If not valid JSON, return undefined instead of throwing error
    return undefined;
  }
}
```

Use in upload handler:

```typescript
const uploadRequest: FileUploadRequest = {
  category: fields.category,
  isPublic: this.parseBoolean(fields.isPublic),
  isTemporary: this.parseBoolean(fields.isTemporary),
  expiresIn: fields.expiresIn ? Number(fields.expiresIn) : undefined,
  allowDuplicates: this.parseBoolean(fields.allowDuplicates),
  metadata: fields.metadata ? this.parseMetadata(fields.metadata) : undefined,
};
```

### 3. Global Multipart Plugin

**File:** `apps/api/src/plugins/multipart.plugin.ts`

```typescript
async function multipartPlugin(fastify: FastifyInstance, opts: MultipartPluginOptions = {}) {
  const options = {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    maxFieldSize: 10 * 1024 * 1024, // 10MB
    maxFields: 20,
    ...opts,
  };

  // Register multipart plugin with autoContentTypeParser: false as per docs
  await fastify.register(require('@aegisx/fastify-multipart'), {
    limits: {
      fileSize: options.maxFileSize,
      files: options.maxFiles,
      fieldSize: options.maxFieldSize,
      fields: options.maxFields,
    },
    autoContentTypeParser: false, // Disable auto parser for Swagger integration
  });

  // Add custom content type parser for multipart/form-data
  fastify.addContentTypeParser('multipart/form-data', function (_request, payload, done) {
    done(null, payload);
  });

  // Note: TypeBox type provider is set before this plugin, so we need to work with it
  // instead of trying to override the validator compiler completely.
  // The solution is to use attachValidation: true on routes that need validation bypass.

  fastify.log.info('AegisX Multipart plugin registered successfully with Swagger integration');
}
```

## Usage Examples

### 1. Frontend Service Call

```typescript
uploadFile(file: File, options: FileUploadOptions = {}): Observable<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (options.category) formData.append('category', options.category);
  if (options.isPublic !== undefined) formData.append('isPublic', options.isPublic.toString());
  if (options.isTemporary !== undefined) formData.append('isTemporary', options.isTemporary.toString());
  if (options.expiresIn) formData.append('expiresIn', options.expiresIn.toString());
  if (options.allowDuplicates !== undefined) formData.append('allowDuplicates', options.allowDuplicates.toString());
  if (options.metadata) formData.append('metadata', JSON.stringify(options.metadata));

  return this.http.post<FileUploadResponse>(`${this.baseUrl}/upload`, formData);
}
```

### 2. cURL Command

```bash
curl -X 'POST' \
  'http://localhost:3333/api/files/upload' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@example.jpg;type=image/jpeg' \
  -F 'category=image' \
  -F 'isPublic=true' \
  -F 'allowDuplicates=true' \
  -F 'metadata={"description":"Profile photo","source":"upload"}'
```

### 3. Swagger UI

Navigate to `/documentation` (default port: 3333) and expand the "File Upload" section. You will see:

- ✅ Browse button for file selection
- ✅ All form fields with descriptions
- ✅ Proper multipart/form-data content type
- ✅ Working "Try it out" functionality

## Response Format

### Successful Upload Response

```json
{
  "success": true,
  "data": {
    "id": "583701ac-4dca-402c-aeaa-16519f1c7e14",
    "originalName": "example.jpg",
    "filename": "1758526072225_example.jpg",
    "filepath": "583701ac-4dca-402c-aeaa-16519f1c7e14/file/2025/09/22/1758526072225_example.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 2048,
    "fileCategory": "image",
    "fileType": "image",
    "isPublic": true,
    "isTemporary": false,
    "expiresAt": null,
    "metadata": {
      "description": "Profile photo",
      "source": "upload",
      "uploadedAt": "2025-09-22T07:27:52.225Z",
      "originalSize": 2048
    },
    "variants": {},
    "processingStatus": "completed",
    "uploadedBy": "dec7e996-28fd-4e68-a32b-b839d9f4150c",
    "uploadedAt": "2025-09-22T07:27:52.227Z",
    "updatedAt": "2025-09-22T07:27:52.227Z",
    "signedUrls": {
      "view": "http://localhost:4200/api/files/583701ac-4dca-402c-aeaa-16519f1c7e14/view?token=...",
      "download": "http://localhost:4200/api/files/583701ac-4dca-402c-aeaa-16519f1c7e14/download?token=...",
      "thumbnail": "http://localhost:4200/api/files/583701ac-4dca-402c-aeaa-16519f1c7e14/thumbnail?token=..."
    }
  },
  "meta": {
    "requestId": "8fe18684-5ff2-4c19-9389-59626f11a6bc",
    "timestamp": "2025-09-22T07:27:52.240Z",
    "version": "1.0"
  }
}
```

## Key Benefits

1. **🎯 No Global Validator Override**: Uses `attachValidation: true` instead of `setValidatorCompiler`
2. **📚 Complete Swagger Integration**: Browse buttons work perfectly
3. **🛡️ Type Safety**: TypeBox validation still works, but doesn't block requests
4. **🔄 Error Resilience**: Safe parsing for all multipart fields
5. **📱 Immediate Preview**: Signed URLs returned instantly for frontend use

## Troubleshooting

### Common Issues

1. **No browse button in Swagger**
   - ✅ Ensure `consumes: ['multipart/form-data']` is set
   - ✅ Include complete `body` schema
   - ✅ Use `attachValidation: true`

2. **Validation errors with multipart data**
   - ✅ Add `attachValidation: true` to route
   - ✅ Handle validation in controller with safe parsing methods

3. **JSON.parse errors with metadata**
   - ✅ Use `parseMetadata()` helper method
   - ✅ Check for invalid values like `"string"` before parsing

4. **allowDuplicates not working**
   - ✅ Ensure frontend sends `allowDuplicates.toString()`
   - ✅ Use `parseBoolean()` helper in controller

## Related Files

- `apps/api/src/plugins/multipart.plugin.ts` - Global multipart configuration
- `apps/api/src/modules/file-upload/file-upload.routes.ts` - Route definitions
- `apps/api/src/modules/file-upload/file-upload.controller.ts` - Request handling
- `apps/api/src/modules/file-upload/file-upload.schemas.ts` - TypeBox schemas
- `apps/web/src/app/shared/components/file-upload/file-upload.service.ts` - Frontend service

---

**📝 This approach successfully solves the TypeBox + multipart validation conflict while maintaining full Swagger UI functionality.**
