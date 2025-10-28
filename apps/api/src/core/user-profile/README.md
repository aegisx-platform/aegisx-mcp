# User Profile API Module

This module provides comprehensive user profile management functionality for the AegisX platform, including profile data management, avatar uploads with automatic thumbnail generation, and user preferences handling.

## Features

- **User Profile Management**: Retrieve and update user profile information
- **Avatar Upload & Processing**: Support for JPEG, PNG, and WebP images with automatic thumbnail generation
- **User Preferences**: Comprehensive preference management for themes, layouts, notifications, and navigation
- **File Management**: Secure file upload handling with size limits and type validation
- **Database Integration**: Full integration with PostgreSQL using Knex.js migrations

## API Endpoints

### Profile Management

#### Get User Profile
```
GET /api/users/profile
Authorization: Bearer {jwt_token}
```

Returns the complete user profile including role information and preferences.

#### Update User Profile
```
PUT /api/users/profile
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "John Smith",
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "timezone": "America/New_York"
  }
}
```

### Avatar Management

#### Upload Avatar
```
POST /api/users/avatar
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [image file]
```

**Supported formats**: JPEG, PNG, WebP  
**Maximum size**: 5MB  
**Generated thumbnails**: 64x64 (small), 128x128 (medium), 256x256 (large)

#### Delete Avatar
```
DELETE /api/users/avatar
Authorization: Bearer {jwt_token}
```

### Preferences Management

#### Get User Preferences
```
GET /api/users/preferences
Authorization: Bearer {jwt_token}
```

#### Update User Preferences
```
PUT /api/users/preferences
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "theme": "dark",
  "scheme": "dark",
  "layout": "compact",
  "language": "en",
  "timezone": "UTC",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h",
  "notifications": {
    "email": true,
    "push": false,
    "desktop": true,
    "sound": true
  },
  "navigation": {
    "collapsed": false,
    "type": "default",
    "position": "left"
  }
}
```

## Database Schema

### Users Table Extensions
- `avatar_url`: URL to the user's avatar image
- `name`: Full name (computed or set directly)
- `status`: Account status (active, inactive, suspended, pending)
- `email_verified`: Email verification status
- `two_factor_enabled`: Two-factor authentication status

### User Preferences Table
- Theme preferences (theme, scheme, layout)
- Localization (language, timezone, date/time formats)
- Navigation preferences (collapsed, type, position)
- Notification settings (email, push, desktop, sound)

### Avatar Files Table
- File metadata storage
- Original filename and MIME type
- File size and storage path
- Thumbnail URLs and metadata
- Automatic cleanup on user deletion

## File Structure

```
user-profile/
├── index.ts                           # Module exports
├── user-profile.types.ts              # TypeScript interfaces
├── user-profile.schemas.ts            # Fastify JSON schemas
├── user-profile.repository.ts         # Database operations
├── user-profile.controller.ts         # HTTP request handlers
├── user-profile.routes.ts             # Route definitions
├── user-profile.plugin.ts             # Fastify plugin
├── services/
│   ├── user-profile.service.ts        # Business logic
│   └── avatar.service.ts              # File upload & processing
└── __tests__/
    ├── user-profile.service.spec.ts   # Service unit tests
    ├── user-profile.repository.spec.ts # Repository unit tests
    └── user-profile.integration.spec.ts # API integration tests
```

## Architecture

### Service Layer
- **UserProfileService**: Core business logic for profile management
- **AvatarService**: File upload, image processing, and thumbnail generation

### Repository Layer
- **UserProfileRepository**: Database operations with proper transaction handling

### Controller Layer
- **UserProfileController**: HTTP request/response handling with validation

## Image Processing

The avatar service uses Sharp for image processing:

- **Optimization**: Images are optimized for web delivery
- **Resizing**: Original images resized to 512x512 maximum
- **Thumbnails**: Automatic generation of small, medium, and large thumbnails
- **Format**: All images converted to JPEG for consistency
- **Quality**: Optimized quality settings (90% for originals, 80% for thumbnails)

## Security Features

- **Authentication**: JWT token required for all endpoints
- **File Validation**: MIME type and file size validation
- **Path Security**: Prevention of directory traversal attacks
- **Input Sanitization**: All user inputs properly validated and sanitized

## Error Handling

The module provides comprehensive error handling:

- **UNSUPPORTED_MEDIA_TYPE**: Invalid file format
- **FILE_TOO_LARGE**: File exceeds 5MB limit
- **AVATAR_NOT_FOUND**: No avatar exists for deletion
- **INVALID_TIMEZONE**: Invalid timezone format
- **INVALID_LANGUAGE_CODE**: Invalid ISO 639-1 language code

## Usage Example

```typescript
import { userProfilePlugin } from './modules/user-profile';

// Register the plugin
await fastify.register(userProfilePlugin);

// Access services (for testing or other modules)
const userProfile = await fastify.userProfileService.getUserProfile('user-123');
```

## Testing

The module includes comprehensive tests:

- **Unit Tests**: Service and repository layer testing
- **Integration Tests**: API endpoint testing with mocked dependencies
- **Error Cases**: Complete error scenario coverage

Run tests:
```bash
npm test -- user-profile
```

## Static File Serving

Avatar files are served through the static files plugin:

```
GET /api/uploads/avatars/{filename}
```

Features:
- Security checks for file extensions
- Directory traversal protection
- Appropriate MIME type headers
- Caching headers for performance
- ETag support

## Dependencies

- **sharp**: Image processing and thumbnail generation
- **@fastify/multipart**: File upload handling
- **uuid**: Unique filename generation
- **@fastify/jwt**: Authentication
- **knex**: Database operations

## Configuration

Environment variables:
- `API_BASE_URL`: Base URL for avatar file serving
- `NODE_ENV`: Environment (affects file paths and security)

Default upload directory: `uploads/avatars/`

## Migration Notes

The module requires the following migrations to be run:
- `004_extend_users_table.ts`: User table extensions
- `005_create_user_preferences.ts`: User preferences table

## Future Enhancements

- Background job for orphaned file cleanup
- Image format preservation options
- Advanced image filters and transformations
- Bulk avatar operations
- Avatar history and versioning