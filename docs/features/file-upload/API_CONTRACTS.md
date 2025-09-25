# File Upload API Contracts

> **📋 API-First Documentation** - Complete API specification for file upload system

## 🚀 Base URL

```
http://localhost:3333/api/files
```

## 🔐 Authentication

Most endpoints require Bearer token authentication except:

- `GET /:id/download` - **Public access** for browser image previews

```http
Authorization: Bearer <jwt_token>
```

## 📊 API Endpoints

### 1. Upload Single File

**Endpoint**: `POST /upload`
**Auth**: Required
**Content-Type**: `multipart/form-data`

#### Request Body (multipart/form-data)

- `file` (required): The file to upload
- `category` (optional): File category (image, document, avatar, etc.)
- `isPublic` (optional): Whether file should be publicly accessible (boolean)
- `isTemporary` (optional): Whether file is temporary (boolean)
- `expiresIn` (optional): Expiration time in hours (1-8760)
- `metadata` (optional): Additional metadata (JSON object)

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalName": "filename.jpg",
    "filename": "sanitized-filename.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 1024000,
    "fileCategory": "image",
    "fileType": "image",
    "isPublic": true,
    "isTemporary": false,
    "expiresAt": null,
    "downloadUrl": "/api/files/{id}/download",
    "metadata": {},
    "variants": {
      "thumbnail": "/api/files/{id}/download?variant=thumbnail",
      "small": "/api/files/{id}/download?variant=small",
      "medium": "/api/files/{id}/download?variant=medium"
    },
    "processingStatus": "completed",
    "uploadedAt": "2025-09-19T11:17:01.000Z",
    "updatedAt": "2025-09-19T11:17:01.000Z"
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0",
    "warnings": []
  }
}
```

#### Error Responses

- `400` - No file provided or validation error
- `401` - Authentication required
- `413` - File too large
- `500` - Server error

---

### 2. Upload Multiple Files

**Endpoint**: `POST /upload/multiple`
**Auth**: Required
**Content-Type**: `multipart/form-data`

#### Request Body (multipart/form-data)

- `files` (required): Multiple files to upload
- Same optional fields as single upload (applied to all files)

#### Response (201 Created / 207 Multi-Status)

```json
{
  "success": true,
  "data": {
    "uploaded": [
      // Array of UploadedFile objects (same as single upload)
    ],
    "failed": [
      {
        "filename": "failed-file.jpg",
        "error": "File too large",
        "code": "FILE_TOO_LARGE"
      }
    ],
    "summary": {
      "total": 3,
      "uploaded": 2,
      "failed": 1,
      "totalSize": 2048000
    }
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0"
  }
}
```

---

### 3. List User Files

**Endpoint**: `GET /`
**Auth**: Required

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-100, default: 25)
- `category` (optional): Filter by file category
- `type` (optional): Filter by file type
- `isPublic` (optional): Filter by public status (boolean)
- `isTemporary` (optional): Filter by temporary status (boolean)
- `sort` (optional): Sort field (created_at, uploaded_at, file_size, original_name, mime_type)
- `order` (optional): Sort order (asc, desc)
- `search` (optional): Search in filename

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    // Array of UploadedFile objects
  ],
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0",
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 100,
      "totalPages": 4
    }
  }
}
```

---

### 4. Get File Metadata

**Endpoint**: `GET /:id`
**Auth**: Required

#### Path Parameters

- `id` (required): File UUID

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    // UploadedFile object (same structure as upload response)
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0"
  }
}
```

#### Error Responses

- `401` - Authentication required
- `404` - File not found
- `500` - Server error

---

### 5. Download File Content

**Endpoint**: `GET /:id/download`
**Auth**: **NOT REQUIRED** (Public access for browser image previews)

#### Path Parameters

- `id` (required): File UUID

#### Query Parameters

- `variant` (optional): Download specific variant (thumbnail, small, medium, large)
- `inline` (optional): Whether to display inline or force download (boolean)

#### Response (200 OK)

- **Content-Type**: Original file MIME type
- **Content-Disposition**: inline or attachment
- **Cache-Control**: public, max-age=3600
- **Body**: Binary file content

#### Error Responses

- `404` - File not found
- `500` - Server error

#### **Important Notes**:

- **No authentication required** to support browser image previews (`<img src="...">`)
- Access is logged with user ID if available, otherwise as "anonymous"
- Public files are accessible without restrictions
- Private files may require additional authorization logic (TBD)

---

### 6. Update File Metadata

**Endpoint**: `PUT /:id`
**Auth**: Required

#### Path Parameters

- `id` (required): File UUID

#### Request Body

```json
{
  "originalName": "new-filename.jpg",
  "isPublic": true,
  "isTemporary": false,
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "metadata": {
    "description": "Updated description"
  }
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    // Updated UploadedFile object
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0"
  }
}
```

---

### 7. Delete File

**Endpoint**: `DELETE /:id`
**Auth**: Required

#### Path Parameters

- `id` (required): File UUID

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "deleted": true,
    "deletedAt": "2025-09-19T11:17:01.000Z"
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0"
  }
}
```

---

### 8. Get User File Statistics

**Endpoint**: `GET /stats` or `GET /stats/user`
**Auth**: Required

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "totalFiles": 25,
    "totalSize": 52428800,
    "publicFiles": 15,
    "temporaryFiles": 3,
    "categories": {
      "image": 20,
      "document": 3,
      "avatar": 2
    }
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0"
  }
}
```

---

### 9. Process Image

**Endpoint**: `POST /:id/process`
**Auth**: Required

#### Path Parameters

- `id` (required): File UUID

#### Request Body

```json
{
  "operations": {
    "resize": {
      "width": 800,
      "height": 600,
      "fit": "cover"
    },
    "format": "webp",
    "quality": 85,
    "blur": 0,
    "sharpen": true,
    "grayscale": false
  },
  "createVariant": true,
  "variantName": "processed"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "originalFileId": "uuid",
    "variantId": "uuid",
    "processedUrl": "/api/files/{variantId}/download",
    "operations": {
      "resize": { "width": 800, "height": 600, "fit": "cover" },
      "format": "webp",
      "quality": 85
    },
    "processedAt": "2025-09-19T11:17:01.000Z"
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0"
  }
}
```

---

### 10. Generate Signed URL

**Endpoint**: `POST /:id/signed-url`
**Auth**: Required

#### Path Parameters

- `id` (required): File UUID

#### Request Body

```json
{
  "expiresIn": 3600,
  "permissions": ["read", "download"]
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "url": "https://example.com/signed-url-with-token",
    "expiresAt": "2025-09-19T12:17:01.000Z",
    "permissions": ["read", "download"]
  },
  "meta": {
    "requestId": "req-id",
    "timestamp": "2025-09-19T11:17:01.000Z",
    "version": "1.0"
  }
}
```

---

## 🔧 File Processing & Variants

### Automatic Image Processing

When image files are uploaded, the system automatically generates variants:

- **thumbnail**: 150x150px (square crop)
- **small**: 400px width (maintain aspect ratio)
- **medium**: 800px width (maintain aspect ratio)

### Access Variants

```http
GET /api/files/{id}/download?variant=thumbnail
GET /api/files/{id}/download?variant=small
GET /api/files/{id}/download?variant=medium
```

---

## 🚨 Error Codes

### File Upload Specific Errors (Schema: `FileUploadErrorSchema`)

- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - File type not allowed
- `VIRUS_DETECTED` - File contains malware
- `STORAGE_FULL` - Storage quota exceeded
- `UPLOAD_INCOMPLETE` - Upload was interrupted
- `FILE_CORRUPTED` - File data is corrupted
- `PROCESSING_FAILED` - Image processing failed
- `FILE_NOT_FOUND` - File does not exist
- `ACCESS_DENIED` - User lacks permission
- `QUOTA_EXCEEDED` - User quota exceeded

### Standard Error Responses

All endpoints also use standard error schemas:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Implementation Notes

### Current Issues Identified

1. **Schema Validation Error**: Download endpoint error serialization doesn't match schema definition
2. **Authentication Inconsistency**: Download route marked as "no auth required" but still triggers auth validation
3. **Error Response Schema**: Error codes in responses don't match the defined `FileUploadErrorSchema`

### Frontend Integration

- **Thumbnail Preview**: Use `GET /api/files/{id}/download` directly in `<img>` tags
- **File Upload**: Use `FormData` with `POST /upload` or `POST /upload/multiple`
- **File Management**: Use list, get, update, delete endpoints for file management UI

### Browser Image Preview Support

The download endpoint is specifically designed to work with browser image previews:

```html
<img src="http://localhost:3333/api/files/{id}/download" alt="File preview" /> <img src="http://localhost:3333/api/files/{id}/download?variant=thumbnail" alt="Thumbnail" />
```

This requires **no authentication** to work properly with browser image loading.
